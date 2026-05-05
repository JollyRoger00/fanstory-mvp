"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/session";
import { startChapterPackCheckout } from "@/server/payments/payment.service";

export async function purchaseChapterPackAction(formData: FormData) {
  const user = await requireUser();
  const checkout = await startChapterPackCheckout(user, {
    productId: formData.get("productId"),
  });

  redirect(checkout.redirectUrl);
}
