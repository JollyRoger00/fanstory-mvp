import type {
  ActiveSubscriptionView,
  ChapterBalanceView,
  EntitlementLedgerEntryView,
  MonetizationProductView,
} from "@/entities/monetization/types";

export type WalletOverview = {
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
