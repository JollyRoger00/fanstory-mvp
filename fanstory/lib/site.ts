import type { Locale } from "@/lib/i18n/config";

export const APP_NAME = "А дальше?";

const siteDescriptions: Record<Locale, string> = {
  ru: "Сервис генерации интерактивных AI-историй с пакетами глав и подпиской.",
  en: "An interactive AI story service with chapter packs and subscriptions.",
};

export function getSiteDescription(locale: Locale) {
  return siteDescriptions[locale];
}

export function withAppName(title: string) {
  return `${title} | ${APP_NAME}`;
}
