import Link from "next/link";
import type { SaveView } from "@/entities/save/types";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getI18n } from "@/lib/i18n/server";
import { formatRelativeDate } from "@/lib/utils";

type SaveListProps = {
  saves: SaveView[];
};

export async function SaveList({ saves }: SaveListProps) {
  const { locale, t } = await getI18n();

  if (!saves.length) {
    return (
      <EmptyState
        title={t("saves.emptyTitle")}
        description={t("saves.emptyDescription")}
        action={
          <Button
            asChild
            className="rounded-full bg-slate-950 hover:bg-slate-800"
          >
            <Link href="/stories">{t("common.actions.browseStories")}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      {saves.map((save) => (
        <Card key={save.id} className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              {save.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-950">
                {t("saves.cardMeta", {
                  storyTitle: save.storyTitle,
                  chapterLabel: t("common.labels.chapter"),
                  chapterNumber: save.chapterNumber,
                })}
              </p>
              <p className="text-sm leading-7 text-slate-500">
                {save.stateSummary}
              </p>
              <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">
                {t("common.labels.created")}{" "}
                {formatRelativeDate(save.createdAt, locale)}
              </p>
            </div>
            <Button
              asChild
              className="rounded-full bg-slate-950 hover:bg-slate-800"
            >
              <Link
                href={`/stories/${save.storyId}/read?chapter=${save.chapterNumber}`}
              >
                {t("saves.button")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
