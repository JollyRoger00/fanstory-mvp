import "server-only";

import type {
  EntitlementLedgerEntryView,
  MonetizationOverview,
} from "@/entities/monetization/types";
import { prisma } from "@/lib/db/client";
import { paymentsEnabled } from "@/lib/env/server";
import { getMonetizationCatalog } from "@/server/monetization/catalog.service";
import { getEntitlementSnapshot } from "@/server/monetization/entitlement.service";
import { rewardedAdDevFlowEnabled } from "@/server/monetization/rewarded-ads/provider";
import { reconcilePendingPaymentsForUser } from "@/server/payments/payment-recovery.service";
import { listRecentPayments } from "@/server/payments/payment.service";

function mapLedgerEntry(entry: {
  id: string;
  eventType: "GRANT" | "CONSUME";
  source: "WELCOME" | "SUBSCRIPTION_DAILY" | "PURCHASE_PACK" | "REWARDED_AD";
  quantity: number;
  createdAt: Date;
  purchase: {
    product: {
      name: string;
    } | null;
  } | null;
  subscription: {
    product: {
      name: string;
    } | null;
  } | null;
}): EntitlementLedgerEntryView {
  return {
    id: entry.id,
    eventType: entry.eventType,
    source: entry.source,
    quantity: entry.quantity,
    createdAt: entry.createdAt,
    productName:
      entry.purchase?.product?.name ??
      entry.subscription?.product?.name ??
      null,
  };
}

export async function getMonetizationOverview(
  userId: string,
): Promise<MonetizationOverview> {
  await reconcilePendingPaymentsForUser(userId);

  const [snapshot, catalog, ledger, recentPayments] = await Promise.all([
    getEntitlementSnapshot(userId),
    getMonetizationCatalog(),
    prisma.chapterEntitlementLedger.findMany({
      where: {
        userId,
      },
      include: {
        purchase: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        subscription: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 16,
    }),
    listRecentPayments(userId),
  ]);

  return {
    balances: snapshot.balances,
    activeSubscription: snapshot.activeSubscription,
    chapterPacks: catalog.chapterPacks,
    subscriptions: catalog.subscriptions,
    ledger: ledger.map(mapLedgerEntry),
    recentPayments,
    canClaimRewardedAd: snapshot.canClaimRewardedAd,
    rewardedAdReady: snapshot.rewardedAdReady,
    dailyResetAt: snapshot.dailyResetAt,
    paymentsEnabled: paymentsEnabled(),
    rewardedAdEnabled: rewardedAdDevFlowEnabled(),
  };
}
