import "server-only";

import { FeatureDisabledError } from "@/lib/errors/app-error";
import { prisma } from "@/lib/db/client";
import { devBillingToolsEnabled } from "@/lib/env/server";
import { purchaseProductSchema } from "@/lib/validations/purchase";

export async function purchaseChapterPack(userId: string, payload: unknown) {
  if (!devBillingToolsEnabled()) {
    throw new FeatureDisabledError(
      "Mock purchases are disabled in the current environment.",
    );
  }

  const input = purchaseProductSchema.parse(payload);
  const product = await prisma.monetizationProduct.findFirstOrThrow({
    where: {
      id: input.productId,
      type: "CHAPTER_PACK",
      status: "ACTIVE",
    },
  });

  const chapterAmount = product.chapterAmount;

  if (!chapterAmount) {
    throw new Error("Chapter pack configuration is invalid.");
  }

  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        userId,
        productId: product.id,
        type: "CHAPTER_PACK",
        status: "COMPLETED",
        amount: product.priceRubles,
        description: `Purchased ${product.name}.`,
        metadata: {
          productCode: product.code,
        },
      },
    });

    await tx.chapterEntitlementLedger.create({
      data: {
        userId,
        purchaseId: purchase.id,
        eventType: "GRANT",
        source: "PURCHASE_PACK",
        quantity: chapterAmount,
        metadata: {
          productCode: product.code,
          productName: product.name,
        },
      },
    });
  });
}
