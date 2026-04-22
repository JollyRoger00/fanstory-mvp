import type { PaymentView } from "@/entities/payment/types";
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
  recentPayments: PaymentView[];
  canClaimRewardedAd: boolean;
  rewardedAdReady: boolean;
  dailyResetAt: Date;
  paymentsEnabled: boolean;
  rewardedAdEnabled: boolean;
};
