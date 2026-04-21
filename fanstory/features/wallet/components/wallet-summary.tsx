import Link from "next/link";
import { Coins, Gift, PlayCircle, RefreshCcw } from "lucide-react";
import type { WalletOverview } from "@/entities/wallet/types";
import { claimRewardedAdChapterAction } from "@/server/monetization/actions";
import { purchaseChapterPackAction } from "@/server/purchases/actions";
import { InfoHint } from "@/components/shared/info-hint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getI18n } from "@/lib/i18n/server";
import {
  formatCalendarDate,
  formatRelativeDate,
  formatRubles,
  formatSignedNumber,
} from "@/lib/utils";

type WalletSummaryProps = {
  wallet: WalletOverview;
};

export async function WalletSummary({ wallet }: WalletSummaryProps) {
  const { locale, raw, t } = await getI18n();
  const entitlementSourceLabels = raw<Record<string, string>>(
    "common.enums.entitlementSource",
  );
  const entitlementEventLabels = raw<Record<string, string>>(
    "common.enums.entitlementEventType",
  );

  return (
    <div className="space-y-6">
      <Card className="border-white/60 bg-slate-950 text-white">
        <CardHeader className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold tracking-[0.24em] text-amber-300 uppercase">
                {t("wallet.summaryLabel")}
              </p>
              <InfoHint
                label={t("wallet.tooltips.summary")}
                className="text-amber-200"
              />
            </div>
            <div>
              <CardTitle className="font-heading text-5xl">
                {wallet.balances.total}
              </CardTitle>
              <p className="mt-2 text-sm text-slate-300">
                {t("wallet.totalChapters")}
              </p>
            </div>
          </div>
          <Coins className="size-6 text-amber-300" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">
              {t("wallet.breakdown.welcome")}
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {wallet.balances.welcome}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">
              {t("wallet.breakdown.subscription")}
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {wallet.balances.subscriptionDaily}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {t("wallet.resetsAt", {
                date: formatCalendarDate(wallet.dailyResetAt, locale),
              })}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">
              {t("wallet.breakdown.purchased")}
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {wallet.balances.purchased}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">
              {t("wallet.breakdown.rewardedAd")}
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {wallet.balances.rewardedAd}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="font-heading text-2xl">
                {t("wallet.packTitle")}
              </CardTitle>
              <InfoHint label={t("wallet.tooltips.packs")} />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {wallet.chapterPacks.map((pack) => (
              <div
                key={pack.id}
                className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-950">{pack.name}</p>
                  {pack.isPriceFinal ? null : (
                    <Badge variant="outline">
                      {t("wallet.provisionalPrice")}
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {pack.description}
                </p>
                <p className="mt-4 text-3xl font-semibold text-slate-950">
                  {formatRubles(pack.priceRubles, locale)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {t("wallet.packValue", {
                    count: pack.chapterAmount ?? 0,
                  })}
                </p>
                {wallet.mockPurchasesEnabled ? (
                  <form action={purchaseChapterPackAction} className="mt-4">
                    <input type="hidden" name="productId" value={pack.id} />
                    <Button
                      type="submit"
                      className="w-full rounded-full bg-slate-950 hover:bg-slate-800"
                    >
                      {t("common.actions.buyPack")}
                    </Button>
                  </form>
                ) : (
                  <p className="mt-4 text-xs text-slate-500">
                    {t("wallet.paymentsPending")}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/60 bg-white/85">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="font-heading text-2xl">
                  {t("wallet.subscriptionTitle")}
                </CardTitle>
                <InfoHint label={t("wallet.tooltips.subscription")} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {wallet.activeSubscription ? (
                <>
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                    {wallet.activeSubscription.name}
                  </Badge>
                  <p className="text-sm text-slate-600">
                    {t("wallet.subscriptionSummary", {
                      remaining: wallet.activeSubscription.remainingToday,
                    })}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-600">
                  {t("wallet.noSubscription")}
                </p>
              )}
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/subscriptions">
                  {t("common.actions.viewPlans")}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/60 bg-white/85">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="font-heading text-2xl">
                  {t("wallet.adTitle")}
                </CardTitle>
                <InfoHint label={t("wallet.tooltips.rewardedAd")} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Gift className="size-4" />
                <span>{t("wallet.adDescription")}</span>
              </div>
              {wallet.rewardedAdReady ? (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  {t("wallet.adReady")}
                </Badge>
              ) : null}
              {wallet.rewardedAdEnabled && wallet.canClaimRewardedAd ? (
                <form action={claimRewardedAdChapterAction}>
                  <Button
                    type="submit"
                    className="w-full rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300"
                  >
                    <PlayCircle className="size-4" />
                    {t("common.actions.getChapterFromAd")}
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-slate-500">
                  {wallet.rewardedAdReady
                    ? t("wallet.adUseReady")
                    : t("wallet.adHint")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-white/60 bg-white/85">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="font-heading text-2xl">
            {t("wallet.activityTitle")}
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCcw className="size-3.5" />
            <span>{t("wallet.activityHint")}</span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("wallet.table.source")}</TableHead>
                <TableHead>{t("wallet.table.event")}</TableHead>
                <TableHead>{t("wallet.table.product")}</TableHead>
                <TableHead>{t("wallet.table.amount")}</TableHead>
                <TableHead>{t("wallet.table.when")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallet.ledger.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {entitlementSourceLabels[entry.source] ?? entry.source}
                  </TableCell>
                  <TableCell>
                    {entitlementEventLabels[entry.eventType] ?? entry.eventType}
                  </TableCell>
                  <TableCell>
                    {entry.productName ?? t("wallet.activityFallback")}
                  </TableCell>
                  <TableCell>
                    {formatSignedNumber(entry.quantity, locale)}
                  </TableCell>
                  <TableCell>
                    {formatRelativeDate(entry.createdAt, locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
