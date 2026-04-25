import Link from "next/link";
import { ChevronLeft, ChevronRight, Compass, LibraryBig } from "lucide-react";
import type { StoryChapterView } from "@/entities/story/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getI18n } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

type ChapterNavigatorProps = {
  storyId: string;
  chapters: StoryChapterView[];
  activeChapterNumber: number;
  currentChapterNumber: number;
  mode: "detail" | "reader";
};

type ChapterMarker = number | "ellipsis";

function buildChapterMarkers(
  totalChapters: number,
  activeChapterNumber: number,
  currentChapterNumber: number,
): ChapterMarker[] {
  const numbers = new Set<number>([1, totalChapters, currentChapterNumber]);

  for (
    let number = activeChapterNumber - 2;
    number <= activeChapterNumber + 2;
    number += 1
  ) {
    if (number >= 1 && number <= totalChapters) {
      numbers.add(number);
    }
  }

  const ordered = [...numbers].sort((left, right) => left - right);
  const markers: ChapterMarker[] = [];

  ordered.forEach((number, index) => {
    const previous = ordered[index - 1];

    if (typeof previous === "number" && number - previous > 1) {
      markers.push("ellipsis");
    }

    markers.push(number);
  });

  return markers;
}

function getBasePath(storyId: string, mode: "detail" | "reader") {
  return mode === "reader" ? `/stories/${storyId}/read` : `/stories/${storyId}`;
}

export async function ChapterNavigator({
  storyId,
  chapters,
  activeChapterNumber,
  currentChapterNumber,
  mode,
}: ChapterNavigatorProps) {
  const { locale } = await getI18n();
  const totalChapters = chapters.length;
  const basePath = getBasePath(storyId, mode);
  const activeChapter = chapters.find(
    (chapter) => chapter.number === activeChapterNumber,
  );
  const previousChapterNumber =
    activeChapterNumber > 1 ? activeChapterNumber - 1 : null;
  const nextChapterNumber =
    activeChapterNumber < currentChapterNumber ? activeChapterNumber + 1 : null;
  const labels =
    locale === "ru"
      ? {
          title: "Навигация по главам",
          subtitle:
            "Откройте нужную главу сразу, без длинного скролла по всей истории.",
          jumpLabel: "Перейти",
          current: "Текущая глава",
          total: "Всего глав",
          previous: "Назад",
          next: "Вперёд",
          latest: "К последней",
          allChapters: "Все главы",
          selected: "Выбрана глава",
          chapter: "Глава",
        }
      : {
          title: "Chapter navigation",
          subtitle:
            "Open the chapter you need without scrolling through the full book.",
          jumpLabel: "Go",
          current: "Current chapter",
          total: "Total chapters",
          previous: "Previous",
          next: "Next",
          latest: "Latest",
          allChapters: "All chapters",
          selected: "Selected chapter",
          chapter: "Chapter",
        };
  const markers = buildChapterMarkers(
    totalChapters,
    activeChapterNumber,
    currentChapterNumber,
  );

  return (
    <Card className="border-white/60 bg-white/88 shadow-sm">
      <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <CardTitle className="font-heading flex items-center gap-2 text-2xl text-slate-950">
            <LibraryBig className="size-5 text-amber-700" />
            {labels.title}
          </CardTitle>
          <p className="max-w-2xl text-sm leading-7 text-slate-500">
            {labels.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-500">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em]">{labels.current}</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {activeChapterNumber}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em]">{labels.total}</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">
              {totalChapters}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {previousChapterNumber ? (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={`${basePath}?chapter=${previousChapterNumber}`}>
                <ChevronLeft className="size-4" />
                {labels.previous}
              </Link>
            </Button>
          ) : null}
          {nextChapterNumber ? (
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={`${basePath}?chapter=${nextChapterNumber}`}>
                {labels.next}
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          ) : null}
          {activeChapterNumber !== currentChapterNumber ? (
            <Button
              asChild
              size="sm"
              className="rounded-full bg-slate-950 hover:bg-slate-800"
            >
              <Link href={`${basePath}?chapter=${currentChapterNumber}`}>
                <Compass className="size-4" />
                {labels.latest}
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="mr-2 self-center text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
            {labels.allChapters}
          </span>
          {markers.map((marker, index) =>
            marker === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="inline-flex h-9 items-center px-2 text-slate-400"
              >
                ...
              </span>
            ) : (
              <Button
                key={marker}
                asChild
                size="sm"
                variant={marker === activeChapterNumber ? "default" : "outline"}
                className={cn(
                  "rounded-full",
                  marker === activeChapterNumber
                    ? "bg-slate-950 text-white hover:bg-slate-900"
                    : "",
                  marker === currentChapterNumber && marker !== activeChapterNumber
                    ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                    : "",
                )}
              >
                <Link href={`${basePath}?chapter=${marker}`}>{marker}</Link>
              </Button>
            ),
          )}
        </div>

        <form
          action={basePath}
          method="get"
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Input
            type="number"
            name="chapter"
            min={1}
            max={currentChapterNumber}
            defaultValue={activeChapterNumber}
            className="sm:max-w-[180px]"
          />
          <Button
            type="submit"
            className="rounded-full bg-slate-950 hover:bg-slate-800"
          >
            {labels.jumpLabel}
          </Button>
        </form>

        {activeChapter ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
              {labels.selected}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {labels.chapter} {activeChapter.number}: {activeChapter.title}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
