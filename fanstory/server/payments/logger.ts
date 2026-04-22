type PaymentLogLevel = "info" | "warn" | "error";

type PaymentLogPayload = {
  event: string;
  paymentId?: string;
  purchaseId?: string;
  userId?: string;
  provider?: string;
  providerPaymentId?: string | null;
  productCode?: string;
  status?: string;
  webhookEvent?: string;
  details?: unknown;
};

function createPrefix(level: PaymentLogLevel) {
  return `[payments:${level}]`;
}

export function logPayment(
  level: PaymentLogLevel,
  payload: PaymentLogPayload,
  error?: unknown,
) {
  const logger =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.info;

  if (error) {
    logger(createPrefix(level), payload, error);
    return;
  }

  logger(createPrefix(level), payload);
}

