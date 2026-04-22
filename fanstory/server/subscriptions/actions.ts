"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/session";
import { startSubscriptionCheckout } from "@/server/payments/payment.service";

export async function startSubscriptionCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const checkout = await startSubscriptionCheckout(user.id, {
    productId: formData.get("productId"),
  });

  redirect(checkout.redirectUrl);
}
