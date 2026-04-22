import type {
  ActiveSubscriptionView,
  MonetizationProductView,
} from "@/entities/monetization/types";

export type SubscriptionOverview = {
  activeSubscription: ActiveSubscriptionView | null;
  plans: MonetizationProductView[];
  dailyResetAt: Date;
  paymentsEnabled: boolean;
};
