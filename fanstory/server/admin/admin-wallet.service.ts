import "server-only";

import { Prisma } from "@/lib/db/generated/client";
import { prisma } from "@/lib/db/client";
import { ResourceNotFoundError } from "@/lib/errors/app-error";
import {
  adminChapterAdjustmentSchema,
  adminWalletCreditAdjustmentSchema,
} from "@/lib/validations/admin";
import { requireAdmin } from "@/server/admin/admin-auth";
import { recordAdminAuditLog } from "@/server/admin/admin-audit.service";
import { clampNonNegative, toInputJsonValue } from "@/server/admin/shared";
import {
  ensureTodaySubscriptionGrant,
  ensureWelcomeGrant,
  getNextUtcDayStart,
  getUtcDayStart,
} from "@/server/monetization/entitlement.service";

type EntitlementExecutor = Pick<
  Prisma.TransactionClient,
  "chapterEntitlementLedger" | "rewardedAdGrant" | "subscription"
>;

function getManualAdjustmentDescription(kind: "wallet" | "chapters", amount: number) {
  const label = kind === "wallet" ? "wallet credit" : "chapter";
  const sign = amount > 0 ? "+" : "";

  return `Admin ${label} adjustment ${sign}${amount}`;
}

async function createManualAdjustmentPurchase(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    walletId?: string | null;
    description: string;
    metadata: Record<string, unknown>;
  },
) {
  return tx.purchase.create({
    data: {
      userId: input.userId,
      walletId: input.walletId ?? null,
      type: "MANUAL_ADJUSTMENT",
      status: "COMPLETED",
      amount: 0,
      description: input.description,
      metadata: toInputJsonValue(input.metadata),
    },
  });
}

