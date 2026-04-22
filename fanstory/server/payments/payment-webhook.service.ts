import "server-only";

import type { Prisma } from "@/lib/db/generated/client";
import { getServerEnv } from "@/lib/env/server";
import { prisma } from "@/lib/db/client";
import { logPayment } from "@/server/payments/logger";
import { getPaymentProvider } from "@/server/payments/provider";
import { reconcilePaymentSnapshot } from "@/server/payments/payment-sync.service";
import { isAllowedYookassaWebhookIp } from "@/server/payments/providers/yookassa/ip-allowlist";

function getRelevantRemoteIp(remoteIp: string | null) {
  if (!remoteIp) {
    return null;
  }

  return remoteIp.split(",")[0]?.trim() ?? null;
}

function toJsonValue(value: unknown) {
  return value as Prisma.InputJsonValue;
}

export async function handlePaymentWebhook(input: {
  payload: unknown;
  remoteIp: string | null;
}) {
  const env = getServerEnv();
  const provider = getPaymentProvider();
  const parsedWebhook = provider.parseWebhook({
    payload: input.payload,
    remoteIp: getRelevantRemoteIp(input.remoteIp),
  });

  let webhookEvent = await prisma.paymentWebhookEvent.findUnique({
    where: {
      dedupKey: parsedWebhook.dedupKey,
    },
  });

  if (
    webhookEvent?.status === "PROCESSED" ||
    webhookEvent?.status === "IGNORED"
  ) {
    logPayment("info", {
      event: "webhook.duplicate_ignored",
      provider: parsedWebhook.provider,
      providerPaymentId: parsedWebhook.providerPaymentId,
      webhookEvent: parsedWebhook.eventType,
    });
    return;
  }

  if (!webhookEvent) {
    webhookEvent = await prisma.paymentWebhookEvent.create({
      data: {
        provider: parsedWebhook.provider,
        eventType: parsedWebhook.eventType,
        providerObjectId: parsedWebhook.providerPaymentId,
        dedupKey: parsedWebhook.dedupKey,
        remoteIp: parsedWebhook.remoteIp,
        payload: toJsonValue(parsedWebhook.raw),
      },
    });
  }

  if (
    env.YOOKASSA_WEBHOOK_IP_CHECK &&
    !isAllowedYookassaWebhookIp(parsedWebhook.remoteIp)
  ) {
    await prisma.paymentWebhookEvent.update({
      where: {
        id: webhookEvent.id,
      },
      data: {
        status: "FAILED",
        errorMessage: "Webhook IP address is not in the YooKassa allowlist.",
      },
    });

    throw new Error("Webhook IP address is not allowed.");
  }

  if (!parsedWebhook.eventType.startsWith("payment.")) {
    await prisma.paymentWebhookEvent.update({
      where: {
        id: webhookEvent.id,
      },
      data: {
        status: "IGNORED",
        processedAt: new Date(),
      },
    });

    return;
  }

  const payment = await prisma.payment.findUnique({
    where: {
      providerPaymentId: parsedWebhook.providerPaymentId,
    },
  });

  if (!payment) {
    await prisma.paymentWebhookEvent.update({
      where: {
        id: webhookEvent.id,
      },
      data: {
        status: "FAILED",
        errorMessage: "Payment record was not found.",
      },
    });

    throw new Error("Payment record was not found for the webhook event.");
  }

  try {
    const snapshot = await provider.getPayment(parsedWebhook.providerPaymentId);

    await reconcilePaymentSnapshot({
      paymentId: payment.id,
      snapshot,
      webhookReceivedAt: new Date(),
    });

    await prisma.paymentWebhookEvent.update({
      where: {
        id: webhookEvent.id,
      },
      data: {
        paymentId: payment.id,
        status: "PROCESSED",
        processedAt: new Date(),
        errorMessage: null,
      },
    });

    logPayment("info", {
      event: "webhook.processed",
      paymentId: payment.id,
      provider: parsedWebhook.provider,
      providerPaymentId: parsedWebhook.providerPaymentId,
      webhookEvent: parsedWebhook.eventType,
      status: snapshot.status,
    });
  } catch (error) {
    await prisma.paymentWebhookEvent.update({
      where: {
        id: webhookEvent.id,
      },
      data: {
        paymentId: payment.id,
        status: "FAILED",
        errorMessage:
          error instanceof Error ? error.message : "Unknown webhook error.",
      },
    });

    logPayment(
      "error",
      {
        event: "webhook.failed",
        paymentId: payment.id,
        provider: parsedWebhook.provider,
        providerPaymentId: parsedWebhook.providerPaymentId,
        webhookEvent: parsedWebhook.eventType,
      },
      error,
    );

    throw error;
  }
}
