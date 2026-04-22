import type { SubscriptionOverview } from "@/entities/subscription/types";
import { startSubscriptionCheckoutAction } from "@/server/subscriptions/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoHint } from "@/components/shared/info-hint";
import { getI18n } from "@/lib/i18n/server";
import { formatCalendarDate, formatRubles } from "@/lib/utils";

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

  return (
    <div className="space-y-6">
      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="font-heading text-3xl">
              {t("subscriptions.currentTitle")}
            </CardTitle>
            <InfoHint label={t("subscriptions.tooltips.currentPlan")} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.activeSubscription ? (
            <>
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                {data.activeSubscription.name}
              </Badge>
              <p className="text-sm text-slate-600">
                {t("subscriptions.statusLine", {
                  status:
                    statusLabels[data.activeSubscription.status] ??
                    data.activeSubscription.status,
                  endsAt: data.activeSubscription.endsAt
                    ? t("subscriptions.statusEndsAt", {
                        date: formatCalendarDate(
                          data.activeSubscription.endsAt,
                          locale,
                        ),
                      })
                    : "",
                })}
              </p>
              <p className="text-sm text-slate-600">
                {t("subscriptions.dailyRemaining", {
                  count: data.activeSubscription.remainingToday,
                })}
              </p>
              <p className="text-xs text-slate-500">
                {t("subscriptions.dailyReset", {
                  date: formatCalendarDate(data.dailyResetAt, locale),
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
                  {intervalLabels[plan.interval ?? ""] ?? plan.interval}
                </Badge>
              </div>
              <p className="text-sm leading-7 text-slate-300">
                {plan.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-semibold text-amber-300">
                {formatRubles(plan.priceRubles, locale)}
              </div>
              <ul className="space-y-2 text-sm text-slate-200">
                <li>
                  {t("subscriptions.dailyLimit", {
                    count: plan.dailyChapterLimit ?? 0,
                  })}
                </li>
                <li>{t("subscriptions.dailyQuotaHint")}</li>
              </ul>
              {data.paymentsEnabled ? (
                <form action={startSubscriptionCheckoutAction}>
                  <input type="hidden" name="productId" value={plan.id} />
                  <Button
                    type="submit"
                    className="rounded-full bg-white text-slate-950 hover:bg-slate-100"
                  >
                    {t("common.actions.startSubscription")}
                  </Button>
                </form>
              ) : (
                <p className="text-xs text-slate-400">
                  {t("subscriptions.paymentsPending")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
