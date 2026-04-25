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
            summary: "Быстрый старт для продолжения истории.",
            detail: "",
          }
        : {
            title: "10 chapters",
            badge: "Starter",
            summary: "A quick start for continuing your story.",
            detail: "",
          };
    case "chapter-pack-50":
      return locale === "ru"
        ? {
            title: "50 глав",
            badge: "Выгодно",
            summary: "Для длинных сюжетов и нескольких веток.",
            detail: "",
          }
        : {
            title: "50 chapters",
            badge: "Value",
            summary: "For longer stories and multiple branches.",
            detail: "",
          };
    case "chapter-pack-100":
      return locale === "ru"
        ? {
            title: "100 глав",
            badge: "Максимум",
            summary: "Максимум глав для активного чтения.",
            detail: "",
          }
        : {
            title: "100 chapters",
            badge: "Max",
            summary: "Maximum access for active reading.",
            detail: "",
          };
    case "subscription-monthly":
      return locale === "ru"
        ? {
            title: "Месяц",
            badge: "Гибко",
            summary: "25 глав в день с оплатой раз в месяц.",
            detail: "Подходит для регулярного чтения.",
          }
        : {
            title: "Monthly",
            badge: "Flexible",
            summary: "25 chapters a day with monthly billing.",
            detail: "A flexible plan for regular reading.",
          };
    case "subscription-yearly":
      return locale === "ru"
        ? {
            title: "Год",
            badge: "Лучший тариф",
            summary: "25 глав в день по выгодной цене за год.",
            detail: "Лучший вариант для постоянного чтения.",
          }
        : {
            title: "Yearly",
            badge: "Best value",
            summary: "25 chapters a day with discounted yearly billing.",
            detail: "The best option for long-term reading.",
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
