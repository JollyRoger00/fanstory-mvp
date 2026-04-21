import Link from "next/link";
import type { SaveView } from "@/entities/save/types";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";

type SaveListProps = {
  saves: SaveView[];
};

export function SaveList({ saves }: SaveListProps) {
  if (!saves.length) {
    return (
      <EmptyState
        title="No saves yet"
        description="Open the reader and create a checkpoint. Saved snapshots are ready for richer restore and branching mechanics later."
        action={
          <Button
            asChild
            className="rounded-full bg-slate-950 hover:bg-slate-800"
          >
            <Link href="/stories">Browse stories</Link>
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
                {save.storyTitle} • chapter {save.chapterNumber}
              </p>
              <p className="text-sm leading-7 text-slate-500">
                {save.stateSummary}
              </p>
              <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">
                created {formatRelativeDate(save.createdAt)}
              </p>
            </div>
            <Button
              asChild
              className="rounded-full bg-slate-950 hover:bg-slate-800"
            >
              <Link
                href={`/stories/${save.storyId}/read?chapter=${save.chapterNumber}`}
              >
                Open save
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
