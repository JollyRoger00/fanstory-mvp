import "server-only";

import { randomUUID } from "node:crypto";
import type { PaymentView } from "@/entities/payment/types";
import type {
  MonetizationProductType,
  PaymentStatus,
  PurchaseType,
} from "@/lib/db/generated/client";
import { prisma } from "@/lib/db/client";
import { FeatureDisabledError } from "@/lib/errors/app-error";
import { getServerEnv, paymentsEnabled } from "@/lib/env/server";
import { startPaymentCheckoutSchema } from "@/lib/validations/payment";
import { getPaymentProvider } from "@/server/payments/provider";
import { reconcilePaymentSnapshot } from "@/server/payments/payment-sync.service";

type CheckoutProduct = {
  id: string;
  code: string;
  type: MonetizationProductType;
  name: string;
  priceRubles: number;
  currency: string;
};

type PaymentRecord = {
  id: string;
  productId: string;
  providerPaymentId: string | null;
  status: PaymentStatus;
  amountRubles: number;
  currency: string;
  confirmationUrl: string | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  appliedAt: Date | null;
  product: {
    code: string;
    name: string;
    type: MonetizationProductType;
  };
};

type StartCheckoutOptions = {
  productType: MonetizationProductType;
  returnPath: string;
};

type CheckoutUser = {
  id: string;
  email?: string | null;
};

export type StartCheckoutResult = {
  payment: PaymentView;
  redirectUrl: string;
};

function getPurchaseType(productType: MonetizationProductType): PurchaseType {
  return productType === "SUBSCRIPTION" ? "SUBSCRIPTION" : "CHAPTER_PACK";
}

function getExistingMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getPaymentDescription(product: CheckoutProduct) {
  return product.type === "SUBSCRIPTION"
    ? `Subscription ${product.name}.`
    : `Purchased ${product.name}.`;
}

function getReturnUrl(returnPath: string) {
  return new URL(returnPath, getServerEnv().NEXT_PUBLIC_APP_URL).toString();
}

function canResumePayment(
  status: PaymentStatus,
  confirmationUrl: string | null,
) {
  return (
    Boolean(confirmationUrl) &&
    (status === "PENDING" || status === "WAITING_FOR_CAPTURE")
  );
}

function canRetryPayment(status: PaymentStatus) {
  return status === "CANCELED" || status === "FAILED";
}

function mapPayment(payment: PaymentRecord): PaymentView {
  return {
    id: payment.id,
    productId: payment.productId,
    productCode: payment.product.code,
    productName: payment.product.name,
    productType: payment.product.type,
    status: payment.status,
    amountRubles: payment.amountRubles,
    currency: payment.currency,
    confirmationUrl: payment.confirmationUrl,
    failureReason: payment.failureReason,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    appliedAt: payment.appliedAt,
    canResume: canResumePayment(payment.status, payment.confirmationUrl),
    canRetry: canRetryPayment(payment.status),
  };
}

