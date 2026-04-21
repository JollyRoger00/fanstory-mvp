"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
} from "@/lib/i18n/config";

export async function setLocaleAction(formData: FormData) {
  const locale = formData.get("locale")?.toString();
  const pathname = formData.get("pathname")?.toString() || "/";

  if (!isLocale(locale)) {
    redirect(pathname);
  }

  const cookieStore = await cookies();

  cookieStore.set(localeCookieName, locale ?? defaultLocale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect(pathname);
}
