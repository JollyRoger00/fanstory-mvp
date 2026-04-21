import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ensureUserMonetizationBootstrap } from "@/server/monetization/entitlement.service";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  await ensureUserMonetizationBootstrap(user.id);

  return user;
}
