import type { PaymentProvider, PaymentStatus } from "@/lib/db/generated/client";

export type ExternalPaymentSnapshot = {
  provider: PaymentProvider;
  providerPaymentId: string;
  status: PaymentStatus;
  confirmationUrl: string | null;
  paidAt: Date | null;
  canceledAt: Date | null;
  failureReason: string | null;
  raw: unknown;
};

export type CreateExternalPaymentInput = {
  paymentId: string;
  purchaseId: string;
  userId: string;
  userEmail: string | null;
  productCode: string;
  productName: string;
  description: string;
  amountRubles: number;
  currency: string;
  returnUrl: string;
};

export type ParsedPaymentWebhook = {
  provider: PaymentProvider;
  eventType: string;
  providerPaymentId: string;
  status: PaymentStatus | null;
  dedupKey: string;
  remoteIp: string | null;
  raw: unknown;
};

export interface PaymentProviderAdapter {
  readonly provider: PaymentProvider;
  createPayment(input: CreateExternalPaymentInput): Promise<ExternalPaymentSnapshot>;
  getPayment(providerPaymentId: string): Promise<ExternalPaymentSnapshot>;
  parseWebhook(input: {
    payload: unknown;
    remoteIp: string | null;
  }): ParsedPaymentWebhook;
}