async function findReusableCheckout(userId: string, productId: string) {
  return prisma.payment.findFirst({
    where: {
      userId,
      productId,
      applyStatus: "PENDING",
      status: {
        in: ["PENDING", "WAITING_FOR_CAPTURE"],
      },
      purchase: {
        is: {
          status: "PENDING",
        },
      },
    },
    select: {
      id: true,
      productId: true,
      providerPaymentId: true,
      status: true,
      amountRubles: true,
      currency: true,
      confirmationUrl: true,
      failureReason: true,
      createdAt: true,
      updatedAt: true,
      appliedAt: true,
      product: {
        select: {
          code: true,
          name: true,
          type: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function startCheckout(
  user: CheckoutUser,
  payload: unknown,
  options: StartCheckoutOptions,
): Promise<StartCheckoutResult> {
  if (!paymentsEnabled()) {
    throw new FeatureDisabledError("Payments are not configured.");
  }

  const input = startPaymentCheckoutSchema.parse(payload);
  const provider = getPaymentProvider();
  const userId = user.id;
  const product = await prisma.monetizationProduct.findFirstOrThrow({
    where: {
      id: input.productId,
      type: options.productType,
      status: "ACTIVE",
    },
    select: {
      id: true,
      code: true,
      type: true,
      name: true,
      priceRubles: true,
      currency: true,
    },
  });

  const reusablePayment = await findReusableCheckout(userId, product.id);

  if (reusablePayment) {
    let resolvedPayment: PaymentRecord = reusablePayment;

    if (!resolvedPayment.confirmationUrl && resolvedPayment.providerPaymentId) {
      resolvedPayment = await reconcilePaymentSnapshot({
        paymentId: resolvedPayment.id,
        snapshot: await provider.getPayment(resolvedPayment.providerPaymentId),
      });
    }

    if (canResumePayment(resolvedPayment.status, resolvedPayment.confirmationUrl)) {
      return {
        payment: mapPayment(resolvedPayment),
        redirectUrl: resolvedPayment.confirmationUrl!,
      };
    }

    if (resolvedPayment.status === "SUCCEEDED") {
      return {
        payment: mapPayment(resolvedPayment),
        redirectUrl: getReturnUrl(options.returnPath),
      };
    }
  }

  const paymentId = randomUUID();
  const returnUrl = getReturnUrl(options.returnPath);
  const description = getPaymentDescription(product);
  const createdCheckout = await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        userId,
        productId: product.id,
        type: getPurchaseType(product.type),
        status: "PENDING",
        amount: product.priceRubles,
        description,
        metadata: {
          productCode: product.code,
          paymentFlow: "external",
        },
      },
      select: {
        id: true,
        metadata: true,
      },
    });

    await tx.payment.create({
      data: {
        id: paymentId,
        userId,
        purchaseId: purchase.id,
        productId: product.id,
        provider: provider.provider,
        status: "PENDING",
        amountRubles: product.priceRubles,
        currency: product.currency,
        idempotenceKey: paymentId,
        returnUrl,
      },
    });

    return purchase;
  });

  try {
    const snapshot = await provider.createPayment({
      paymentId,
      purchaseId: createdCheckout.id,
      userId,
      userEmail: user.email ?? null,
      productCode: product.code,
      productName: product.name,
      description,
      amountRubles: product.priceRubles,
      currency: product.currency,
      returnUrl,
    });

    const payment = await reconcilePaymentSnapshot({
      paymentId,
      snapshot,
    });

    return {
      payment: mapPayment(payment),
      redirectUrl: payment.confirmationUrl ?? returnUrl,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown payment checkout error.";

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: "FAILED",
          failureReason: errorMessage,
          lastSyncedAt: new Date(),
        },
      });

      await tx.purchase.update({
        where: {
          id: createdCheckout.id,
        },
        data: {
          status: "FAILED",
          metadata: {
            ...getExistingMetadata(createdCheckout.metadata),
            paymentError: errorMessage,
          },
        },
      });
    });

    throw error;
  }
}

export async function startChapterPackCheckout(
  user: CheckoutUser,
  payload: unknown,
) {
  return startCheckout(user, payload, {
    productType: "CHAPTER_PACK",
    returnPath: "/wallet",
  });
}

export async function startSubscriptionCheckout(
  user: CheckoutUser,
  payload: unknown,
) {
  return startCheckout(user, payload, {
    productType: "SUBSCRIPTION",
    returnPath: "/subscriptions",
  });
}

export async function listRecentPayments(
  userId: string,
  take = 8,
): Promise<PaymentView[]> {
  const payments = await prisma.payment.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      productId: true,
      providerPaymentId: true,
      status: true,
      amountRubles: true,
      currency: true,
      confirmationUrl: true,
      failureReason: true,
      createdAt: true,
      updatedAt: true,
      appliedAt: true,
      product: {
        select: {
          code: true,
          name: true,
          type: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
  });

  return payments.map(mapPayment);
}
