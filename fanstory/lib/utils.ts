import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNow } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import { defaultLocale, type Locale } from "@/lib/i18n/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getIntlLocale(locale: Locale) {
  return locale === "ru" ? "ru-RU" : "en-US";
}

function getDateFnsLocale(locale: Locale) {
  return locale === "ru" ? ru : enUS;
}

export function formatCredits(value: number, locale: Locale = defaultLocale) {
  return `${value.toLocaleString(getIntlLocale(locale))} cr`;
}

export function formatRelativeDate(
  value: Date | string,
  locale: Locale = defaultLocale,
) {
  return formatDistanceToNow(new Date(value), {
    addSuffix: true,
    locale: getDateFnsLocale(locale),
  });
}

export function formatCalendarDate(
  value: Date | string,
  locale: Locale = defaultLocale,
) {
  return format(new Date(value), "PPP", {
    locale: getDateFnsLocale(locale),
  });
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}
