import { SubscriptionPlans } from "@/features/subscriptions/components/subscription-plans";
import { PageHeader } from "@/components/shared/page-header";
import { getI18n } from "@/lib/i18n/server";
import { requireUser } from "@/server/auth/session";
import { getSubscriptionOverview } from "@/server/subscriptions/subscription.service";

export default async function SubscriptionsPage() {
  const user = await requireUser();
  const subscriptions = await getSubscriptionOverview(user.id);
  const { t } = await getI18n();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("subscriptions.eyebrow")}
        title={t("subscriptions.title")}
        description={t("subscriptions.description")}
      />
      <SubscriptionPlans data={subscriptions} />
    </div>
  );
}
