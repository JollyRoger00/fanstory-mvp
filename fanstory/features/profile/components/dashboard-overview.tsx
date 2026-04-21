import Link from "next/link";
import { BookOpenText, Coins, LockKeyhole, Save } from "lucide-react";
import type { DashboardView } from "@/entities/user/types";
import { EmptyState } from "@/components/shared/empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getI18n } from "@/lib/i18n/server";
import { formatCredits, formatRelativeDate } from "@/lib/utils";

type DashboardOverviewProps = {
  data: DashboardView;
};

export async function DashboardOverview({ data }: DashboardOverviewProps) {
  const { locale, t } = await getI18n();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("dashboard.eyebrow")}
        title={t("dashboard.title", { name: data.userName })}
        description={t("dashboard.description")}
        actions={
          <Button
            asChild
            className="rounded-full bg-slate-950 hover:bg-slate-800"
          >
            <Link href="/stories/new">{t("common.actions.createStory")}</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t("dashboard.metrics.stories.label")}
          value={data.storyCount.toString()}
          hint={t("dashboard.metrics.stories.hint")}
          icon={<BookOpenText className="size-4 text-slate-500" />}
        />
        <MetricCard
          label={t("dashboard.metrics.saves.label")}
          value={data.saveCount.toString()}
          hint={t("dashboard.metrics.saves.hint")}
          icon={<Save className="size-4 text-slate-500" />}
        />
        <MetricCard
          label={t("dashboard.metrics.balance.label")}
          value={formatCredits(data.balance, locale)}
          hint={t("dashboard.metrics.balance.hint")}
          icon={<Coins className="size-4 text-slate-500" />}
        />
        <MetricCard
          label={t("dashboard.metrics.premiumAccess.label")}
          value={data.purchasedChapterCount.toString()}
          hint={
            data.activeSubscriptionName ?? t("common.states.noActiveSubscription")
          }
          icon={<LockKeyhole className="size-4 text-slate-500" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/60 bg-white/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-heading text-2xl">
                {t("dashboard.recentStories.title")}
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                {t("dashboard.recentStories.description")}
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/stories">{t("common.actions.viewAll")}</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentStories.length ? (
              data.recentStories.map((story) => (
                <div
                  key={story.id}
                  className="flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-950">{story.title}</p>
                    <p className="text-sm text-slate-500">
                      {t("dashboard.recentStories.item", {
                        chapterLabel: t("common.labels.chapter"),
                        chapterNumber: story.currentChapterNumber,
                        updatedLabel: t("common.labels.updated"),
                        updatedAt: formatRelativeDate(story.updatedAt, locale),
                      })}
                    </p>
                  </div>
                  <Button asChild variant="ghost" className="rounded-full">
                    <Link href={`/stories/${story.id}/read`}>
                      {t("common.actions.openReader")}
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <EmptyState
                title={t("dashboard.recentStories.emptyTitle")}
                description={t("dashboard.recentStories.emptyDescription")}
                action={
                  <Button
                    asChild
                    className="rounded-full bg-slate-950 hover:bg-slate-800"
                  >
                    <Link href="/stories/new">
                      {t("common.actions.createStory")}
                    </Link>
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/80">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              {t("dashboard.profileStatus.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                {t("common.labels.account")}
              </p>
              <p className="text-sm font-medium text-slate-950">
                {data.userEmail}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                {t("common.labels.subscription")}
              </p>
              {data.activeSubscriptionName ? (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  {data.activeSubscriptionName}
                </Badge>
              ) : (
                <Badge variant="secondary">{t("common.states.noActivePlan")}</Badge>
              )}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                {t("common.labels.recentSaves")}
              </p>
              {data.recentSaves.length ? (
                data.recentSaves.map((save) => (
                  <div
                    key={save.id}
                    className="rounded-3xl border border-slate-200/80 p-4"
                  >
                    <p className="font-medium text-slate-950">{save.label}</p>
                    <p className="text-sm text-slate-500">
                      {t("dashboard.profileStatus.recentSaveItem", {
                        storyTitle: save.storyTitle,
                        chapterLabel: t("common.labels.chapter"),
                        chapterNumber: save.chapterNumber,
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-slate-500">
                  {t("dashboard.profileStatus.recentSavesEmpty")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
