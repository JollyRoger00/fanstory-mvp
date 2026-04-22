import "server-only";

import { FeatureDisabledError } from "@/lib/errors/app-error";
import { getServerEnv, paymentsEnabled } from "@/lib/env/server";
import { YookassaPaymentProvider } from "@/server/payments/providers/yookassa/provider";
import type { PaymentProviderAdapter } from "@/server/payments/types";

export function getPaymentProvider(): PaymentProviderAdapter {
  if (!paymentsEnabled()) {
    throw new FeatureDisabledError("Payments are not configured.");
  }

  const env = getServerEnv();

  if (env.PAYMENT_PROVIDER === "yookassa") {
    return new YookassaPaymentProvider();
  }

  throw new FeatureDisabledError("Unsupported payment provider.");
}

