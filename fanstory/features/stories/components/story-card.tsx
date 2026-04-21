import Link from "next/link";
import type { StoryListItem } from "@/entities/story/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getI18n } from "@/lib/i18n/server";
import { formatRelativeDate } from "@/lib/utils";

type StoryCardProps = {
  story: StoryListItem;
};

export async function StoryCard({ story }: StoryCardProps) {
  const { locale, raw, t } = await getI18n();
  const storyLanguageLabels = raw<Record<string, string>>(
    "common.enums.storyLanguage",
  );

  return (
    <Card className="border-white/60 bg-white/85 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{story.genre}</Badge>
          <Badge variant="outline">{story.tone}</Badge>
          <Badge variant="outline">
            {storyLanguageLabels[story.contentLanguage] ??
              story.contentLanguage}
          </Badge>
          <Badge variant="outline">
            {t("common.labels.chapter")} {story.currentChapterNumber}
          </Badge>
        </div>
        <div>
          <CardTitle className="font-heading text-3xl">{story.title}</CardTitle>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {story.synopsis ??
              t("stories.list.synopsisFallback", { universe: story.universe })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-slate-500">
        {t("stories.list.cardUpdated", {
          updatedLabel: t("common.labels.updated"),
          updatedAt: formatRelativeDate(story.updatedAt, locale),
          chapterCount: story.chapterCount,
        })}
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button
          asChild
          className="rounded-full bg-slate-950 hover:bg-slate-800"
        >
          <Link href={`/stories/${story.id}`}>
            {t("common.actions.openStory")}
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/stories/${story.id}/read`}>
            {t("common.actions.openReader")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
