export type SubscriptionPlanView = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  interval: string;
  priceCredits: number;
  chapterDiscountPercent: number;
  unlimitedPremiumAccess: boolean;
  metadata: Record<string, unknown> | null;
};

export type SubscriptionOverview = {
  activePlanName: string | null;
  status: string | null;
  endsAt: Date | null;
  plans: SubscriptionPlanView[];
};
