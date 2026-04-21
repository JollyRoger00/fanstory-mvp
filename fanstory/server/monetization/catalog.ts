import type { SubscriptionInterval } from "@/lib/db/generated/client";

export const WELCOME_CHAPTER_GRANT = 10;
export const SUBSCRIPTION_DAILY_CHAPTER_LIMIT = 25;

export const monetizationProductTypes = {
  chapterPack: "CHAPTER_PACK",
  subscription: "SUBSCRIPTION",
} as const;

export type MonetizationCatalogEntry = {
  code: string;
  type: "CHAPTER_PACK" | "SUBSCRIPTION";
  name: string;
  description: string;
  priceRubles: number;
  interval?: SubscriptionInterval;
  chapterAmount?: number;
  dailyChapterLimit?: number;
  isPriceFinal: boolean;
  metadata?: Record<string, unknown>;
};

export const monetizationProductCatalog: MonetizationCatalogEntry[] = [
  {
    code: "chapter-pack-10",
    type: monetizationProductTypes.chapterPack,
    name: "10 chapters",
    description: "One-time pack for 10 extra chapters.",
    priceRubles: 200,
    chapterAmount: 10,
    isPriceFinal: true,
    metadata: {
      badge: "Starter pack",
    },
  },
  {
    code: "chapter-pack-50",
    type: monetizationProductTypes.chapterPack,
    name: "50 chapters",
    description: "One-time pack for 50 extra chapters.",
    priceRubles: 1000,
    chapterAmount: 50,
    isPriceFinal: false,
    metadata: {
      priceStatus: "provisional",
      rationale:
        "Temporary linear placeholder derived from the confirmed 10-chapter pack price.",
    },
  },
  {
    code: "chapter-pack-100",
    type: monetizationProductTypes.chapterPack,
    name: "100 chapters",
    description: "One-time pack for 100 extra chapters.",
    priceRubles: 2000,
    chapterAmount: 100,
    isPriceFinal: false,
    metadata: {
      priceStatus: "provisional",
      rationale:
        "Temporary linear placeholder derived from the confirmed 10-chapter pack price.",
    },
  },
  {
    code: "subscription-monthly",
    type: monetizationProductTypes.subscription,
    name: "Monthly",
    description: "25 chapters every day while the subscription is active.",
    priceRubles: 1499,
    interval: "MONTHLY" satisfies SubscriptionInterval,
    dailyChapterLimit: SUBSCRIPTION_DAILY_CHAPTER_LIMIT,
    isPriceFinal: true,
    metadata: {
      badge: "Most flexible",
    },
  },
  {
    code: "subscription-yearly",
    type: monetizationProductTypes.subscription,
    name: "Yearly",
    description: "25 chapters every day with annual billing.",
    priceRubles: 5999,
    interval: "YEARLY" satisfies SubscriptionInterval,
    dailyChapterLimit: SUBSCRIPTION_DAILY_CHAPTER_LIMIT,
    isPriceFinal: true,
    metadata: {
      badge: "Best value",
    },
  },
];

export const monetizationCatalogByCode = Object.fromEntries(
  monetizationProductCatalog.map((product) => [product.code, product]),
);
