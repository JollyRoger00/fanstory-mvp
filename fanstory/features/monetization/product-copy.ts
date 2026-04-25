import type { MonetizationProductView } from "@/entities/monetization/types";
import type { Locale } from "@/lib/i18n/config";

type ProductPresentation = {
  title: string;
  badge: string;
  summary: string;
  detail: string;
};

type PaymentCtaCopy = {
  packAction: string;
  subscriptionAction: string;
  unavailable: string;
  plansAction: string;
};

export function getPaymentCtaCopy(locale: Locale): PaymentCtaCopy {
  if (locale === "ru") {
    return {
      packAction: "Купить",
      subscriptionAction: "Оформить",
      unavailable: "Оплата скоро",
      plansAction: "Выбрать план",
    };
  }

  return {
    packAction: "Buy now",
    subscriptionAction: "Subscribe",
    unavailable: "Payments soon",
    plansAction: "Choose plan",
  };
}

export function getProductPresentation(
  product: MonetizationProductView,
  locale: Locale,
): ProductPresentation {
  switch (product.code) {
    case "chapter-pack-10":
      return locale === "ru"
        ? {
            title: "10 глав",
            badge: "Старт",
            summary: "Быстрый пакет для продолжения одной истории.",
            detail: "Главы зачисляются сразу после оплаты.",
          }
        : {
            title: "10 chapters",
            badge: "Starter",
            summary: "A quick pack for continuing one story arc.",
            detail: "Chapters are credited instantly after payment.",
          };
    case "chapter-pack-50":
      return locale === "ru"
        ? {
            title: "50 глав",
            badge: "Выгодно",
            summary: "Для длинных сюжетов и нескольких веток.",
            detail: "Удобно для регулярного чтения и генерации.",
          }
        : {
            title: "50 chapters",
            badge: "Value",
            summary: "For longer runs and multiple story branches.",
            detail: "Good for regular reading and generation.",
          };
    case "chapter-pack-100":
      return locale === "ru"
        ? {
            title: "100 глав",
            badge: "Максимум",
            summary: "Большой пакет для активного использования сервиса.",
            detail: "Лучший вариант для частого чтения и новых историй.",
          }
        : {
            title: "100 chapters",
            badge: "Max",
            summary: "A large pack for heavy usage.",
            detail: "Best for frequent reading and new stories.",
          };
    case "subscription-monthly":
      return locale === "ru"
        ? {
            title: "Месяц",
            badge: "Гибко",
            summary: "25 глав в день с ежемесячной оплатой.",
            detail: "Подходит, чтобы попробовать подписку без длинного цикла.",
          }
        : {
            title: "Monthly",
            badge: "Flexible",
            summary: "25 chapters a day with monthly billing.",
            detail: "A good way to start without a long commitment.",
          };
    case "subscription-yearly":
      return locale === "ru"
        ? {
            title: "Год",
            badge: "Лучший тариф",
            summary: "25 глав в день по сниженной годовой стоимости.",
            detail: "Оптимальный выбор для постоянного использования.",
          }
        : {
            title: "Yearly",
            badge: "Best value",
            summary: "25 chapters a day with discounted yearly billing.",
            detail: "Best for long-term regular use.",
          };
    default:
      return {
        title: product.name,
        badge: locale === "ru" ? "План" : "Plan",
        summary: product.description ?? "",
        detail: "",
      };
  }
}
