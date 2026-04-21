import "server-only";

import type { ReaderView } from "@/entities/story/types";
import { prisma } from "@/lib/db/client";
import { getStoryDetail } from "@/server/stories/story.service";

export async function getReaderView(
  userId: string,
  storyId: string,
  chapterNumber?: number,
): Promise<ReaderView> {
  const [story, saveCount] = await Promise.all([
    getStoryDetail(userId, storyId),
    prisma.save.count({
      where: {
        userId,
        storyId,
      },
    }),
  ]);

  const safeChapterNumber =
    chapterNumber && chapterNumber > 0
      ? Math.min(chapterNumber, story.currentChapterNumber)
      : story.currentChapterNumber;

  const activeChapter =
    story.chapters.find((chapter) => chapter.number === safeChapterNumber) ??
    story.chapters.at(-1);

  if (!activeChapter) {
    throw new Error("Reader cannot open a story without chapters.");
  }

  return {
    story,
    visibleChapters: story.chapters.filter(
      (chapter) => chapter.number <= activeChapter.number,
    ),
    activeChapter,
    canContinue: activeChapter.number === story.currentChapterNumber,
    nextAccess: story.nextAccess,
    saveCount,
  };
}
