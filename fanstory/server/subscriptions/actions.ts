"use server";

import { revalidatePath } from "next/cache";
import { activateSubscriptionSchema } from "@/lib/validations/subscription";
import { requireUser } from "@/server/auth/session";
import { activateMockSubscription } from "@/server/subscriptions/subscription.service";

export async function activateMockSubscriptionAction(formData: FormData) {
  const user = await requireUser();
  const input = activateSubscriptionSchema.parse({
    productId: formData.get("productId"),
  });

  await activateMockSubscription(user.id, input.productId);

  revalidatePath("/dashboard");
  revalidatePath("/wallet");
  revalidatePath("/subscriptions");
  revalidatePath("/stories");
}
