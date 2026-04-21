import type { ReaderView as ReaderViewModel } from "@/entities/story/types";
import { createSaveAction } from "@/server/saves/actions";
import { purchaseChapterAction } from "@/server/purchases/actions";
import { chooseStoryPathAction } from "@/server/stories/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatCredits } from "@/lib/utils";

type ReaderViewProps = {
  data: ReaderViewModel;
};

export function ReaderView({ data }: ReaderViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <Badge className="bg-slate-950 text-white hover:bg-slate-950">
          Chapter {data.story.currentChapterNumber}
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
                  Chapter {chapter.number}
                </p>
                <CardTitle className="font-heading text-3xl">
                  {chapter.title}
                </CardTitle>
              </div>
              <Badge
                variant={
                  chapter.accessMode === "FREE" ? "secondary" : "outline"
                }
              >
                {chapter.accessMode === "FREE" ? "Free" : "Premium"}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">{chapter.summary}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-base leading-8 whitespace-pre-line text-slate-700">
              {chapter.content}
            </div>
            {chapter.number === data.story.currentChapterNumber &&
            data.canContinue ? (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-heading text-2xl text-slate-950">
                      Choose the next move
                    </h3>
                    <p className="text-sm leading-7 text-slate-500">
                      Choices are stored server-side and the next chapter is
                      generated only after access control confirms entitlement.
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
                      Unlock the next chapter first. Choice forms stay disabled
                      until access is granted by either chapter purchase or an
                      active subscription.
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
              Create a save
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={createSaveAction}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input type="hidden" name="storyId" value={data.story.id} />
              <Input name="label" placeholder="Checkpoint label" required />
              <Button
                type="submit"
                className="rounded-full bg-slate-950 hover:bg-slate-800"
              >
                Save progress
              </Button>
            </form>
            <p className="mt-3 text-sm text-slate-500">
              Existing saves: {data.saveCount}. Saves store the run snapshot and
              chapter pointer for future resume/branching work.
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-slate-950 text-white">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Next chapter access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-slate-300">
              Access is evaluated in a dedicated service layer. UI only reflects
              the decision.
            </p>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              {data.nextAccess.allowed ? (
                <p className="text-sm text-emerald-300">
                  Next chapter is already available via{" "}
                  {data.nextAccess.reason.toLowerCase()} access.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-200">
                    Chapter {data.nextAccess.nextChapterNumber} is locked.
                    Unlock for {formatCredits(data.nextAccess.priceCredits)} or
                    cover it with a subscription.
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
                      Unlock next chapter
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
