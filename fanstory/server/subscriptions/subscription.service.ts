import "server-only";

import { addDays, addYears } from "date-fns";
import type { SubscriptionOverview } from "@/entities/subscription/types";
import { FeatureDisabledError } from "@/lib/errors/app-error";
import { prisma } from "@/lib/db/client";
import { devBillingToolsEnabled } from "@/lib/env/server";

export async function getActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ["ACTIVE", "TRIALING"],
      },
      OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function hasActiveSubscription(userId: string) {
  const subscription = await getActiveSubscription(userId);
  return Boolean(subscription?.plan.unlimitedPremiumAccess);
}

export async function getSubscriptionOverview(
  userId: string,
): Promise<SubscriptionOverview> {
  const [activeSubscription, plans] = await Promise.all([
    getActiveSubscription(userId),
    prisma.subscriptionPlan.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: [{ priceCredits: "asc" }, { name: "asc" }],
    }),
  ]);

  return {
    activePlanName: activeSubscription?.plan.name ?? null,
    status: activeSubscription?.status ?? null,
    endsAt: activeSubscription?.endsAt ?? null,
    plans: plans.map((plan) => ({
      ...plan,
      metadata: (plan.metadata as Record<string, unknown> | null) ?? null,
    })),
  };
}

export async function activateMockSubscription(userId: string, planId: string) {
  if (!devBillingToolsEnabled()) {
    throw new FeatureDisabledError(
      "Development billing tools are disabled in the current environment.",
    );
  }

  const plan = await prisma.subscriptionPlan.findUniqueOrThrow({
    where: { id: planId },
  });

  const now = new Date();
  const endsAt =
    plan.interval === "YEARLY"
      ? addYears(now, 1)
      : plan.interval === "LIFETIME"
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

    await tx.subscription.create({
      data: {
        userId,
        planId,
        status: "ACTIVE",
        startsAt: now,
        renewsAt: endsAt,
        endsAt,
        metadata: {
          source: "mock-activation",
          note: "Replace with payment provider webhook flow later.",
        },
      },
    });

    await tx.purchase.create({
      data: {
        userId,
        subscriptionPlanId: plan.id,
        type: "SUBSCRIPTION",
        status: "COMPLETED",
        amount: 0,
        description: `Mock activation of ${plan.name}.`,
      },
    });
  });
}
