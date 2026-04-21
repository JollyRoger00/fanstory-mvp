"use server";

import { revalidatePath } from "next/cache";
import { activateSubscriptionSchema } from "@/lib/validations/subscription";
import { requireUser } from "@/server/auth/session";
import { activateMockSubscription } from "@/server/subscriptions/subscription.service";

export async function activateMockSubscriptionAction(formData: FormData) {
  const user = await requireUser();
  const input = activateSubscriptionSchema.parse({
    planId: formData.get("planId"),
  });

  await activateMockSubscription(user.id, input.planId);

  revalidatePath("/dashboard");
  revalidatePath("/subscriptions");
  revalidatePath("/stories");
}
