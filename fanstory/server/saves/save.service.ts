import "server-only";

import type { SaveView } from "@/entities/save/types";
import { prisma } from "@/lib/db/client";
import { createSaveSchema } from "@/lib/validations/story";

export async function createSave(userId: string, payload: unknown) {
  const input = createSaveSchema.parse(payload);

  const story = await prisma.story.findFirstOrThrow({
    where: {
      id: input.storyId,
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
              number: "desc",
            },
            take: 1,
          },
        },
      },
    },
  });

  const run = story.runs[0];
  const latestChapter = run?.chapters[0];

  if (!run || !latestChapter) {
    throw new Error("Cannot create a save for an empty story.");
  }

  return prisma.save.create({
    data: {
      userId,
      storyId: story.id,
      storyRunId: run.id,
      storyChapterId: latestChapter.id,
      label: input.label,
      chapterNumber: run.currentChapterNumber,
      stateSummary: run.currentStateSummary,
      snapshot: {
        activeGoals: run.activeGoals,
        unresolvedTensions: run.unresolvedTensions,
        knownFacts: run.knownFacts,
      },
    },
  });
}

export async function listSaves(userId: string): Promise<SaveView[]> {
  const saves = await prisma.save.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      story: {
        select: {
          title: true,
        },
      },
    },
  });

  return saves.map((save) => ({
    id: save.id,
    storyId: save.storyId,
    storyTitle: save.story.title,
    label: save.label,
    chapterNumber: save.chapterNumber,
    stateSummary: save.stateSummary,
    createdAt: save.createdAt,
    lastOpenedAt: save.lastOpenedAt,
  }));
}
