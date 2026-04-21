import "server-only";

import type { StoryAccessState } from "@/entities/story/types";
import { getNextChapterAccessState } from "@/server/monetization/entitlement.service";

type AccessInput = {
  userId: string;
  storyId: string;
  chapterNumber: number;
};

export async function getChapterAccessState({
  userId,
  chapterNumber,
}: AccessInput): Promise<StoryAccessState> {
  return getNextChapterAccessState({
    userId,
    chapterNumber,
  });
}
