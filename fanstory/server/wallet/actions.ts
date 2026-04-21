"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth/session";
import { grantDemoCredits } from "@/server/wallet/wallet.service";

export async function grantDemoCreditsAction() {
  const user = await requireUser();

  await grantDemoCredits(user.id);

  revalidatePath("/dashboard");
  revalidatePath("/wallet");
}
