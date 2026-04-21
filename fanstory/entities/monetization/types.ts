export type EntitlementSource =
  | "WELCOME"
  | "SUBSCRIPTION_DAILY"
  | "PURCHASE_PACK"
  | "REWARDED_AD";

export type MonetizationProductType = "CHAPTER_PACK" | "SUBSCRIPTION";

export type ChapterBalanceView = {
  welcome: number;
  subscriptionDaily: number;
  purchased: number;
  rewardedAd: number;
  total: number;
};

export type ActiveSubscriptionView = {
  id: string;
  code: string;
  name: string;
  status: string;
  dailyChapterLimit: number;
  remainingToday: number;
  endsAt: Date | null;
  resetsAt: Date;
};

export type MonetizationProductView = {
  id: string;
  code: string;
  type: MonetizationProductType;
  name: string;
  description: string | null;
  priceRubles: number;
  currency: string;
  interval: string | null;
  chapterAmount: number | null;
  dailyChapterLimit: number | null;
  isPriceFinal: boolean;
  metadata: Record<string, unknown> | null;
};

export type EntitlementLedgerEntryView = {
  id: string;
  eventType: "GRANT" | "CONSUME";
  source: EntitlementSource;
  quantity: number;
  createdAt: Date;
  productName: string | null;
};

export type NextChapterAccessView = {
  allowed: boolean;
  nextChapterNumber: number;
  nextSource: EntitlementSource | null;
  canClaimRewardedAd: boolean;
  rewardedAdReady: boolean;
  balances: ChapterBalanceView;
  activeSubscription: ActiveSubscriptionView | null;
  dailyResetAt: Date;
};

export type MonetizationOverview = {
  balances: ChapterBalanceView;
  activeSubscription: ActiveSubscriptionView | null;
  chapterPacks: MonetizationProductView[];
  subscriptions: MonetizationProductView[];
  ledger: EntitlementLedgerEntryView[];
  canClaimRewardedAd: boolean;
  rewardedAdReady: boolean;
  dailyResetAt: Date;
  mockPurchasesEnabled: boolean;
  rewardedAdEnabled: boolean;
};
