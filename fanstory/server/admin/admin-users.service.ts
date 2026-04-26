import "server-only";

import type {
  AdminOverviewView,
  AdminUserDetailView,
  AdminUsersListView,
} from "@/entities/admin/types";
import { prisma } from "@/lib/db/client";
import { ResourceNotFoundError } from "@/lib/errors/app-error";
import {
  adminEntityIdSchema,
  adminUpdateUserRoleSchema,
  adminUsersQuerySchema,
} from "@/lib/validations/admin";
import { requireAdmin, resolveAdminAccess } from "@/server/admin/admin-auth";
import { recordAdminAuditLog } from "@/server/admin/admin-audit.service";
import { buildPagination, clampNonNegative, getPromptVersionModel } from "@/server/admin/shared";
import { getMonetizationCatalog } from "@/server/monetization/catalog.service";
import {
  getEntitlementSnapshot,
  getNextUtcDayStart,
  getUtcDayStart,
} from "@/server/monetization/entitlement.service";

function buildUserSearchWhere(query: string) {
  if (!query) {
    return {};
  }

  return {
    OR: [
      {
        id: {
          contains: query,
        },
      },
      {
        email: {
          contains: query,
          mode: "insensitive" as const,
        },
      },
      {
        name: {
          contains: query,
          mode: "insensitive" as const,
        },
      },
    ],
  };
}

async function getChapterBalanceMap(userIds: string[], now = new Date()) {
  if (!userIds.length) {
    return new Map<
      string,
      {
        welcome: number;
        subscriptionDaily: number;
        purchased: number;
        rewardedAd: number;
        total: number;
      }
    >();
  }

  const dayStart = getUtcDayStart(now);
  const nextDayStart = getNextUtcDayStart(now);
  const [welcome, subscriptionDaily, purchased, rewardedAd] = await Promise.all(
    [
      prisma.chapterEntitlementLedger.groupBy({
        by: ["userId"],
        where: {
          userId: {
            in: userIds,
          },
          source: "WELCOME",
        },
        _sum: {
          quantity: true,
        },
      }),
      prisma.chapterEntitlementLedger.groupBy({
        by: ["userId"],
        where: {
          userId: {
            in: userIds,
          },
          source: "SUBSCRIPTION_DAILY",
          effectiveDate: {
            gte: dayStart,
            lt: nextDayStart,
          },
        },
        _sum: {
          quantity: true,
        },
      }),
      prisma.chapterEntitlementLedger.groupBy({
        by: ["userId"],
        where: {
          userId: {
            in: userIds,
          },
          source: "PURCHASE_PACK",
        },
        _sum: {
          quantity: true,
        },
      }),
      prisma.chapterEntitlementLedger.groupBy({
        by: ["userId"],
        where: {
          userId: {
            in: userIds,
          },
          source: "REWARDED_AD",
        },
        _sum: {
          quantity: true,
        },
      }),
    ],
  );

  const map = new Map<
    string,
    {
      welcome: number;
      subscriptionDaily: number;
      purchased: number;
      rewardedAd: number;
      total: number;
    }
  >();

  for (const userId of userIds) {
    const welcomeValue = clampNonNegative(
      welcome.find((entry) => entry.userId === userId)?._sum.quantity,
    );
    const subscriptionValue = clampNonNegative(
      subscriptionDaily.find((entry) => entry.userId === userId)?._sum.quantity,
    );
    const purchasedValue = clampNonNegative(
      purchased.find((entry) => entry.userId === userId)?._sum.quantity,
    );
    const rewardedValue = clampNonNegative(
      rewardedAd.find((entry) => entry.userId === userId)?._sum.quantity,
    );

    map.set(userId, {
      welcome: welcomeValue,
      subscriptionDaily: subscriptionValue,
      purchased: purchasedValue,
      rewardedAd: rewardedValue,
      total:
        welcomeValue + subscriptionValue + purchasedValue + rewardedValue,
    });
  }

  return map;
}

