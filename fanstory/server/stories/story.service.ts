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
import { storyPlanSchema } from "@/server/story-generation/schemas";
import type {
  StoryChapterContext,
  StoryGenerationContext,
  StoryPlan,
  StoryProgressSnapshot,
} from "@/server/story-generation/types";

const DEFAULT_TARGET_CHAPTER_COUNT = 36;

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

function createStoryContext(story: {
  title: string;
  synopsis: string | null;
  universe: string;
  protagonist: string;
  theme: string;
  genre: string;
  tone: string;
  contentLanguage: "en" | "ru";
}): StoryGenerationContext {
  return {
    title: story.title,
    synopsis: story.synopsis,
    universe: story.universe,
    protagonist: story.protagonist,
    theme: story.theme,
    genre: story.genre,
    tone: story.tone,
    contentLanguage: story.contentLanguage,
  };
}

function buildFallbackStoryPlan(story: StoryGenerationContext): StoryPlan {
  const targetChapterCount = DEFAULT_TARGET_CHAPTER_COUNT;
  const actOneEnd = Math.max(6, Math.round(targetChapterCount * 0.22));
  const actTwoEnd = Math.max(
    actOneEnd + 6,
    Math.round(targetChapterCount * 0.5),
  );
  const actThreeEnd = Math.max(
    actTwoEnd + 6,
    Math.round(targetChapterCount * 0.78),
  );

  return {
    targetChapterCount,
    storyPromise: `${story.protagonist} is forced to confront ${story.theme} inside ${story.universe}, and every choice changes the cost of survival and the shape of the ending.`,
    centralQuestion: `Can ${story.protagonist} endure ${story.theme} without becoming part of what must be resisted?`,
    actBlueprint: [
      {
        name: "Setup and Fracture",
        chapterStart: 1,
        chapterEnd: actOneEnd,
        purpose:
          "Establish the protagonist, world pressure, the initial wound in the status quo, and the first irreversible commitments.",
      },
      {
        name: "Escalation and Entanglement",
        chapterStart: actOneEnd + 1,
        chapterEnd: actTwoEnd,
        purpose:
          "Complicate goals, split loyalties, expose hidden rules, and make every victory carry a cost.",
      },
      {
        name: "Reversal and Crisis",
        chapterStart: actTwoEnd + 1,
        chapterEnd: actThreeEnd,
        purpose:
          "Deliver reversals, tighten the trap, and force the protagonist to choose between incompatible goods.",
      },
      {
        name: "Climax and Aftermath",
        chapterStart: actThreeEnd + 1,
        chapterEnd: targetChapterCount,
        purpose:
          "Cash out the major consequences, confront the central antagonist or system, and land a changed end state.",
      },
    ],
    majorTurns: [
      {
        chapter: 1,
        description: `The ordinary balance breaks and ${story.protagonist} is forced to engage.`,
      },
      {
        chapter: actOneEnd,
        description:
          "An early commitment closes the easy way back and defines the first major branch.",
      },
      {
        chapter: actTwoEnd,
        description:
          "A midpoint reversal changes what the story is really about and who holds power.",
      },
      {
        chapter: actThreeEnd,
        description:
          "A crisis strips away the safe options and demands a high-cost decision.",
      },
      {
        chapter: targetChapterCount,
        description:
          "The final confrontation resolves the longest-running pressure and shows the price of the chosen path.",
      },
    ],
    persistentThreads: [
      `How ${story.theme} keeps mutating the rules of ${story.universe}.`,
      `Who can still be trusted around ${story.protagonist}.`,
      "What hidden truth or capability could change the balance of power.",
      "What personal, moral, or strategic cost each advance creates.",
    ],
    endingDirections: [
      `${story.protagonist} wins at severe personal cost and survives changed.`,
      `${story.protagonist} prevents disaster but loses a core relationship, oath, or part of the self.`,
      `${story.protagonist} reshapes the conflict by rejecting the expected path and forcing a harder peace.`,
    ],
    choiceAxes: [
      "trust and alliances",
      "revealed knowledge",
      "risk and exposure",
      "initiative and tactical position",
      "moral cost",
    ],
  };
}

