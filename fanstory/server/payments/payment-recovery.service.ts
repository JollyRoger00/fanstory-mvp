import "server-only";

import type { PaymentStatus } from "@/lib/db/generated/client";
import { prisma } from "@/lib/db/client";
import { paymentsEnabled } from "@/lib/env/server";
import { logPayment } from "@/server/payments/logger";
import { getPaymentProvider } from "@/server/payments/provider";
import { reconcilePaymentSnapshot } from "@/server/payments/payment-sync.service";

const recoverableStatuses: PaymentStatus[] = [
  "PENDING",
  "WAITING_FOR_CAPTURE",
  "SUCCEEDED",
];

export async function reconcilePendingPaymentsForUser(
  userId: string,
  take = 6,
) {
  if (!paymentsEnabled()) {
    return;
  }

  const pendingPayments = await prisma.payment.findMany({
    where: {
      userId,
      applyStatus: "PENDING",
      providerPaymentId: {
        not: null,
      },
      status: {
        in: recoverableStatuses,
      },
    },
    select: {
      id: true,
      purchaseId: true,
      providerPaymentId: true,
      status: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
  });

  if (!pendingPayments.length) {
    return;
  }

  const provider = getPaymentProvider();

  for (const payment of pendingPayments) {
    try {
      const snapshot = await provider.getPayment(payment.providerPaymentId!);

      await reconcilePaymentSnapshot({
        paymentId: payment.id,
        snapshot,
      });

      logPayment("info", {
        event: "payment.recovered",
        paymentId: payment.id,
        purchaseId: payment.purchaseId,
        provider: provider.provider,
        providerPaymentId: payment.providerPaymentId,
        status: snapshot.status,
      });
    } catch (error) {
      logPayment(
        "warn",
        {
          event: "payment.recovery_failed",
          paymentId: payment.id,
          purchaseId: payment.purchaseId,
          provider: provider.provider,
          providerPaymentId: payment.providerPaymentId,
          status: payment.status,
        },
        error,
      );
    }
  }
}
