import "server-only";

import type {
  StoryChapterView,
  StoryChoiceView,
  StoryDecisionView,
  StoryDetailView,
  StoryListItem,
} from "@/entities/story/types";
import { Prisma } from "@/lib/db/generated/client";
import { prisma } from "@/lib/db/client";
import { ResourceNotFoundError } from "@/lib/errors/app-error";
import { slugify } from "@/lib/utils";
import {
  chooseStoryPathSchema,
  createStoryInputSchema,
} from "@/lib/validations/story";
import { getChapterAccessState } from "@/server/access/access.service";
import { consumeNextChapterEntitlement } from "@/server/monetization/entitlement.service";
import { getStoryGenerationProvider } from "@/server/story-generation/provider";

function mapChoice(choice: {
  id: string;
  key: string;
  label: string;
  outcomeHint: string | null;
}): StoryChoiceView {
  return {
    id: choice.id,
    key: choice.key,
    label: choice.label,
    outcomeHint: choice.outcomeHint,
  };
}

function mapChapter(chapter: {
  id: string;
  number: number;
  title: string;
  summary: string;
  content: string;
  createdAt: Date;
  choices: Array<{
    id: string;
    key: string;
    label: string;
    outcomeHint: string | null;
  }>;
}): StoryChapterView {
  return {
    id: chapter.id,
    number: chapter.number,
    title: chapter.title,
    summary: chapter.summary,
    content: chapter.content,
    createdAt: chapter.createdAt,
    choices: chapter.choices.map(mapChoice),
  };
}

function mapDecision(decision: {
  id: string;
  chapterNumber: number;
  selectedLabel: string;
  resolutionSummary: string;
  createdAt: Date;
}): StoryDecisionView {
  return {
    id: decision.id,
    chapterNumber: decision.chapterNumber,
    selectedLabel: decision.selectedLabel,
    resolutionSummary: decision.resolutionSummary,
    createdAt: decision.createdAt,
  };
}

async function createUniqueStorySlug(title: string) {
  const base = slugify(title) || "story";
  const existing = await prisma.story.findMany({
    where: {
      slug: {
        startsWith: base,
      },
    },
    select: {
      slug: true,
    },
  });

  const slugs = new Set(existing.map((item) => item.slug));

  if (!slugs.has(base)) {
    return base;
  }

  let counter = 2;
  let candidate = `${base}-${counter}`;

  while (slugs.has(candidate)) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }

  return candidate;
}

async function getOwnedStoryRecord(userId: string, storyId: string) {
  const story = await prisma.story.findFirst({
    where: {
      id: storyId,
      userId,
    },
    include: {
      runs: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          chapters: {
            orderBy: {
              number: "asc",
            },
            include: {
              choices: {
                orderBy: {
                  position: "asc",
                },
              },
            },
          },
          decisions: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });

  if (!story) {
    throw new ResourceNotFoundError("Story not found.");
  }

  return story;
}

export async function createStory(userId: string, payload: unknown) {
  const input = createStoryInputSchema.parse(payload);
  const provider = getStoryGenerationProvider();
  const generated = await provider.generateInitialStory({
    userId,
    ...input,
  });
  const slug = await createUniqueStorySlug(input.title);

  const story = await prisma.$transaction(async (tx) => {
    const createdStory = await tx.story.create({
      data: {
        userId,
        title: generated.title,
        slug,
        synopsis: generated.synopsis,
        universe: input.universe,
        protagonist: input.protagonist,
        theme: input.theme,
        genre: input.genre,
        tone: input.tone,
        contentLanguage: input.contentLanguage,
        provider: generated.provider,
      },
    });

    const run = await tx.storyRun.create({
      data: {
        storyId: createdStory.id,
        userId,
        provider: generated.provider,
        promptVersion: provider.promptVersion,
        currentChapterNumber: 1,
        currentStateSummary: generated.initialState.summary,
        activeGoals: generated.initialState.activeGoals,
        unresolvedTensions: generated.initialState.unresolvedTensions,
        knownFacts: generated.initialState.knownFacts,
      },
    });

    await tx.storyChapter.create({
      data: {
        storyId: createdStory.id,
        storyRunId: run.id,
        number: 1,
        title: generated.firstChapter.title,
        summary: generated.firstChapter.summary,
        content: generated.firstChapter.text,
        accessMode: "FREE",
        priceCredits: 0,
        generatedBy: generated.provider,
        choices: {
          create: generated.firstChapter.choices.map((choice, index) => ({
            key: choice.key,
            label: choice.label,
            outcomeHint: choice.outcomeHint,
            position: index,
          })),
        },
      },
    });

    await tx.generationLog.create({
      data: {
        userId,
        storyId: createdStory.id,
        storyRunId: run.id,
        provider: generated.provider,
        eventType: "STORY_CREATED",
        status: "SUCCESS",
        promptVersion: provider.promptVersion,
        input,
        output: generated,
      },
    });

    return createdStory;
  });

  return story;
}

export async function listStories(userId: string): Promise<StoryListItem[]> {
  const stories = await prisma.story.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      runs: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          currentChapterNumber: true,
        },
      },
      _count: {
        select: {
          chapters: true,
        },
      },
    },
  });

  return stories.map((story) => ({
    id: story.id,
    slug: story.slug,
    title: story.title,
    synopsis: story.synopsis,
    universe: story.universe,
    genre: story.genre,
    tone: story.tone,
    contentLanguage: story.contentLanguage,
    status: story.status,
    chapterCount: story._count.chapters,
    currentChapterNumber: story.runs[0]?.currentChapterNumber ?? 1,
    createdAt: story.createdAt,
    updatedAt: story.updatedAt,
  }));
}