function normalizeStoryPlan(plan: StoryPlan): StoryPlan {
  return {
    ...plan,
    actBlueprint: [...plan.actBlueprint].sort(
      (left, right) => left.chapterStart - right.chapterStart,
    ),
    majorTurns: [...plan.majorTurns].sort(
      (left, right) => left.chapter - right.chapter,
    ),
  };
}

function extractStoryPlanFromOutput(output: unknown): StoryPlan | null {
  if (
    typeof output !== "object" ||
    output === null ||
    !("storyPlan" in output)
  ) {
    return null;
  }

  const parsed = storyPlanSchema.safeParse(output.storyPlan);

  if (!parsed.success) {
    return null;
  }

  return normalizeStoryPlan(parsed.data);
}

async function getStoryPlanForRun(
  storyId: string,
  storyRunId: string,
  story: StoryGenerationContext,
): Promise<StoryPlan> {
  const log = await prisma.generationLog.findFirst({
    where: {
      storyId,
      storyRunId,
      eventType: "STORY_CREATED",
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      output: true,
    },
  });

  return (
    extractStoryPlanFromOutput(log?.output) ?? buildFallbackStoryPlan(story)
  );
}

function buildStoryProgress(
  storyPlan: StoryPlan,
  chapterNumber: number,
): StoryProgressSnapshot {
  const currentPhase =
    storyPlan.actBlueprint.find(
      (phase) =>
        chapterNumber >= phase.chapterStart &&
        chapterNumber <= phase.chapterEnd,
    ) ?? storyPlan.actBlueprint.at(-1);
  const nextMajorTurn =
    storyPlan.majorTurns.find((turn) => turn.chapter >= chapterNumber) ?? null;

  return {
    chapterNumber,
    targetChapterCount: storyPlan.targetChapterCount,
    chaptersRemaining: Math.max(
      storyPlan.targetChapterCount - chapterNumber,
      0,
    ),
    completionPercent: Math.min(
      100,
      Math.round((chapterNumber / storyPlan.targetChapterCount) * 100),
    ),
    currentPhase: currentPhase?.name ?? "Active Story",
    phasePurpose:
      currentPhase?.purpose ??
      "Continue escalating the story while preserving continuity and consequence.",
    nextMajorTurn: nextMajorTurn
      ? `Chapter ${nextMajorTurn.chapter}: ${nextMajorTurn.description}`
      : null,
  };
}

function getRecentChapterContext(
  chapters: Array<{
    number: number;
    title: string;
    summary: string;
  }>,
  limit = 4,
): StoryChapterContext[] {
  return chapters.slice(-limit).map((chapter) => ({
    number: chapter.number,
    title: chapter.title,
    summary: chapter.summary,
  }));
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
  const storyContext = createStoryContext({
    title: generated.title,
    synopsis: generated.synopsis,
    universe: input.universe,
    protagonist: input.protagonist,
    theme: input.theme,
    genre: input.genre,
    tone: input.tone,
    contentLanguage: input.contentLanguage,
  });
  const storyPlan = generated.storyPlan ?? buildFallbackStoryPlan(storyContext);
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
        output: {
          ...generated,
          storyPlan,
        },
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
  const storyContext = createStoryContext(story);
  const storyPlan = await getStoryPlanForRun(story.id, run.id, storyContext);
  const recentChapters = getRecentChapterContext(run.chapters);
  const choiceHistory = run.decisions.slice(-8).map((decision) => ({
    chapterNumber: decision.chapterNumber,
    selectedLabel: decision.selectedLabel,
    resolutionSummary: decision.resolutionSummary,
  }));
  const accessState = await getChapterAccessState({
    userId,
    storyId: story.id,
    chapterNumber: nextChapterNumber,
  });

  if (!accessState.allowed) {
    throw new Error("Next chapter access is not available yet.");
  }

  const transition = await provider.applyChoice({
    story: storyContext,
    currentChapterNumber: run.currentChapterNumber,
    storyPlan,
    storyProgress: buildStoryProgress(storyPlan, run.currentChapterNumber),
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
    recentChapters,
    choiceHistory,
  });

  const generatedChapter = await provider.generateNextChapter({
    story: storyContext,
    nextChapterNumber,
    storyPlan,
    storyProgress: buildStoryProgress(storyPlan, nextChapterNumber),
    previousChapterSummary: latestChapter.summary,
    recentChapters,
    choiceHistory,
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
