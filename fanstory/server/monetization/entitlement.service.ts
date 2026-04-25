import "server-only";

import type {
  ActiveSubscriptionView,
  ChapterBalanceView,
  EntitlementSource,
  NextChapterAccessView,
} from "@/entities/monetization/types";
import { prisma } from "@/lib/db/client";
import { WELCOME_CHAPTER_GRANT } from "@/server/monetization/catalog";
import {
  getRewardedAdDailyLimit,
  rewardedAdsEnabled,
} from "@/server/monetization/rewarded-ads/provider";

type EntitlementExecutor = Pick<
  typeof prisma,
  "chapterEntitlementLedger" | "rewardedAdGrant" | "subscription"
>;

type ActiveSubscriptionRecord = Awaited<
  ReturnType<typeof getActiveSubscriptionRecord>
>;

type EntitlementSnapshot = {
  balances: ChapterBalanceView;
  activeSubscription: ActiveSubscriptionView | null;
  nextSource: EntitlementSource | null;
  canClaimRewardedAd: boolean;
  rewardedAdReady: boolean;
  rewardedAdDailyLimit: number;
  rewardedAdClaimsUsedToday: number;
  rewardedAdClaimsRemainingToday: number;
  dailyResetAt: Date;
};

function clampNonNegative(value: number | null | undefined) {
  return Math.max(0, value ?? 0);
}

