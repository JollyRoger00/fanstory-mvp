import type { SubscriptionOverview } from "@/entities/subscription/types";
import { activateMockSubscriptionAction } from "@/server/subscriptions/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getI18n } from "@/lib/i18n/server";
import { formatCalendarDate, formatCredits } from "@/lib/utils";

type SubscriptionPlansProps = {
  data: SubscriptionOverview;
};

export async function SubscriptionPlans({ data }: SubscriptionPlansProps) {
  const { locale, raw, t } = await getI18n();
  const intervalLabels = raw<Record<string, string>>(
    "common.enums.subscriptionInterval",
  );
  const statusLabels = raw<Record<string, string>>(
    "common.enums.subscriptionStatus",
  );
  const planDescriptions = raw<Record<string, string>>(
    "subscriptions.planDescriptions",
  );

  return (
    <div className="space-y-6">
      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <CardTitle className="font-heading text-3xl">
            {t("subscriptions.currentTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.activePlanName ? (
            <>
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                {data.activePlanName}
              </Badge>
              <p className="text-sm text-slate-500">
                {t("subscriptions.statusLine", {
                  status: data.status
                    ? (statusLabels[data.status] ?? data.status)
                    : t("common.states.active"),
                  endsAt: data.endsAt
                    ? t("subscriptions.statusEndsAt", {
                        date: formatCalendarDate(data.endsAt, locale),
                      })
                    : "",
                })}
              </p>
            </>
          ) : (
            <p className="text-sm leading-7 text-slate-500">
              {t("subscriptions.noActive")}
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
                  {intervalLabels[plan.interval] ?? plan.interval}
                </Badge>
              </div>
              <p className="text-sm leading-7 text-slate-300">
                {planDescriptions[plan.code] ?? plan.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-semibold text-amber-300">
                {formatCredits(plan.priceCredits, locale)}
              </div>
              <ul className="space-y-2 text-sm text-slate-200">
                <li>
                  {t("subscriptions.unlimitedPremiumAccess", {
                    value: plan.unlimitedPremiumAccess
                      ? t("common.states.yes")
                      : t("common.states.no"),
                  })}
                </li>
                <li>
                  {t("subscriptions.chapterDiscount", {
                    value: plan.chapterDiscountPercent,
                  })}
                </li>
                <li>{t("subscriptions.integrationReady")}</li>
              </ul>
              <form action={activateMockSubscriptionAction}>
                <input type="hidden" name="planId" value={plan.id} />
                <Button
                  type="submit"
                  className="rounded-full bg-white text-slate-950 hover:bg-slate-100"
                >
                  {t("common.actions.activateMockPlan")}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
