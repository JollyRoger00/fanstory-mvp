"use server";

import { signIn, signOut } from "@/auth";
import { sanitizeCallbackUrl } from "@/lib/auth/callback-url";

export async function signInWithGoogle(formData: FormData) {
  const callbackUrl = sanitizeCallbackUrl(
    formData.get("callbackUrl")?.toString(),
  );

  await signIn("google", {
    redirectTo: callbackUrl,
  });
}

export async function signOutAction() {
  await signOut({
    redirectTo: "/",
  });
}
