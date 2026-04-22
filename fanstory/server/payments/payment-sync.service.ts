import "server-only";

import type { Prisma } from "@/lib/db/generated/client";
import { prisma } from "@/lib/db/client";
import { applyConfirmedPaymentInTransaction } from "@/server/payments/payment-fulfillment.service";
import type { ExternalPaymentSnapshot } from "@/server/payments/types";

function getExistingPayload(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Prisma.InputJsonValue;
  }

  return value as Prisma.InputJsonValue;
}

function toJsonValue(value: unknown) {
  return value as Prisma.InputJsonValue;
}

export async function reconcilePaymentSnapshot(input: {
  paymentId: string;
  snapshot: ExternalPaymentSnapshot;
  webhookReceivedAt?: Date;
}) {
  return prisma.$transaction(async (tx) => {
    const currentPayment = await tx.payment.findUniqueOrThrow({
      where: {
        id: input.paymentId,
      },
      include: {
        purchase: true,
      },
    });

    const now = new Date();
    const nextStatus = input.snapshot.status;

    await tx.payment.update({
      where: {
        id: input.paymentId,
      },
      data: {
        providerPaymentId: input.snapshot.providerPaymentId,
        status: nextStatus,
        confirmationUrl: input.snapshot.confirmationUrl,
        failureReason: input.snapshot.failureReason,
        providerPayload: toJsonValue(input.snapshot.raw),
        paidAt: input.snapshot.paidAt ?? currentPayment.paidAt,
        canceledAt: input.snapshot.canceledAt ?? currentPayment.canceledAt,
        lastSyncedAt: now,
        lastWebhookAt: input.webhookReceivedAt ?? currentPayment.lastWebhookAt,
      },
    });

    if (
      nextStatus === "CANCELED" &&
      currentPayment.purchase.status === "PENDING"
    ) {
      await tx.purchase.update({
        where: {
          id: currentPayment.purchaseId,
        },
        data: {
          status: "CANCELED",
          metadata: getExistingPayload(currentPayment.purchase.metadata),
        },
      });
    }

    if (nextStatus === "SUCCEEDED") {
      await applyConfirmedPaymentInTransaction(tx, input.paymentId);
    }

    return tx.payment.findUniqueOrThrow({
      where: {
        id: input.paymentId,
      },
      include: {
        product: true,
      },
    });
  });
}
