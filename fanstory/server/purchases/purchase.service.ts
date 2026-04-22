import "server-only";

import type { Prisma } from "@/lib/db/generated/client";

type ApplyChapterPackPurchaseInput = {
  userId: string;
  purchaseId: string;
  paymentId: string;
  product: {
    code: string;
    name: string;
    chapterAmount: number | null;
  };
};

function getExistingMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getChapterPackGrantDedupKey(purchaseId: string) {
  return `purchase-pack:${purchaseId}`;
}

export async function applyChapterPackPurchase(
  tx: Prisma.TransactionClient,
  input: ApplyChapterPackPurchaseInput,
) {
  if (!input.product.chapterAmount) {
    throw new Error("Chapter pack configuration is invalid.");
  }

  const purchase = await tx.purchase.findUniqueOrThrow({
    where: {
      id: input.purchaseId,
    },
    select: {
      metadata: true,
    },
  });

  await tx.chapterEntitlementLedger.upsert({
    where: {
      dedupKey: getChapterPackGrantDedupKey(input.purchaseId),
    },
    update: {},
    create: {
      userId: input.userId,
      purchaseId: input.purchaseId,
      eventType: "GRANT",
      source: "PURCHASE_PACK",
      quantity: input.product.chapterAmount,
      dedupKey: getChapterPackGrantDedupKey(input.purchaseId),
      metadata: {
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
      },
    },
  });
}
