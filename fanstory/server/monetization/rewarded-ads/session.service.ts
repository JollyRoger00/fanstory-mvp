import "server-only";

import { Prisma } from "@/lib/db/generated/client";
import { getEntitlementSnapshot } from "@/server/monetization/entitlement.service";
import { claimVerifiedRewardedAdChapter } from "@/server/monetization/rewarded-ad.service";
import {
  getRewardedAdUiConfig,
  rewardedAdsEnabled,
} from "@/server/monetization/rewarded-ads/provider";
import {
  issueRewardedAdSessionToken,
  verifyRewardedAdSessionToken,
} from "@/server/monetization/rewarded-ads/session-token";
import type { RewardedAdPlacement } from "@/server/monetization/rewarded-ads/types";

function getProviderName() {
  const config = getRewardedAdUiConfig();

  if (config.provider === "yandex") {
    return "YAN" as const;
  }

  if (config.provider === "mock") {
    return "MOCK" as const;
  }

  throw new Error("Rewarded ads are disabled.");
}

async function assertRewardedAdSessionCanStart(userId: string) {
  if (!rewardedAdsEnabled()) {
    throw new Error("Rewarded ads are unavailable.");
  }

  const snapshot = await getEntitlementSnapshot(userId);

  if (snapshot.balances.total > 0 || snapshot.rewardedAdReady) {
    throw new Error(
      "Use your available chapter access before watching an ad for another chapter.",
    );
  }

  if (snapshot.rewardedAdClaimsRemainingToday <= 0) {
    throw new Error("Daily rewarded ad limit reached.");
  }

  return snapshot;
}

export async function createRewardedAdSession(input: {
  userId: string;
  placement: RewardedAdPlacement;
}) {
  const snapshot = await assertRewardedAdSessionCanStart(input.userId);
  const provider = getProviderName();

  return {
    token: issueRewardedAdSessionToken({
      userId: input.userId,
      placement: input.placement,
      provider,
    }),
    dailyLimit: snapshot.rewardedAdDailyLimit,
    remainingToday: snapshot.rewardedAdClaimsRemainingToday,
  };
}

export async function claimRewardedAdSession(input: {
  userId: string;
  token: string;
}) {
  const payload = verifyRewardedAdSessionToken(input.token);

  if (payload.userId !== input.userId) {
    throw new Error("Rewarded ad session does not belong to the current user.");
  }

  const expectedProvider = getProviderName();

  if (payload.provider !== expectedProvider) {
    throw new Error("Rewarded ad session provider no longer matches the server configuration.");
  }

  try {
    await claimVerifiedRewardedAdChapter(input.userId, {
      provider: payload.provider,
      verificationKey: `${payload.provider.toLowerCase()}:${payload.jti}`,
      metadata: {
        placement: payload.placement,
        issuedAt: payload.iat,
        expiresAt: payload.exp,
        mode: "client-callback",
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("This rewarded ad session has already been used.");
    }

    throw error;
  }
}
