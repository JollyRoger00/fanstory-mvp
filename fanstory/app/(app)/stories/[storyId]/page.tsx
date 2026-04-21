import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { InfoHint } from "@/components/shared/info-hint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isResourceNotFoundError } from "@/lib/errors/app-error";
import { getI18n } from "@/lib/i18n/server";
import { requireUser } from "@/server/auth/session";
import { claimRewardedAdChapterAction } from "@/server/monetization/actions";
import { getStoryDetail } from "@/server/stories/story.service";

type StoryPageProps = {
  params: Promise<{
    storyId: string;
  }>;
};

export default async function StoryPage({ params }: StoryPageProps) {
  const user = await requireUser();
  const { storyId } = await params;
  const story = await getStoryDetail(user.id, storyId).catch((error) => {
    if (isResourceNotFoundError(error)) {
      notFound();
    }

    throw error;
  });
  const { raw, t } = await getI18n();
  const entitlementSourceLabels = raw<Record<string, string>>(
    "common.enums.entitlementSource",
  );
  const storyLanguageLabels = raw<Record<string, string>>(
    "common.enums.storyLanguage",
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("stories.detail.eyebrow")}
        title={story.title}
        description={story.synopsis ?? t("stories.detail.descriptionFallback")}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/stories">{t("common.actions.backToStories")}</Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-slate-950 hover:bg-slate-800"
            >
              <Link href={`/stories/${story.id}/read`}>
                {t("common.actions.openReader")}
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">
              {t("stories.detail.currentStateTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{story.universe}</Badge>
              <Badge variant="outline">{story.genre}</Badge>
              <Badge variant="outline">{story.tone}</Badge>
              <Badge variant="outline">
                {storyLanguageLabels[story.contentLanguage] ??
                  story.contentLanguage}
              </Badge>
              <Badge variant="outline">
                {t("common.labels.chapter")} {story.currentChapterNumber}
              </Badge>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              {story.currentStateSummary}
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200/80 p-4">
                <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  {t("stories.detail.activeGoals")}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {story.activeGoals.map((goal) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-200/80 p-4">
                <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  {t("stories.detail.tensions")}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {story.unresolvedTensions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-200/80 p-4">
                <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  {t("stories.detail.knownFacts")}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {story.knownFacts.map((fact) => (
                    <li key={fact}>{fact}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">
              {t("stories.detail.decisionHistory")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {story.decisions.length ? (
              story.decisions.map((decision) => (
                <div
                  key={decision.id}
                  className="rounded-3xl border border-slate-200/80 p-4"
                >
                  <p className="text-sm font-medium text-slate-950">
                    {t("stories.detail.decisionItem", {
                      chapterLabel: t("common.labels.chapter"),
                      chapterNumber: decision.chapterNumber,
                      selectedLabel: decision.selectedLabel,
                    })}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {decision.resolutionSummary}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-slate-500">
                {t("stories.detail.noDecisions")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="font-heading text-3xl">
              {t("stories.detail.nextChapterTitle")}
            </CardTitle>
            <InfoHint label={t("stories.detail.nextChapterTooltip")} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-3">
            {story.nextAccess.allowed ? (
              <>
                <p className="text-sm text-slate-600">
                  {t("stories.detail.nextChapterReady", {
                    source: story.nextAccess.nextSource
                      ? (entitlementSourceLabels[story.nextAccess.nextSource] ??
                        story.nextAccess.nextSource)
                      : t("stories.detail.accessAvailable"),
                  })}
                </p>
                <div className="grid gap-2 text-sm text-slate-500 md:grid-cols-2">
                  <p>
                    {t("stories.detail.balanceWelcome", {
                      count: story.nextAccess.balances.welcome,
                    })}
                  </p>
                  <p>
                    {t("stories.detail.balanceSubscription", {
                      count: story.nextAccess.balances.subscriptionDaily,
                    })}
                  </p>
                  <p>
                    {t("stories.detail.balancePurchased", {
                      count: story.nextAccess.balances.purchased,
                    })}
                  </p>
                  <p>
                    {t("stories.detail.balanceAd", {
                      count: story.nextAccess.balances.rewardedAd,
                    })}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  {t("stories.detail.nextChapterLocked", {
                    chapterLabel: t("common.labels.chapter"),
                    chapterNumber: story.nextAccess.nextChapterNumber,
                  })}
                </p>
                <div className="flex flex-wrap gap-3">
                  {story.nextAccess.canClaimRewardedAd ? (
                    <form action={claimRewardedAdChapterAction}>
                      <input type="hidden" name="storyId" value={story.id} />
                      <Button
                        type="submit"
                        className="rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300"
                      >
                        {t("common.actions.getChapterFromAd")}
                      </Button>
                    </form>
                  ) : null}
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/wallet">{t("common.actions.viewPacks")}</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/subscriptions">
                      {t("common.actions.viewPlans")}
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
          <Button
            asChild
            className="rounded-full bg-slate-950 hover:bg-slate-800"
          >
            <Link href={`/stories/${story.id}/read`}>
              {t("common.actions.openReader")}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <CardTitle className="font-heading text-3xl">
            {t("stories.detail.chapterTimeline")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {story.chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="rounded-3xl border border-slate-200/80 p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {t("common.labels.chapter")} {chapter.number}
                </Badge>
              </div>
              <h3 className="font-heading mt-3 text-2xl text-slate-950">
                {chapter.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {chapter.summary}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
