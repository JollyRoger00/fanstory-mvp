import "server-only";

import { addDays, addYears } from "date-fns";
import { Prisma } from "@/lib/db/generated/client";
import { prisma } from "@/lib/db/client";
import { ResourceNotFoundError } from "@/lib/errors/app-error";
import {
  adminCancelSubscriptionSchema,
  adminGrantSubscriptionSchema,
} from "@/lib/validations/admin";
import { requireAdmin } from "@/server/admin/admin-auth";
import { recordAdminAuditLog } from "@/server/admin/admin-audit.service";
import {
  getNextUtcDayStart,
  getUtcDayStart,
} from "@/server/monetization/entitlement.service";

function getSubscriptionEndsAt(
  interval: "MONTHLY" | "YEARLY" | "LIFETIME",
  now: Date,
) {
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

export async function grantAdminUserSubscription(payload: unknown) {
  const admin = await requireAdmin();
  const input = adminGrantSubscriptionSchema.parse(payload);

  return prisma.$transaction(
    async (tx) => {
      const [user, product, currentSubscriptions] = await Promise.all([
        tx.user.findUnique({
          where: {
            id: input.userId,
          },
          select: {
            id: true,
          },
        }),
        tx.monetizationProduct.findFirst({
          where: {
            id: input.productId,
            type: "SUBSCRIPTION",
            status: "ACTIVE",
          },
          select: {
            id: true,
            code: true,
            name: true,
            interval: true,
            dailyChapterLimit: true,
          },
        }),
        tx.subscription.findMany({
          where: {
            userId: input.userId,
            productId: {
              not: null,
            },
            status: {
              in: ["ACTIVE", "TRIALING"],
            },
          },
          include: {
            product: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        }),
      ]);

      if (!user) {
        throw new ResourceNotFoundError("User not found.");
      }

      if (!product?.interval || !product.dailyChapterLimit) {
        throw new Error("Subscription product is not valid for manual grant.");
      }

      const now = new Date();
      const dayStart = getUtcDayStart(now);
      const endsAt = getSubscriptionEndsAt(product.interval, now);

      await tx.subscription.updateMany({
        where: {
          id: {
            in: currentSubscriptions.map((subscription) => subscription.id),
          },
        },
        data: {
          status: "CANCELED",
          canceledAt: now,
        },
      });

      const subscription = await tx.subscription.create({
        data: {
          userId: user.id,
          productId: product.id,
          status: "ACTIVE",
          startsAt: now,
          renewsAt: endsAt,
          endsAt,
          metadata: {
            source: "admin_manual",
            adminUserId: admin.id,
            reason: input.reason,
            productCode: product.code,
          },
        },
      });

      await tx.chapterEntitlementLedger.upsert({
        where: {
          dedupKey: getSubscriptionGrantDedupKey(subscription.id, dayStart),
        },
        update: {},
        create: {
          userId: user.id,
          subscriptionId: subscription.id,
          eventType: "GRANT",
          source: "SUBSCRIPTION_DAILY",
          quantity: product.dailyChapterLimit,
          effectiveDate: dayStart,
          dedupKey: getSubscriptionGrantDedupKey(subscription.id, dayStart),
          metadata: {
            dailyLimit: product.dailyChapterLimit,
            resetTimezone: "UTC",
            resetAt: getNextUtcDayStart(now).toISOString(),
            productCode: product.code,
            productName: product.name,
            source: "admin_manual",
            adminUserId: admin.id,
            reason: input.reason,
          },
        },
      });

      await recordAdminAuditLog(tx, {
        adminUserId: admin.id,
        targetUserId: user.id,
        action: "subscription.granted",
        entityType: "SUBSCRIPTION",
        entityId: subscription.id,
        before: currentSubscriptions.map((item) => ({
          id: item.id,
          status: item.status,
          productCode: item.product?.code ?? null,
          productName: item.product?.name ?? null,
          endsAt: item.endsAt,
        })),
        after: {
          id: subscription.id,
          status: subscription.status,
          productCode: product.code,
          productName: product.name,
          endsAt: subscription.endsAt,
        },
        reason: input.reason,
      });

      return subscription;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function cancelAdminUserSubscription(payload: unknown) {
  const admin = await requireAdmin();
  const input = adminCancelSubscriptionSchema.parse(payload);

  return prisma.$transaction(async (tx) => {
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

    const now = new Date();
    const subscriptions = await tx.subscription.findMany({
      where: {
        userId: user.id,
        productId: {
          not: null,
        },
        status: {
          in: ["ACTIVE", "TRIALING"],
        },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      include: {
        product: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    if (!subscriptions.length) {
      throw new Error("The user has no active subscription to cancel.");
    }

    await tx.subscription.updateMany({
      where: {
        id: {
          in: subscriptions.map((subscription) => subscription.id),
        },
      },
      data: {
        status: "CANCELED",
        canceledAt: now,
        endsAt: now,
      },
    });

    await recordAdminAuditLog(tx, {
      adminUserId: admin.id,
      targetUserId: user.id,
      action: "subscription.canceled",
      entityType: "USER",
      entityId: user.id,
      before: subscriptions.map((subscription) => ({
        id: subscription.id,
        status: subscription.status,
        productCode: subscription.product?.code ?? null,
        productName: subscription.product?.name ?? null,
        endsAt: subscription.endsAt,
      })),
      after: subscriptions.map((subscription) => ({
        id: subscription.id,
        status: "CANCELED",
        endsAt: now,
      })),
      reason: input.reason,
    });

    return {
      userId: user.id,
      canceledCount: subscriptions.length,
    };
  });
}