async function sumEntitlementBalance(
  executor: EntitlementExecutor,
  userId: string,
  source: "WELCOME" | "SUBSCRIPTION_DAILY" | "PURCHASE_PACK" | "REWARDED_AD",
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

async function getChapterSnapshot(
  executor: EntitlementExecutor,
  userId: string,
  now = new Date(),
) {
  await ensureWelcomeGrant(executor, userId);
  const activeSubscription = await ensureTodaySubscriptionGrant(
    executor,
    userId,
    now,
  );
  const dayStart = getUtcDayStart(now);
  const [welcome, subscriptionDaily, purchased, rewardedAd] = await Promise.all(
    [
      sumEntitlementBalance(executor, userId, "WELCOME"),
      sumEntitlementBalance(
        executor,
        userId,
        "SUBSCRIPTION_DAILY",
        activeSubscription?.product?.dailyChapterLimit ? dayStart : undefined,
      ),
      sumEntitlementBalance(executor, userId, "PURCHASE_PACK"),
      sumEntitlementBalance(executor, userId, "REWARDED_AD"),
    ],
  );

  return {
    activeSubscriptionId: activeSubscription?.id ?? null,
    dayStart,
    balances: {
      welcome,
      subscriptionDaily,
      purchased,
      rewardedAd,
      total: welcome + subscriptionDaily + purchased + rewardedAd,
    },
  };
}

export async function adjustAdminUserWalletCredits(payload: unknown) {
  const admin = await requireAdmin();
  const input = adminWalletCreditAdjustmentSchema.parse(payload);

  return prisma.$transaction(
    async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          id: input.userId,
        },
        select: {
          id: true,
          wallet: {
            select: {
              id: true,
              balance: true,
              currency: true,
            },
          },
        },
      });

      if (!user) {
        throw new ResourceNotFoundError("User not found.");
      }

      const wallet =
        user.wallet ??
        (await tx.wallet.create({
          data: {
            userId: user.id,
            balance: 0,
          },
        }));
      const beforeBalance = wallet.balance;
      const afterBalance = beforeBalance + input.amount;

      if (afterBalance < 0) {
        throw new Error("Wallet balance cannot become negative.");
      }

      const description = getManualAdjustmentDescription("wallet", input.amount);
      const purchase = await createManualAdjustmentPurchase(tx, {
        userId: user.id,
        walletId: wallet.id,
        description,
        metadata: {
          adminUserId: admin.id,
          adjustmentKind: "wallet_credits",
          reason: input.reason,
          amount: input.amount,
        },
      });

      await tx.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: afterBalance,
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: user.id,
          purchaseId: purchase.id,
          type: "ADJUSTMENT",
          amount: input.amount,
          balanceAfter: afterBalance,
          description,
          metadata: {
            adminUserId: admin.id,
            reason: input.reason,
          },
        },
      });

      await recordAdminAuditLog(tx, {
        adminUserId: admin.id,
        targetUserId: user.id,
        action: "wallet.credits.adjusted",
        entityType: "WALLET",
        entityId: wallet.id,
        before: {
          balance: beforeBalance,
          currency: wallet.currency,
        },
        after: {
          balance: afterBalance,
          currency: wallet.currency,
          walletTransactionId: transaction.id,
          purchaseId: purchase.id,
        },
        reason: input.reason,
      });

      return {
        userId: user.id,
        walletId: wallet.id,
        balance: afterBalance,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function adjustAdminUserChapterBalance(payload: unknown) {
  const admin = await requireAdmin();
  const input = adminChapterAdjustmentSchema.parse(payload);
  const now = new Date();

  return prisma.$transaction(
    async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          id: input.userId,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        throw new ResourceNotFoundError("User not found.");
      }

      const beforeSnapshot = await getChapterSnapshot(tx, user.id, now);
      const description = getManualAdjustmentDescription(
        "chapters",
        input.quantity,
      );
      const purchase = await createManualAdjustmentPurchase(tx, {
        userId: user.id,
        description,
        metadata: {
          adminUserId: admin.id,
          adjustmentKind: "chapters",
          reason: input.reason,
          quantity: input.quantity,
        },
      });

      if (input.quantity > 0) {
        await tx.chapterEntitlementLedger.create({
          data: {
            userId: user.id,
            purchaseId: purchase.id,
            eventType: "GRANT",
            source: "PURCHASE_PACK",
            quantity: input.quantity,
            metadata: {
              adminUserId: admin.id,
              reason: input.reason,
              purchaseDescription: description,
            },
          },
        });
      } else {
        let remaining = Math.abs(input.quantity);

        if (beforeSnapshot.balances.total < remaining) {
          throw new Error("Chapter balance cannot become negative.");
        }

        const allocations = [
          {
            source: "WELCOME" as const,
            available: beforeSnapshot.balances.welcome,
          },
          {
            source: "SUBSCRIPTION_DAILY" as const,
            available: beforeSnapshot.balances.subscriptionDaily,
          },
          {
            source: "PURCHASE_PACK" as const,
            available: beforeSnapshot.balances.purchased,
          },
          {
            source: "REWARDED_AD" as const,
            available: beforeSnapshot.balances.rewardedAd,
          },
        ];

        for (const allocation of allocations) {
          if (remaining <= 0 || allocation.available <= 0) {
            continue;
          }

          const consumed = Math.min(remaining, allocation.available);

          await tx.chapterEntitlementLedger.create({
            data: {
              userId: user.id,
              purchaseId: purchase.id,
              subscriptionId:
                allocation.source === "SUBSCRIPTION_DAILY"
                  ? beforeSnapshot.activeSubscriptionId
                  : null,
              eventType: "CONSUME",
              source: allocation.source,
              quantity: -consumed,
              effectiveDate:
                allocation.source === "SUBSCRIPTION_DAILY"
                  ? beforeSnapshot.dayStart
                  : null,
              metadata: {
                adminUserId: admin.id,
                reason: input.reason,
                purchaseDescription: description,
              },
            },
          });

          remaining -= consumed;
        }

        if (remaining > 0) {
          throw new Error("Unable to allocate the full chapter deduction.");
        }
      }

      const afterSnapshot = await getChapterSnapshot(tx, user.id, now);

      await recordAdminAuditLog(tx, {
        adminUserId: admin.id,
        targetUserId: user.id,
        action: "wallet.chapters.adjusted",
        entityType: "USER",
        entityId: user.id,
        before: beforeSnapshot.balances,
        after: {
          ...afterSnapshot.balances,
          purchaseId: purchase.id,
        },
        reason: input.reason,
      });

      return {
        userId: user.id,
        balances: afterSnapshot.balances,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}
