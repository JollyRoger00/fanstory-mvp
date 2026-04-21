import type { SubscriptionOverview } from "@/entities/subscription/types";
import { activateMockSubscriptionAction } from "@/server/subscriptions/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCredits } from "@/lib/utils";

type SubscriptionPlansProps = {
  data: SubscriptionOverview;
};

export function SubscriptionPlans({ data }: SubscriptionPlansProps) {
  return (
    <div className="space-y-6">
      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <CardTitle className="font-heading text-3xl">
            Current subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.activePlanName ? (
            <>
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                {data.activePlanName}
              </Badge>
              <p className="text-sm text-slate-500">
                Status: {data.status}{" "}
                {data.endsAt ? `• ends ${data.endsAt.toDateString()}` : ""}
              </p>
            </>
          ) : (
            <p className="text-sm leading-7 text-slate-500">
              No active plan. Subscription architecture is already wired into
              chapter access, purchases and reader gating.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {data.plans.map((plan) => (
          <Card
            key={plan.id}
            className="border-white/60 bg-slate-950 text-white"
          >
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="font-heading text-3xl">
                  {plan.name}
                </CardTitle>
                <Badge className="bg-amber-400 text-slate-950 hover:bg-amber-400">
                  {plan.interval}
                </Badge>
              </div>
              <p className="text-sm leading-7 text-slate-300">
                {plan.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-semibold text-amber-300">
                {formatCredits(plan.priceCredits)}
              </div>
              <ul className="space-y-2 text-sm text-slate-200">
                <li>
                  Unlimited premium access:{" "}
                  {plan.unlimitedPremiumAccess ? "yes" : "no"}
                </li>
                <li>Chapter discount: {plan.chapterDiscountPercent}%</li>
                <li>Foundation ready for future payment/webhook integration</li>
              </ul>
              <form action={activateMockSubscriptionAction}>
                <input type="hidden" name="planId" value={plan.id} />
                <Button
                  type="submit"
                  className="rounded-full bg-white text-slate-950 hover:bg-slate-100"
                >
                  Activate mock plan
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
