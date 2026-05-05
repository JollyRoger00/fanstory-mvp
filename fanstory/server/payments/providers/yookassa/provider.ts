import "server-only";

import type { PaymentStatus } from "@/lib/db/generated/client";
import {
  yookassaPaymentSchema,
  yookassaWebhookSchema,
} from "@/server/payments/providers/yookassa/schemas";
import { getServerEnv } from "@/lib/env/server";
import type {
  CreateExternalPaymentInput,
  ExternalPaymentSnapshot,
  ParsedPaymentWebhook,
  PaymentProviderAdapter,
} from "@/server/payments/types";
import { yookassaRequest } from "@/server/payments/providers/yookassa/client";

function mapStatus(status: string): PaymentStatus {
  switch (status) {
    case "pending":
      return "PENDING";
    case "waiting_for_capture":
      return "WAITING_FOR_CAPTURE";
    case "succeeded":
      return "SUCCEEDED";
    case "canceled":
      return "CANCELED";
    default:
      return "FAILED";
  }
}

function mapSnapshot(raw: unknown): ExternalPaymentSnapshot {
  const payment = yookassaPaymentSchema.parse(raw);

  return {
    provider: "YOOKASSA",
    providerPaymentId: payment.id,
    status: mapStatus(payment.status),
    confirmationUrl: payment.confirmation?.confirmation_url ?? null,
    paidAt: payment.captured_at ? new Date(payment.captured_at) : null,
    canceledAt: payment.status === "canceled" ? new Date() : null,
    failureReason:
      payment.cancellation_details?.reason ??
      payment.cancellation_details?.party ??
      null,
    raw: payment,
  };
}

function toAmountValue(amountRubles: number) {
  return amountRubles.toFixed(2);
}

function getReceipt(input: CreateExternalPaymentInput) {
  const env = getServerEnv();

  if (!env.YOOKASSA_RECEIPT_ENABLED) {
    return undefined;
  }

  if (!input.userEmail) {
    throw new Error("User email is required for YooKassa receipt creation.");
  }

  return {
    customer: {
      email: input.userEmail,
    },
    items: [
      {
        description: input.productName.slice(0, 128),
        quantity: 1.0,
        amount: {
          value: toAmountValue(input.amountRubles),
          currency: input.currency,
        },
        vat_code: env.YOOKASSA_RECEIPT_VAT_CODE,
        payment_mode: "full_prepayment",
        payment_subject: "service",
      },
    ],
  };
}

export class YookassaPaymentProvider implements PaymentProviderAdapter {
  readonly provider = "YOOKASSA" as const;

  async createPayment(
    input: CreateExternalPaymentInput,
  ): Promise<ExternalPaymentSnapshot> {
    const receipt = getReceipt(input);
    const response = await yookassaRequest("/payments", {
      method: "POST",
      idempotenceKey: input.paymentId,
      body: {
        amount: {
          value: toAmountValue(input.amountRubles),
          currency: input.currency,
        },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: input.returnUrl,
        },
        description: input.description,
        metadata: {
          internal_payment_id: input.paymentId,
          internal_purchase_id: input.purchaseId,
          user_id: input.userId,
          product_code: input.productCode,
        },
        ...(receipt
          ? {
              receipt,
            }
          : {}),
      },
    });

    return mapSnapshot(response);
  }

  async getPayment(providerPaymentId: string): Promise<ExternalPaymentSnapshot> {
    const response = await yookassaRequest(`/payments/${providerPaymentId}`);
    return mapSnapshot(response);
  }

  parseWebhook(input: {
    payload: unknown;
    remoteIp: string | null;
  }): ParsedPaymentWebhook {
    const notification = yookassaWebhookSchema.parse(input.payload);

    return {
      provider: "YOOKASSA",
      eventType: notification.event,
      providerPaymentId: notification.object.id,
      status: mapStatus(notification.object.status),
      dedupKey: [
        "yookassa",
        notification.event,
        notification.object.id,
        notification.object.status,
      ].join(":"),
      remoteIp: input.remoteIp,
      raw: notification,
    };
  }
}
