import { SubscriptionPlans } from "@/features/subscriptions/components/subscription-plans";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/server/auth/session";
import { getSubscriptionOverview } from "@/server/subscriptions/subscription.service";

export default async function SubscriptionsPage() {
  const user = await requireUser();
  const subscriptions = await getSubscriptionOverview(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Subscriptions"
        title="Subscription access layer"
        description="Subscription logic is modeled separately from UI so premium access can later be driven by a billing provider, webhooks and entitlement sync."
      />
      <SubscriptionPlans data={subscriptions} />
    </div>
  );
}
