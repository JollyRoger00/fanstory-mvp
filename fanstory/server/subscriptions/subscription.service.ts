import "server-only";

import { addDays, addYears } from "date-fns";
import type { SubscriptionOverview } from "@/entities/subscription/types";
import { FeatureDisabledError } from "@/lib/errors/app-error";
import { prisma } from "@/lib/db/client";
import { devBillingToolsEnabled } from "@/lib/env/server";
import { getMonetizationCatalog } from "@/server/monetization/catalog.service";
import {
  getActiveSubscriptionRecord,
  getEntitlementSnapshot,
} from "@/server/monetization/entitlement.service";

export async function getActiveSubscription(userId: string) {
  return getActiveSubscriptionRecord(prisma, userId);
}

export async function getSubscriptionOverview(
  userId: string,
): Promise<SubscriptionOverview> {
  const [snapshot, catalog] = await Promise.all([
    getEntitlementSnapshot(userId),
    getMonetizationCatalog(),
  ]);

  return {
    activeSubscription: snapshot.activeSubscription,
    plans: catalog.subscriptions,
    dailyResetAt: snapshot.dailyResetAt,
  };
}

export async function activateMockSubscription(
  userId: string,
  productId: string,
) {
  if (!devBillingToolsEnabled()) {
    throw new FeatureDisabledError(
      "Mock subscriptions are disabled in the current environment.",
    );
  }

  const product = await prisma.monetizationProduct.findFirstOrThrow({
    where: {
      id: productId,
      type: "SUBSCRIPTION",
      status: "ACTIVE",
    },
  });

  if (!product.interval || !product.dailyChapterLimit) {
    throw new Error("Subscription product configuration is invalid.");
  }

  const now = new Date();
  const endsAt =
    product.interval === "YEARLY"
      ? addYears(now, 1)
      : product.interval === "LIFETIME"
        ? null
        : addDays(now, 30);

  await prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: {
        userId,
        status: {
          in: ["ACTIVE", "TRIALING"],
        },
      },
      data: {
        status: "CANCELED",
        canceledAt: now,
      },
    });

    const subscription = await tx.subscription.create({
      data: {
        userId,
        productId: product.id,
        status: "ACTIVE",
        startsAt: now,
        renewsAt: endsAt,
        endsAt,
        metadata: {
          source: "mock-activation",
          productCode: product.code,
        },
      },
      include: {
        product: true,
      },
    });

    await tx.purchase.create({
      data: {
        userId,
        productId: product.id,
        type: "SUBSCRIPTION",
        status: "COMPLETED",
        amount: product.priceRubles,
        description: `Activated ${product.name}.`,
        metadata: {
          productCode: product.code,
        },
      },
    });

    const dayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    await tx.chapterEntitlementLedger.upsert({
      where: {
        dedupKey: `subscription-daily:${subscription.id}:${dayStart.toISOString()}`,
      },
      update: {},
      create: {
        userId,
        subscriptionId: subscription.id,
        eventType: "GRANT",
        source: "SUBSCRIPTION_DAILY",
        quantity: subscription.product?.dailyChapterLimit ?? 25,
        effectiveDate: dayStart,
        dedupKey: `subscription-daily:${subscription.id}:${dayStart.toISOString()}`,
        metadata: {
          dailyLimit: subscription.product?.dailyChapterLimit ?? 25,
          resetTimezone: "UTC",
          resetAt: new Date(
            dayStart.getTime() + 24 * 60 * 60 * 1000,
          ).toISOString(),
          productCode: subscription.product?.code,
        },
      },
    });
  });
}
