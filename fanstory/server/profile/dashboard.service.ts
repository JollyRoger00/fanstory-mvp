import "server-only";

import type { DashboardView } from "@/entities/user/types";
import { prisma } from "@/lib/db/client";
import { getActiveSubscription } from "@/server/subscriptions/subscription.service";
import { ensureWalletRecord } from "@/server/wallet/wallet.service";

export async function getDashboardView(user: {
  id: string;
  name?: string | null;
  email?: string | null;
}): Promise<DashboardView> {
  const wallet = await ensureWalletRecord(prisma, user.id);

  const [
    storyCount,
    saveCount,
    purchasedChapterCount,
    activeSubscription,
    recentStories,
    recentSaves,
  ] = await Promise.all([
    prisma.story.count({
      where: {
        userId: user.id,
      },
    }),
    prisma.save.count({
      where: {
        userId: user.id,
      },
    }),
    prisma.purchasedChapterAccess.count({
      where: {
        userId: user.id,
      },
    }),
    getActiveSubscription(user.id),
    prisma.story.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 4,
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
      },
    }),
    prisma.save.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
      include: {
        story: {
          select: {
            title: true,
          },
        },
      },
    }),
  ]);

  return {
    userName: user.name ?? null,
    userEmail: user.email ?? null,
    storyCount,
    saveCount,
    balance: wallet.balance,
    purchasedChapterCount,
    activeSubscriptionName: activeSubscription?.plan.name ?? null,
    recentStories: recentStories.map((story) => ({
      id: story.id,
      title: story.title,
      currentChapterNumber: story.runs[0]?.currentChapterNumber ?? 1,
      updatedAt: story.updatedAt,
    })),
    recentSaves: recentSaves.map((save) => ({
      id: save.id,
      label: save.label,
      storyTitle: save.story.title,
      chapterNumber: save.chapterNumber,
      createdAt: save.createdAt,
    })),
  };
}