export async function getStoryDetail(
  userId: string,
  storyId: string,
): Promise<StoryDetailView> {
  const story = await getOwnedStoryRecord(userId, storyId);
  const run = story.runs[0];

  if (!run) {
    throw new Error("Story run is missing.");
  }

  const nextAccess = await getChapterAccessState({
    userId,
    storyId: story.id,
    chapterNumber: run.currentChapterNumber + 1,
  });

  return {
    id: story.id,
    title: story.title,
    slug: story.slug,
    synopsis: story.synopsis,
    universe: story.universe,
    protagonist: story.protagonist,
    theme: story.theme,
    genre: story.genre,
    tone: story.tone,
    contentLanguage: story.contentLanguage,
    status: story.status,
    currentChapterNumber: run.currentChapterNumber,
    currentStateSummary: run.currentStateSummary,
    activeGoals: run.activeGoals,
    unresolvedTensions: run.unresolvedTensions,
    knownFacts: run.knownFacts,
    chapters: run.chapters.map(mapChapter),
    decisions: run.decisions.map(mapDecision),
    nextAccess,
  };
}

export async function advanceStory(userId: string, payload: unknown) {
  const provider = getStoryGenerationProvider();
  const input = chooseStoryPathSchema.parse(payload);
  const story = await getOwnedStoryRecord(userId, input.storyId);
  const run = story.runs[0];

  if (!run) {
    throw new Error("Story run is missing.");
  }

  const latestChapter = run.chapters.at(-1);

  if (!latestChapter) {
    throw new Error("Story has no chapters.");
  }

  const selectedChoice = latestChapter.choices.find(
    (choice) => choice.id === input.choiceId,
  );

  if (!selectedChoice) {
    throw new Error("Choice is not available for the current chapter.");
  }

  const choiceAlreadyUsed = run.decisions.some(
    (decision) => decision.storyChoiceId === selectedChoice.id,
  );

  if (choiceAlreadyUsed) {
    throw new Error("Choice has already been resolved.");
  }

  const nextChapterNumber = run.currentChapterNumber + 1;
  const accessState = await getChapterAccessState({
    userId,
    storyId: story.id,
    chapterNumber: nextChapterNumber,
  });

  if (!accessState.allowed) {
    throw new Error("Next chapter access is not available yet.");
  }

  const transition = await provider.applyChoice({
    story: {
      title: story.title,
      synopsis: story.synopsis,
      universe: story.universe,
      protagonist: story.protagonist,
      theme: story.theme,
      genre: story.genre,
      tone: story.tone,
      contentLanguage: story.contentLanguage,
    },
    currentChapterNumber: run.currentChapterNumber,
    currentState: {
      summary: run.currentStateSummary,
      activeGoals: run.activeGoals,
      unresolvedTensions: run.unresolvedTensions,
      knownFacts: run.knownFacts,
    },
    selectedChoice: {
      key: selectedChoice.key,
      label: selectedChoice.label,
      outcomeHint: selectedChoice.outcomeHint ?? undefined,
    },
    choiceHistory: run.decisions.map((decision) => ({
      selectedLabel: decision.selectedLabel,
      resolutionSummary: decision.resolutionSummary,
    })),
  });

  const generatedChapter = await provider.generateNextChapter({
    story: {
      title: story.title,
      synopsis: story.synopsis,
      universe: story.universe,
      protagonist: story.protagonist,
      theme: story.theme,
      genre: story.genre,
      tone: story.tone,
      contentLanguage: story.contentLanguage,
    },
    nextChapterNumber,
    previousChapterSummary: latestChapter.summary,
    transition,
  });

  await prisma.$transaction(
    async (tx) => {
      const freshRun = await tx.storyRun.findUniqueOrThrow({
        where: {
          id: run.id,
        },
        select: {
          currentChapterNumber: true,
        },
      });

      if (freshRun.currentChapterNumber !== run.currentChapterNumber) {
        throw new Error(
          "Story state changed while generating the next chapter.",
        );
      }

      const duplicateDecision = await tx.storyDecision.findFirst({
        where: {
          storyRunId: run.id,
          storyChoiceId: selectedChoice.id,
        },
        select: {
          id: true,
        },
      });

      if (duplicateDecision) {
        throw new Error("Choice has already been resolved.");
      }

      await consumeNextChapterEntitlement(tx, {
        userId,
        storyId: story.id,
        storyRunId: run.id,
        chapterNumber: nextChapterNumber,
      });

      await tx.storyDecision.create({
        data: {
          storyRunId: run.id,
          storyId: story.id,
          storyChapterId: latestChapter.id,
          storyChoiceId: selectedChoice.id,
          chapterNumber: latestChapter.number,
          selectedLabel: selectedChoice.label,
          resolutionSummary: transition.resolutionSummary,
          resultingStateSummary: transition.updatedState.summary,
        },
      });

      await tx.storyChapter.create({
        data: {
          storyId: story.id,
          storyRunId: run.id,
          number: nextChapterNumber,
          title: generatedChapter.title,
          summary: generatedChapter.summary,
          content: generatedChapter.text,
          accessMode: "FREE",
          priceCredits: 0,
          generatedBy: generatedChapter.provider,
          choices: {
            create: generatedChapter.choices.map((choice, index) => ({
              key: choice.key,
              label: choice.label,
              outcomeHint: choice.outcomeHint,
              position: index,
            })),
          },
        },
      });

      await tx.storyRun.update({
        where: {
          id: run.id,
        },
        data: {
          currentChapterNumber: nextChapterNumber,
          currentStateSummary: transition.updatedState.summary,
          activeGoals: transition.updatedState.activeGoals,
          unresolvedTensions: transition.updatedState.unresolvedTensions,
          knownFacts: transition.updatedState.knownFacts,
          lastChoiceSummary: transition.resolutionSummary,
        },
      });

      await tx.generationLog.createMany({
        data: [
          {
            userId,
            storyId: story.id,
            storyRunId: run.id,
            provider: story.provider,
            eventType: "CHOICE_APPLIED",
            status: "SUCCESS",
            promptVersion: provider.promptVersion,
            input: {
              choiceId: selectedChoice.id,
              choiceLabel: selectedChoice.label,
            },
            output: transition,
          },
          {
            userId,
            storyId: story.id,
            storyRunId: run.id,
            provider: generatedChapter.provider,
            eventType: "CHAPTER_GENERATED",
            status: "SUCCESS",
            promptVersion: provider.promptVersion,
            input: {
              nextChapterNumber,
            },
            output: generatedChapter,
          },
        ],
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );

  return story.id;
}
