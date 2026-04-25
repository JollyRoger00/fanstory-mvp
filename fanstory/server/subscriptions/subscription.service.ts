import "server-only";

import { addDays, addYears } from "date-fns";
import type {
  Prisma,
  SubscriptionInterval,
} from "@/lib/db/generated/client";
import type { SubscriptionOverview } from "@/entities/subscription/types";
import { prisma } from "@/lib/db/client";
import { paymentsEnabled } from "@/lib/env/server";
import { getMonetizationCatalog } from "@/server/monetization/catalog.service";
import {
  getActiveSubscriptionRecord,
  getEntitlementSnapshot,
  getNextUtcDayStart,
  getUtcDayStart,
} from "@/server/monetization/entitlement.service";
import { reconcilePendingPaymentsForUser } from "@/server/payments/payment-recovery.service";

type ActivateSubscriptionFromPurchaseInput = {
  userId: string;
  purchaseId: string;
  paymentId: string;
  product: {
    id: string;
    code: string;
    name: string;
    interval: SubscriptionInterval | null;
    dailyChapterLimit: number | null;
  };
};

function getExistingMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getSubscriptionEndsAt(interval: SubscriptionInterval, now: Date) {
  switch (interval) {
    case "YEARLY":
      return addYears(now, 1);
    case "LIFETIME":
      return null;
    case "MONTHLY":
    default:
      return addDays(now, 30);
  }
}

function getSubscriptionGrantDedupKey(subscriptionId: string, dayStart: Date) {
  return `subscription-daily:${subscriptionId}:${dayStart.toISOString()}`;
}

export async function getActiveSubscription(userId: string) {
  return getActiveSubscriptionRecord(prisma, userId);
}

export async function getSubscriptionOverview(
  userId: string,
): Promise<SubscriptionOverview> {
  await reconcilePendingPaymentsForUser(userId);

  const [snapshot, catalog] = await Promise.all([
    getEntitlementSnapshot(userId),
    getMonetizationCatalog(),
  ]);

  return {
    activeSubscription: snapshot.activeSubscription,
    plans: catalog.subscriptions,
    dailyResetAt: snapshot.dailyResetAt,
    paymentsEnabled: paymentsEnabled(),
  };
}

export async function activateSubscriptionFromPurchase(
  tx: Prisma.TransactionClient,
  input: ActivateSubscriptionFromPurchaseInput,
) {
  if (!input.product.interval || !input.product.dailyChapterLimit) {
    throw new Error("Subscription product configuration is invalid.");
  }

  const purchase = await tx.purchase.findUniqueOrThrow({
    where: {
      id: input.purchaseId,
    },
    select: {
      metadata: true,
    },
  });

  const now = new Date();
  const dayStart = getUtcDayStart(now);
  const endsAt = getSubscriptionEndsAt(input.product.interval, now);

  await tx.subscription.updateMany({
    where: {
      userId: input.userId,
      status: {
        in: ["ACTIVE", "TRIALING"],
      },
      purchaseId: {
        not: input.purchaseId,
      },
    },
    data: {
      status: "CANCELED",
      canceledAt: now,
    },
  });

  const existingSubscription = await tx.subscription.findUnique({
    where: {
      purchaseId: input.purchaseId,
    },
  });

  const subscription = existingSubscription
    ? await tx.subscription.update({
        where: {
          id: existingSubscription.id,
        },
        data: {
          productId: input.product.id,
          purchaseId: input.purchaseId,
          status: "ACTIVE",
          startsAt: now,
          renewsAt: endsAt,
          endsAt,
          canceledAt: null,
          metadata: {
            ...getExistingMetadata(existingSubscription.metadata),
            source: "payment",
            paymentId: input.paymentId,
            productCode: input.product.code,
          },
        },
      })
    : await tx.subscription.create({
        data: {
          userId: input.userId,
          productId: input.product.id,
          purchaseId: input.purchaseId,
          status: "ACTIVE",
          startsAt: now,
          renewsAt: endsAt,
          endsAt,
          metadata: {
            source: "payment",
            paymentId: input.paymentId,
            productCode: input.product.code,
          },
        },
      });

  await tx.chapterEntitlementLedger.upsert({
    where: {
      dedupKey: getSubscriptionGrantDedupKey(subscription.id, dayStart),
    },
    update: {},
    create: {
      userId: input.userId,
      subscriptionId: subscription.id,
      eventType: "GRANT",
      source: "SUBSCRIPTION_DAILY",
      quantity: input.product.dailyChapterLimit,
      effectiveDate: dayStart,
      dedupKey: getSubscriptionGrantDedupKey(subscription.id, dayStart),
      metadata: {
        dailyLimit: input.product.dailyChapterLimit,
        resetTimezone: "UTC",
        resetAt: getNextUtcDayStart(now).toISOString(),
        paymentId: input.paymentId,
        productCode: input.product.code,
        productName: input.product.name,
      },
    },
  });

  await tx.purchase.update({
    where: {
      id: input.purchaseId,
    },
    data: {
      status: "COMPLETED",
      metadata: {
        ...getExistingMetadata(purchase.metadata),
        paymentId: input.paymentId,
        productCode: input.product.code,
        subscriptionId: subscription.id,
      },
    },
  });

  return subscription;
}