export async function getAdminOverview(): Promise<AdminOverviewView> {
  await requireAdmin();
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersLast24Hours,
    totalStories,
    totalPayments,
    successfulPayments,
    activeSubscriptions,
    generationErrorsLast24Hours,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: since,
        },
      },
    }),
    prisma.story.count(),
    prisma.payment.count(),
    prisma.payment.count({
      where: {
        status: "SUCCEEDED",
      },
    }),
    prisma.subscription.count({
      where: {
        productId: {
          not: null,
        },
        status: {
          in: ["ACTIVE", "TRIALING"],
        },
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
    }),
    prisma.generationLog.count({
      where: {
        createdAt: {
          gte: since,
        },
        status: {
          not: "SUCCESS",
        },
      },
    }),
  ]);

  return {
    totalUsers,
    newUsersLast24Hours,
    totalStories,
    totalPayments,
    successfulPayments,
    activeSubscriptions,
    generationErrorsLast24Hours,
  };
}

export async function listAdminUsers(
  payload: unknown,
): Promise<AdminUsersListView> {
  await requireAdmin();
  const input = adminUsersQuerySchema.parse(payload);
  const where = buildUserSearchWhere(input.query);
  const skip = (input.page - 1) * input.pageSize;
  const now = new Date();

  const [totalCount, users] = await Promise.all([
    prisma.user.count({
      where,
    }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true,
        role: true,
        wallet: {
          select: {
            balance: true,
          },
        },
        _count: {
          select: {
            stories: true,
            purchases: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: input.pageSize,
    }),
  ]);

  const userIds = users.map((user) => user.id);
  const [chapterBalances, activeSubscriptions] = await Promise.all([
    getChapterBalanceMap(userIds, now),
    prisma.subscription.findMany({
      where: {
        userId: {
          in: userIds,
        },
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
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const activeSubscriptionMap = new Map<
    string,
    {
      id: string;
      name: string;
      endsAt: Date | null;
    }
  >();

  for (const subscription of activeSubscriptions) {
    if (!activeSubscriptionMap.has(subscription.userId)) {
      activeSubscriptionMap.set(subscription.userId, {
        id: subscription.id,
        name: subscription.product?.name ?? "Subscription",
        endsAt: subscription.endsAt,
      });
    }
  }

  return {
    items: users.map((user) => {
      const access = resolveAdminAccess({
        role: user.role,
        email: user.email,
      });
      const balances = chapterBalances.get(user.id) ?? {
        welcome: 0,
        subscriptionDaily: 0,
        purchased: 0,
        rewardedAd: 0,
        total: 0,
      };

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
        role: user.role,
        effectiveAdmin: access.isAdmin,
        adminAccessSource: access.adminAccessSource,
        walletBalance: user.wallet?.balance ?? 0,
        availableChapters: balances.total,
        storiesCount: user._count.stories,
        purchasesCount: user._count.purchases,
        activeSubscription: activeSubscriptionMap.get(user.id) ?? null,
      };
    }),
    pagination: buildPagination({
      page: input.page,
      pageSize: input.pageSize,
      totalCount,
    }),
    query: input.query,
  };
}

export async function getAdminUserDetail(
  userId: string,
): Promise<AdminUserDetailView | null> {
  const admin = await requireAdmin();
  const input = adminEntityIdSchema.parse({
    id: userId,
  });
  const user = await prisma.user.findUnique({
    where: {
      id: input.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
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
    return null;
  }

  const access = resolveAdminAccess({
    role: user.role,
    email: user.email,
  });

  const [snapshot, catalog, walletTransactions, chapterLedger, purchases, subscriptions, stories, generationLogs] =
    await Promise.all([
      getEntitlementSnapshot(user.id),
      getMonetizationCatalog(),
      prisma.walletTransaction.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),
      prisma.chapterEntitlementLedger.findMany({
        where: {
          userId: user.id,
        },
        include: {
          purchase: {
            select: {
              description: true,
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
          subscription: {
            select: {
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
        take: 20,
      }),
      prisma.purchase.findMany({
        where: {
          userId: user.id,
        },
        include: {
          product: {
            select: {
              name: true,
            },
          },
          payment: {
            select: {
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),
      prisma.subscription.findMany({
        where: {
          userId: user.id,
        },
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),
      prisma.story.findMany({
        where: {
          userId: user.id,
        },
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
          _count: {
            select: {
              chapters: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 20,
      }),
      prisma.generationLog.findMany({
        where: {
          userId: user.id,
        },
        include: {
          story: {
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),
    ]);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      effectiveAdmin: access.isAdmin,
      adminAccessSource: access.adminAccessSource,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    wallet: {
      id: user.wallet?.id ?? null,
      balance: user.wallet?.balance ?? 0,
      currency: user.wallet?.currency ?? "CREDITS",
    },
    chapterBalances: {
      total: snapshot.balances.total,
      welcome: snapshot.balances.welcome,
      subscriptionDaily: snapshot.balances.subscriptionDaily,
      purchased: snapshot.balances.purchased,
      rewardedAd: snapshot.balances.rewardedAd,
    },
    activeSubscription: snapshot.activeSubscription
      ? {
          id: snapshot.activeSubscription.id,
          name: snapshot.activeSubscription.name,
          status: snapshot.activeSubscription.status,
          endsAt: snapshot.activeSubscription.endsAt,
        }
      : null,
    availableSubscriptionProducts: catalog.subscriptions.map((product) => ({
      id: product.id,
      name: product.name,
      code: product.code,
      interval: product.interval,
      dailyChapterLimit: product.dailyChapterLimit,
    })),
    walletTransactions: walletTransactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      balanceAfter: transaction.balanceAfter,
      description: transaction.description,
      createdAt: transaction.createdAt,
    })),
    chapterLedger: chapterLedger.map((entry) => ({
      id: entry.id,
      source: entry.source,
      eventType: entry.eventType,
      quantity: entry.quantity,
      createdAt: entry.createdAt,
      description:
        entry.purchase?.product?.name ??
        entry.purchase?.description ??
        entry.subscription?.product?.name ??
        null,
    })),
    purchases: purchases.map((purchase) => ({
      id: purchase.id,
      type: purchase.type,
      status: purchase.status,
      amount: purchase.amount,
      description: purchase.description,
      productName: purchase.product?.name ?? null,
      paymentStatus: purchase.payment?.status ?? null,
      createdAt: purchase.createdAt,
    })),
    subscriptions: subscriptions.map((subscription) => ({
      id: subscription.id,
      status: subscription.status,
      productName: subscription.product?.name ?? null,
      startsAt: subscription.startsAt,
      endsAt: subscription.endsAt,
      renewsAt: subscription.renewsAt,
      canceledAt: subscription.canceledAt,
      createdAt: subscription.createdAt,
    })),
    stories: stories.map((story) => ({
      id: story.id,
      title: story.title,
      universe: story.universe,
      genre: story.genre,
      currentChapterNumber: story.runs[0]?.currentChapterNumber ?? 1,
      chapterCount: story._count.chapters,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    })),
    generationLogs: generationLogs.map((log) => ({
      id: log.id,
      userId: user.id,
      userEmail: user.email,
      storyId: log.storyId,
      storyTitle: log.story.title,
      storyRunId: log.storyRunId,
      provider: log.provider,
      model: getPromptVersionModel(log.promptVersion),
      eventType: log.eventType,
      status: log.status,
      errorMessage: log.errorMessage,
      promptVersion: log.promptVersion,
      createdAt: log.createdAt,
    })),
    canManageRoles: admin.canManageRoles,
  };
}

export async function updateAdminUserRole(payload: unknown) {
  const admin = await requireAdmin();

  if (!admin.canManageRoles) {
    throw new Error("Only role-based admins can change user roles.");
  }

  const input = adminUpdateUserRoleSchema.parse(payload);
  const user = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new ResourceNotFoundError("User not found.");
  }

  const adminKeepsAccessViaEnv =
    admin.email !== null &&
    resolveAdminAccess({
      role: "USER",
      email: admin.email,
    }).isAdmin;

  if (
    admin.id === user.id &&
    input.role === "USER" &&
    !adminKeepsAccessViaEnv
  ) {
    throw new Error("You cannot remove your own last admin access.");
  }

  if (user.role === input.role) {
    return user;
  }

  return prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        role: input.role,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    await recordAdminAuditLog(tx, {
      adminUserId: admin.id,
      targetUserId: user.id,
      action: "user.role.updated",
      entityType: "USER",
      entityId: user.id,
      before: {
        role: user.role,
      },
      after: {
        role: updatedUser.role,
      },
      reason: input.reason,
    });

    return updatedUser;
  });
}
