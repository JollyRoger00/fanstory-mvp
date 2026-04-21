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
import { formatRelativeDate } from "@/lib/utils";

type StoryCardProps = {
  story: StoryListItem;
};

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Card className="border-white/60 bg-white/85 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{story.genre}</Badge>
          <Badge variant="outline">{story.tone}</Badge>
          <Badge variant="outline">Chapter {story.currentChapterNumber}</Badge>
        </div>
        <div>
          <CardTitle className="font-heading text-3xl">{story.title}</CardTitle>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {story.synopsis ?? `Story set in ${story.universe}.`}
          </p>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-slate-500">
        Updated {formatRelativeDate(story.updatedAt)} • {story.chapterCount}{" "}
        generated chapters
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button
          asChild
          className="rounded-full bg-slate-950 hover:bg-slate-800"
        >
          <Link href={`/stories/${story.id}`}>Open story</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/stories/${story.id}/read`}>Reader</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