export function getUtcDayStart(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function getNextUtcDayStart(date = new Date()) {
  const dayStart = getUtcDayStart(date);
  return new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
}

function getWelcomeGrantDedupKey(userId: string) {
  return `welcome:${userId}`;
}

function getSubscriptionGrantDedupKey(subscriptionId: string, dayStart: Date) {
  return `subscription-daily:${subscriptionId}:${dayStart.toISOString()}`;
}

function getNextSourceFromBalances(
  balances: ChapterBalanceView,
): EntitlementSource | null {
  if (balances.welcome > 0) {
    return "WELCOME";
  }

  if (balances.subscriptionDaily > 0) {
    return "SUBSCRIPTION_DAILY";
  }

  if (balances.purchased > 0) {
    return "PURCHASE_PACK";
  }

  if (balances.rewardedAd > 0) {
    return "REWARDED_AD";
  }

  return null;
}

async function sumEntitlementBalance(
  executor: EntitlementExecutor,
  userId: string,
  source: EntitlementSource,
  effectiveDate?: Date,
) {
  const nextDayStart = effectiveDate ? getNextUtcDayStart(effectiveDate) : null;
  const result = await executor.chapterEntitlementLedger.aggregate({
    where: {
      userId,
      source,
      ...(effectiveDate
        ? {
            effectiveDate: {
              gte: effectiveDate,
              lt: nextDayStart ?? undefined,
            },
          }
        : {}),
    },
    _sum: {
      quantity: true,
    },
  });

  return clampNonNegative(result._sum.quantity);
}

export async function ensureWelcomeGrant(
  executor: EntitlementExecutor,
  userId: string,
) {
  await executor.chapterEntitlementLedger.upsert({
    where: {
      dedupKey: getWelcomeGrantDedupKey(userId),
    },
    update: {},
    create: {
      userId,
      eventType: "GRANT",
      source: "WELCOME",
      quantity: WELCOME_CHAPTER_GRANT,
      dedupKey: getWelcomeGrantDedupKey(userId),
      metadata: {
        grantType: "welcome",
      },
    },
  });
}

export async function ensureUserMonetizationBootstrap(userId: string) {
  await ensureWelcomeGrant(prisma, userId);
}

export async function getActiveSubscriptionRecord(
  executor: EntitlementExecutor,
  userId: string,
  now = new Date(),
) {
  return executor.subscription.findFirst({
    where: {
      userId,
      productId: {
        not: null,
      },
      status: {
        in: ["ACTIVE", "TRIALING"],
      },
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function ensureTodaySubscriptionGrant(
  executor: EntitlementExecutor,
  userId: string,
  now = new Date(),
) {
  const activeSubscription = await getActiveSubscriptionRecord(
    executor,
    userId,
    now,
  );

  if (!activeSubscription?.product?.dailyChapterLimit) {
    return null;
  }

  const dayStart = getUtcDayStart(now);
  const dailyLimit = activeSubscription.product.dailyChapterLimit;

  await executor.chapterEntitlementLedger.upsert({
    where: {
      dedupKey: getSubscriptionGrantDedupKey(activeSubscription.id, dayStart),
    },
    update: {},
    create: {
      userId,
      subscriptionId: activeSubscription.id,
      eventType: "GRANT",
      source: "SUBSCRIPTION_DAILY",
      quantity: dailyLimit,
      effectiveDate: dayStart,
      dedupKey: getSubscriptionGrantDedupKey(activeSubscription.id, dayStart),
      metadata: {
        dailyLimit,
        resetTimezone: "UTC",
        resetAt: getNextUtcDayStart(now).toISOString(),
        productCode: activeSubscription.product.code,
      },
    },
  });

  return activeSubscription;
}

async function getChapterBalances(
  executor: EntitlementExecutor,
  userId: string,
  now = new Date(),
  activeSubscription?: ActiveSubscriptionRecord | null,
): Promise<ChapterBalanceView> {
  const dayStart = getUtcDayStart(now);
  const [welcome, purchased, rewardedAd, subscriptionDaily] = await Promise.all(
    [
      sumEntitlementBalance(executor, userId, "WELCOME"),
      sumEntitlementBalance(executor, userId, "PURCHASE_PACK"),
      sumEntitlementBalance(executor, userId, "REWARDED_AD"),
      activeSubscription?.product?.dailyChapterLimit
        ? sumEntitlementBalance(
            executor,
            userId,
            "SUBSCRIPTION_DAILY",
            dayStart,
          )
        : Promise.resolve(0),
    ],
  );

  return {
    welcome,
    subscriptionDaily,
    purchased,
    rewardedAd,
    total: welcome + subscriptionDaily + purchased + rewardedAd,
  };
}

async function getRewardedAdClaimStats(
  executor: EntitlementExecutor,
  userId: string,
  now = new Date(),
) {
  const dayStart = getUtcDayStart(now);
  const nextDayStart = getNextUtcDayStart(now);
  const enabled = rewardedAdsEnabled();
  const dailyLimit = enabled ? getRewardedAdDailyLimit() : 0;

  if (!enabled) {
    return {
      dailyLimit,
      claimedToday: 0,
      remainingToday: 0,
    };
  }

  const result = await executor.chapterEntitlementLedger.aggregate({
    where: {
      userId,
      source: "REWARDED_AD",
      eventType: "GRANT",
      createdAt: {
        gte: dayStart,
        lt: nextDayStart,
      },
    },
    _sum: {
      quantity: true,
    },
  });
  const claimedToday = clampNonNegative(result._sum.quantity);

  return {
    dailyLimit,
    claimedToday,
    remainingToday: Math.max(0, dailyLimit - claimedToday),
  };
}

function mapActiveSubscription(
  activeSubscription: NonNullable<ActiveSubscriptionRecord> | null,
  remainingToday: number,
  resetsAt: Date,
): ActiveSubscriptionView | null {
  if (!activeSubscription?.product?.dailyChapterLimit) {
    return null;
  }

  return {
    id: activeSubscription.id,
    code: activeSubscription.product.code,
    name: activeSubscription.product.name,
    status: activeSubscription.status,
    dailyChapterLimit: activeSubscription.product.dailyChapterLimit,
    remainingToday,
    endsAt: activeSubscription.endsAt ?? null,
    resetsAt,
  };
}

export async function getEntitlementSnapshot(
  userId: string,
  now = new Date(),
): Promise<EntitlementSnapshot> {
  await ensureWelcomeGrant(prisma, userId);

  const activeSubscription = await ensureTodaySubscriptionGrant(
    prisma,
    userId,
    now,
  );
  const balances = await getChapterBalances(
    prisma,
    userId,
    now,
    activeSubscription,
  );
  const rewardedAdStats = await getRewardedAdClaimStats(prisma, userId, now);
  const nextSource = getNextSourceFromBalances(balances);
  const dailyResetAt = getNextUtcDayStart(now);

  return {
    balances,
    activeSubscription: mapActiveSubscription(
      activeSubscription,
      balances.subscriptionDaily,
      dailyResetAt,
    ),
    nextSource,
    canClaimRewardedAd:
      rewardedAdsEnabled() &&
      balances.total === 0 &&
      rewardedAdStats.remainingToday > 0 &&
      balances.rewardedAd === 0,
    rewardedAdReady: balances.rewardedAd > 0,
    rewardedAdDailyLimit: rewardedAdStats.dailyLimit,
    rewardedAdClaimsUsedToday: rewardedAdStats.claimedToday,
    rewardedAdClaimsRemainingToday: rewardedAdStats.remainingToday,
    dailyResetAt,
  };
}

export async function getNextChapterAccessState(input: {
  userId: string;
  chapterNumber: number;
}): Promise<NextChapterAccessView> {
  const snapshot = await getEntitlementSnapshot(input.userId);

  return {
    allowed: snapshot.balances.total > 0,
    nextChapterNumber: input.chapterNumber,
    nextSource: snapshot.nextSource,
    canClaimRewardedAd: snapshot.canClaimRewardedAd,
    rewardedAdReady: snapshot.rewardedAdReady,
    rewardedAdDailyLimit: snapshot.rewardedAdDailyLimit,
    rewardedAdClaimsUsedToday: snapshot.rewardedAdClaimsUsedToday,
    rewardedAdClaimsRemainingToday: snapshot.rewardedAdClaimsRemainingToday,
    balances: snapshot.balances,
    activeSubscription: snapshot.activeSubscription,
    dailyResetAt: snapshot.dailyResetAt,
  };
}

export async function consumeNextChapterEntitlement(
  executor: EntitlementExecutor,
  input: {
    userId: string;
    storyId: string;
    storyRunId: string;
    chapterNumber: number;
    now?: Date;
  },
) {
  const now = input.now ?? new Date();

  await ensureWelcomeGrant(executor, input.userId);

  const activeSubscription = await ensureTodaySubscriptionGrant(
    executor,
    input.userId,
    now,
  );
  const balances = await getChapterBalances(
    executor,
    input.userId,
    now,
    activeSubscription,
  );
  const source = getNextSourceFromBalances(balances);

  if (!source) {
    throw new Error(
      "No chapter entitlements are available for the next generation step.",
    );
  }

  const ledgerData = {
    userId: input.userId,
    eventType: "CONSUME" as const,
    source,
    quantity: -1,
    storyId: input.storyId,
    storyRunId: input.storyRunId,
    chapterNumber: input.chapterNumber,
    metadata: {
      consumedAt: now.toISOString(),
    },
  };

  if (source === "SUBSCRIPTION_DAILY") {
    if (!activeSubscription) {
      throw new Error("Active subscription quota is unavailable.");
    }

    return executor.chapterEntitlementLedger.create({
      data: {
        ...ledgerData,
        subscriptionId: activeSubscription.id,
        effectiveDate: getUtcDayStart(now),
      },
    });
  }

  if (source === "REWARDED_AD") {
    const rewardedAdGrant = await executor.rewardedAdGrant.findFirst({
      where: {
        userId: input.userId,
        status: "GRANTED",
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!rewardedAdGrant) {
      throw new Error("Rewarded ad entitlement is not available.");
    }

    await executor.rewardedAdGrant.update({
      where: {
        id: rewardedAdGrant.id,
      },
      data: {
        status: "CONSUMED",
        consumedAt: now,
      },
    });

    return executor.chapterEntitlementLedger.create({
      data: {
        ...ledgerData,
        rewardedAdGrantId: rewardedAdGrant.id,
      },
    });
  }

  return executor.chapterEntitlementLedger.create({
    data: ledgerData,
  });
}
