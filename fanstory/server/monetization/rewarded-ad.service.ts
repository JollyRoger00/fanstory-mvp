import "server-only";

import { Prisma } from "@/lib/db/generated/client";
import { prisma } from "@/lib/db/client";
import { getEntitlementSnapshot } from "@/server/monetization/entitlement.service";
import { getRewardedAdProvider } from "@/server/monetization/rewarded-ads/provider";

export async function claimRewardedAdChapter(userId: string) {
  const snapshot = await getEntitlementSnapshot(userId);

  if (snapshot.balances.total > 0) {
    throw new Error(
      "Use your available chapter access before claiming another ad unlock.",
    );
  }

  const provider = getRewardedAdProvider();
  const verification = await provider.verifyGrant({
    userId,
    placement: "NEXT_CHAPTER",
  });

  await prisma.$transaction(async (tx) => {
    const grant = await tx.rewardedAdGrant.create({
      data: {
        userId,
        provider: verification.provider,
        verificationKey: verification.verificationKey,
        grantQuantity: 1,
        metadata: verification.metadata
          ? (verification.metadata as Prisma.InputJsonValue)
          : undefined,
      },
    });

    await tx.chapterEntitlementLedger.create({
      data: {
        userId,
        rewardedAdGrantId: grant.id,
        eventType: "GRANT",
        source: "REWARDED_AD",
        quantity: 1,
        metadata: {
          provider: verification.provider,
        },
      },
    });
  });
}
