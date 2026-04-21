import "server-only";

import type { StoryAccessState } from "@/entities/story/types";
import { prisma } from "@/lib/db/client";
import { getServerEnv } from "@/lib/env/server";
import { hasActiveSubscription } from "@/server/subscriptions/subscription.service";

type AccessInput = {
  userId: string;
  storyId: string;
  chapterNumber: number;
  priceCredits: number;
};

export async function getChapterAccessState({
  userId,
  storyId,
  chapterNumber,
  priceCredits,
}: AccessInput): Promise<StoryAccessState> {
  const env = getServerEnv();

  if (chapterNumber <= env.STORY_FREE_CHAPTERS) {
    return {
      allowed: true,
      reason: "FREE",
      priceCredits: 0,
      nextChapterNumber: chapterNumber,
    };
  }

  const [subscriptionActive, purchase] = await Promise.all([
    hasActiveSubscription(userId),
    prisma.purchasedChapterAccess.findUnique({
      where: {
        userId_storyId_chapterNumber: {
          userId,
          storyId,
          chapterNumber,
        },
      },
    }),
  ]);

  if (subscriptionActive) {
    return {
      allowed: true,
      reason: "SUBSCRIPTION",
      priceCredits: 0,
      nextChapterNumber: chapterNumber,
    };
  }

  if (purchase) {
    return {
      allowed: true,
      reason: "PURCHASED",
      priceCredits: 0,
      nextChapterNumber: chapterNumber,
    };
  }

  return {
    allowed: false,
    reason: "LOCKED",
    priceCredits,
    nextChapterNumber: chapterNumber,
  };
}
