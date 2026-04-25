import { SubscriptionPlans } from "@/features/subscriptions/components/subscription-plans";
import { PageHeader } from "@/components/shared/page-header";
import { getI18n } from "@/lib/i18n/server";
import { requireUser } from "@/server/auth/session";
import { getSubscriptionOverview } from "@/server/subscriptions/subscription.service";

export default async function SubscriptionsPage() {
  const user = await requireUser();
  const subscriptions = await getSubscriptionOverview(user.id);
  const { locale, t } = await getI18n();
  const description =
    locale === "ru"
      ? "Выберите тариф с ежедневным лимитом глав."
      : "Choose a plan with a daily chapter allowance.";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("subscriptions.eyebrow")}
        title={t("subscriptions.title")}
        description={description}
      />
      <SubscriptionPlans data={subscriptions} />
    </div>
  );
}
