import type { ReaderView as ReaderViewModel } from "@/entities/story/types";
import { createSaveAction } from "@/server/saves/actions";
import { purchaseChapterAction } from "@/server/purchases/actions";
import { chooseStoryPathAction } from "@/server/stories/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getI18n } from "@/lib/i18n/server";
import { formatCredits } from "@/lib/utils";

type ReaderViewProps = {
  data: ReaderViewModel;
};

export async function ReaderView({ data }: ReaderViewProps) {
  const { locale, raw, t } = await getI18n();
  const accessReasonLabels = raw<Record<string, string>>(
    "common.enums.accessReason",
  );
  const chapterAccessModeLabels = raw<Record<string, string>>(
    "common.enums.chapterAccessMode",
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <Badge className="bg-slate-950 text-white hover:bg-slate-950">
          {t("stories.reader.chapterBadge", {
            chapterLabel: t("common.labels.chapter"),
            chapterNumber: data.story.currentChapterNumber,
          })}
        </Badge>
        <Badge variant="secondary">{data.story.genre}</Badge>
        <Badge variant="outline">{data.story.tone}</Badge>
      </div>

      {data.visibleChapters.map((chapter) => (
        <Card key={chapter.id} className="border-white/60 bg-white/90">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
                  {t("stories.reader.chapterBadge", {
                    chapterLabel: t("common.labels.chapter"),
                    chapterNumber: chapter.number,
                  })}
                </p>
                <CardTitle className="font-heading text-3xl">
                  {chapter.title}
                </CardTitle>
              </div>
              <Badge
                variant={chapter.accessMode === "FREE" ? "secondary" : "outline"}
              >
                {chapterAccessModeLabels[chapter.accessMode] ?? chapter.accessMode}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">{chapter.summary}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="whitespace-pre-line text-base leading-8 text-slate-700">
              {chapter.content}
            </div>
            {chapter.number === data.story.currentChapterNumber &&
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
                      {chapter.choices.map((choice) => (
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
            ) : null}
          </CardContent>
        </Card>
      ))}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
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
            <CardTitle className="font-heading text-2xl">
              {t("common.labels.nextChapterAccess")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-slate-300">
              {t("stories.reader.accessDescription")}
            </p>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              {data.nextAccess.allowed ? (
                <p className="text-sm text-emerald-300">
                  {t("stories.reader.accessAllowed", {
                    reason:
                      accessReasonLabels[data.nextAccess.reason] ??
                      data.nextAccess.reason.toLowerCase(),
                  })}
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-200">
                    {t("stories.reader.accessLocked", {
                      chapterLabel: t("common.labels.chapter"),
                      chapterNumber: data.nextAccess.nextChapterNumber,
                      price: formatCredits(data.nextAccess.priceCredits, locale),
                    })}
                  </p>
                  <form action={purchaseChapterAction}>
                    <input type="hidden" name="storyId" value={data.story.id} />
                    <input
                      type="hidden"
                      name="chapterNumber"
                      value={data.nextAccess.nextChapterNumber}
                    />
                    <Button
                      type="submit"
                      className="rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300"
                    >
                      {t("common.actions.unlockNextChapter")}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
