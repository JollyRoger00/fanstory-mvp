import "server-only";

import type { Prisma } from "@/lib/db/generated/client";
import { applyChapterPackPurchase } from "@/server/purchases/purchase.service";
import { activateSubscriptionFromPurchase } from "@/server/subscriptions/subscription.service";

export async function applyConfirmedPaymentInTransaction(
  tx: Prisma.TransactionClient,
  paymentId: string,
) {
  const payment = await tx.payment.findUniqueOrThrow({
    where: {
      id: paymentId,
    },
    include: {
      purchase: true,
      product: true,
    },
  });

  if (payment.applyStatus === "APPLIED") {
    return payment;
  }

  if (payment.status !== "SUCCEEDED") {
    throw new Error("Only successful payments can be applied.");
  }

  if (payment.product.type === "CHAPTER_PACK") {
    await applyChapterPackPurchase(tx, {
      userId: payment.userId,
      purchaseId: payment.purchaseId,
      paymentId: payment.id,
      product: {
        code: payment.product.code,
        name: payment.product.name,
        chapterAmount: payment.product.chapterAmount,
      },
    });
  } else if (payment.product.type === "SUBSCRIPTION") {
    await activateSubscriptionFromPurchase(tx, {
      userId: payment.userId,
      purchaseId: payment.purchaseId,
      paymentId: payment.id,
      product: {
        id: payment.product.id,
        code: payment.product.code,
        name: payment.product.name,
        interval: payment.product.interval,
        dailyChapterLimit: payment.product.dailyChapterLimit,
      },
    });
  } else {
    throw new Error("Unsupported payment product type.");
  }

  return tx.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      applyStatus: "APPLIED",
      appliedAt: new Date(),
    },
  });
}

