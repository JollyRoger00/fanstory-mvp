import "server-only";

import { cookies, headers } from "next/headers";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n/translator";

type ResolveLocaleInput = {
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
  userPreferredLocale?: string | null;
};

function localeFromAcceptLanguage(value?: string | null): Locale | null {
  if (!value) {
    return null;
  }

  const candidates = value
    .split(",")
    .map((part) => part.trim().split(";")[0]?.split("-")[0])
    .filter(Boolean);

  const matched = candidates.find((candidate) => isLocale(candidate));

  return matched ?? null;
}

export function resolveLocale({
  cookieLocale,
  acceptLanguage,
  userPreferredLocale,
}: ResolveLocaleInput): Locale {
  if (isLocale(userPreferredLocale)) {
    return userPreferredLocale;
  }

  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }

  return localeFromAcceptLanguage(acceptLanguage) ?? defaultLocale;
}

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  return resolveLocale({
    cookieLocale: cookieStore.get(localeCookieName)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
}

export async function getI18n() {
  const locale = await getCurrentLocale();
  return createTranslator(locale);
}
