import "server-only";

import type { WalletOverview } from "@/entities/wallet/types";
import { FeatureDisabledError } from "@/lib/errors/app-error";
import { prisma } from "@/lib/db/client";
import { devBillingToolsEnabled, getServerEnv } from "@/lib/env/server";

type WalletExecutor = Pick<
  typeof prisma,
  "wallet" | "walletTransaction" | "purchase"
>;

export async function ensureWalletRecord(
  executor: WalletExecutor,
  userId: string,
) {
  const env = getServerEnv();

  return executor.wallet.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      balance: env.STORY_STARTER_CREDITS,
      transactions: {
        create: {
          userId,
          type: "STARTER_GRANT",
          amount: env.STORY_STARTER_CREDITS,
          balanceAfter: env.STORY_STARTER_CREDITS,
          description: "Starter credits granted on first sign-in.",
        },
      },
    },
  });
}

export async function getWalletOverview(
  userId: string,
): Promise<WalletOverview> {
  await ensureWalletRecord(prisma, userId);

  const wallet = await prisma.wallet.findUniqueOrThrow({
    where: { userId },
    include: {
      transactions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 12,
      },
    },
  });

  return {
    balance: wallet.balance,
    currency: wallet.currency,
    transactions: wallet.transactions,
  };
}

export async function grantDemoCredits(userId: string) {
  if (!devBillingToolsEnabled()) {
    throw new FeatureDisabledError(
      "Development billing tools are disabled in the current environment.",
    );
  }

  const env = getServerEnv();

  await prisma.$transaction(async (tx) => {
    const wallet = await ensureWalletRecord(tx, userId);

    const purchase = await tx.purchase.create({
      data: {
        userId,
        walletId: wallet.id,
        type: "CREDIT_TOP_UP",
        status: "COMPLETED",
        amount: env.STORY_DEMO_TOP_UP_AMOUNT,
        description:
          "Demo credit top-up placeholder until real payments are integrated.",
      },
    });

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: env.STORY_DEMO_TOP_UP_AMOUNT,
        },
      },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        purchaseId: purchase.id,
        type: "CREDIT_TOP_UP",
        amount: env.STORY_DEMO_TOP_UP_AMOUNT,
        balanceAfter: updatedWallet.balance,
        description:
          "Demo credits added to unblock chapter purchases during local development.",
      },
    });
  });
}
