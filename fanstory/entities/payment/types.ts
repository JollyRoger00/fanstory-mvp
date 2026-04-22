import type { MonetizationProductType } from "@/entities/monetization/types";

export type PaymentStatusValue =
  | "PENDING"
  | "WAITING_FOR_CAPTURE"
  | "SUCCEEDED"
  | "CANCELED"
  | "FAILED";

export type PaymentView = {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  productType: MonetizationProductType;
  status: PaymentStatusValue;
  amountRubles: number;
  currency: string;
  confirmationUrl: string | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  appliedAt: Date | null;
  canResume: boolean;
  canRetry: boolean;
};
