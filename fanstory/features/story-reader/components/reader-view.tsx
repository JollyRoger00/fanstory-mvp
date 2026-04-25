import Link from "next/link";
import type { ReaderView as ReaderViewModel } from "@/entities/story/types";
import { RewardedAdClaimButton } from "@/features/monetization/components/rewarded-ad-claim-button";
import { ChapterNavigator } from "@/features/story-reader/components/chapter-navigator";
import { createSaveAction } from "@/server/saves/actions";
import { chooseStoryPathAction } from "@/server/stories/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoHint } from "@/components/shared/info-hint";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getI18n } from "@/lib/i18n/server";
import { formatCalendarDate } from "@/lib/utils";
import { getRewardedAdUiConfig } from "@/server/monetization/rewarded-ads/provider";

type ReaderViewProps = {
  data: ReaderViewModel;
};

export async function ReaderView({ data }: ReaderViewProps) {
  const { locale, raw, t } = await getI18n();
  const rewardedAdConfig = getRewardedAdUiConfig();
  const entitlementSourceLabels = raw<Record<string, string>>(
    "common.enums.entitlementSource",
  );
  const storyLanguageLabels = raw<Record<string, string>>(
    "common.enums.storyLanguage",
  );
  const activeChapter = data.activeChapter;

  return (
    <div className="space-y-8">
      <ChapterNavigator
        storyId={data.story.id}
        chapters={data.story.chapters}
        activeChapterNumber={activeChapter.number}
        currentChapterNumber={data.story.currentChapterNumber}
        mode="reader"
      />

      <div className="flex flex-wrap gap-3">
        <Badge className="bg-slate-950 text-white hover:bg-slate-950">
          {t("stories.reader.chapterBadge", {
            chapterLabel: t("common.labels.chapter"),
            chapterNumber: activeChapter.number,
          })}
        </Badge>
        <Badge variant="secondary">{data.story.genre}</Badge>
        <Badge variant="outline">{data.story.tone}</Badge>
        <Badge variant="outline">
          {storyLanguageLabels[data.story.contentLanguage] ??
            data.story.contentLanguage}
        </Badge>
      </div>

      <Card className="border-white/60 bg-white/90">
        <CardHeader className="space-y-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
              {t("stories.reader.chapterBadge", {
                chapterLabel: t("common.labels.chapter"),
                chapterNumber: activeChapter.number,
              })}
            </p>
            <CardTitle className="font-heading text-3xl">
              {activeChapter.title}
            </CardTitle>
          </div>
          <p className="text-sm text-slate-500">{activeChapter.summary}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-base leading-8 whitespace-pre-line text-slate-700">
            {activeChapter.content}
          </div>
          {activeChapter.number === data.story.currentChapterNumber &&
          data.canContinue ? (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-heading text-2xl text-slate-950">
                    {t("stories.reader.chooseTitle")}
                  </h3>
                  <p className="text-sm leading-7 text-slate-500">
                    {t("stories.reader.chooseDescription")}
                  </p>
                </div>
                {data.nextAccess.allowed ? (
                  <div className="grid gap-3">
                    {activeChapter.choices.map((choice) => (
                      <form key={choice.id} action={chooseStoryPathAction}>
                        <input
                          type="hidden"
                          name="storyId"
                          value={data.story.id}
                        />
                        <input
                          type="hidden"
                          name="choiceId"
                          value={choice.id}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="h-auto w-full justify-start rounded-3xl px-5 py-4 text-left"
                        >
                          <span className="space-y-1">
                            <span className="block text-sm font-medium">
                              {choice.label}
                            </span>
                            {choice.outcomeHint ? (
                              <span className="block text-xs text-slate-500">
                                {choice.outcomeHint}
                              </span>
                            ) : null}
                          </span>
                        </Button>
                      </form>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm leading-7 text-slate-600">
                    {t("stories.reader.lockedChoices")}
                  </div>
                )}
              </div>
            </>
          ) : activeChapter.number !== data.story.currentChapterNumber ? (
            <>
              <Separator />
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  className="rounded-full bg-slate-950 hover:bg-slate-800"
                >
                  <Link
                    href={`/stories/${data.story.id}/read?chapter=${data.story.currentChapterNumber}`}
                  >
                    {locale === "ru" ? "Открыть последнюю главу" : "Open latest chapter"}
                  </Link>
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              {t("common.labels.saveCheckpoint")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={createSaveAction}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input type="hidden" name="storyId" value={data.story.id} />
              <Input
                name="label"
                placeholder={t("stories.reader.checkpointPlaceholder")}
                required
              />
              <Button
                type="submit"
                className="rounded-full bg-slate-950 hover:bg-slate-800"
              >
                {t("common.actions.saveProgress")}
              </Button>
            </form>
            <p className="mt-3 text-sm text-slate-500">
              {t("stories.reader.saveDescription", {
                count: data.saveCount,
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-slate-950 text-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="font-heading text-2xl">
                {t("common.labels.nextChapterAccess")}
              </CardTitle>
              <InfoHint
                label={t("stories.reader.tooltips.nextChapterAccess")}
                className="text-slate-300"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              {data.nextAccess.allowed ? (
                <div className="space-y-3">
                  <p className="text-sm text-emerald-300">
                    {t("stories.reader.accessAllowed", {
                      source: data.nextAccess.nextSource
                        ? (entitlementSourceLabels[
                            data.nextAccess.nextSource
                          ] ?? data.nextAccess.nextSource)
                        : t("stories.reader.accessAvailable"),
                    })}
                  </p>
                  <div className="grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
                    <p>
                      {t("stories.reader.balanceWelcome", {
                        count: data.nextAccess.balances.welcome,
                      })}
                    </p>
                    <p>
                      {t("stories.reader.balanceSubscription", {
                        count: data.nextAccess.balances.subscriptionDaily,
                      })}
                    </p>
                    <p>
                      {t("stories.reader.balancePurchased", {
                        count: data.nextAccess.balances.purchased,
                      })}
                    </p>
                    <p>
                      {t("stories.reader.balanceAd", {
                        count: data.nextAccess.balances.rewardedAd,
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-200">
                    {t("stories.reader.accessLocked", {
                      chapterLabel: t("common.labels.chapter"),
                      chapterNumber: data.nextAccess.nextChapterNumber,
                    })}
                  </p>
                  {data.nextAccess.rewardedAdDailyLimit > 0 ? (
                    <p className="text-xs text-slate-400">
                      {data.nextAccess.rewardedAdClaimsRemainingToday > 0
                        ? t("stories.reader.adQuota", {
                            remaining:
                              data.nextAccess.rewardedAdClaimsRemainingToday,
                            limit: data.nextAccess.rewardedAdDailyLimit,
                          })
                        : t("stories.reader.adLimitReached", {
                            limit: data.nextAccess.rewardedAdDailyLimit,
                          })}
                    </p>
                  ) : null}
                  {data.nextAccess.canClaimRewardedAd ? (
                    <RewardedAdClaimButton
                      provider={rewardedAdConfig.provider}
                      desktopBlockId={
                        rewardedAdConfig.provider === "yandex"
                          ? rewardedAdConfig.desktopBlockId
                          : null
                      }
                      mobileBlockId={
                        rewardedAdConfig.provider === "yandex"
                          ? rewardedAdConfig.mobileBlockId
                          : null
                      }
                      storyId={data.story.id}
                      label={t("common.actions.getChapterFromAd")}
                      pendingLabel={t("common.rewardedAds.loading")}
                      successMessage={t("common.rewardedAds.success")}
                      incompleteMessage={t("common.rewardedAds.incomplete")}
                      unavailableMessage={t("common.rewardedAds.unavailable")}
                      loaderErrorMessage={t("common.rewardedAds.loaderError")}
                      className="w-full rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300"
                    />
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href="/wallet">
                        {t("common.actions.viewPacks")}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link href="/subscriptions">
                        {t("common.actions.viewPlans")}
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {t("stories.reader.dailyReset", {
                date: formatCalendarDate(data.nextAccess.dailyResetAt, locale),
              })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
