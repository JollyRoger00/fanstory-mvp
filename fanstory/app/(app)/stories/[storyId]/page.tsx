import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/server/auth/session";
import { getStoryDetail } from "@/server/stories/story.service";

type StoryPageProps = {
  params: Promise<{
    storyId: string;
  }>;
};

export default async function StoryPage({ params }: StoryPageProps) {
  const user = await requireUser();
  const { storyId } = await params;
  const story = await getStoryDetail(user.id, storyId);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Story detail"
        title={story.title}
        description={
          story.synopsis ?? "Interactive story metadata and current run state."
        }
        actions={
          <>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/stories">Back to stories</Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-slate-950 hover:bg-slate-800"
            >
              <Link href={`/stories/${story.id}/read`}>Open reader</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-3xl">
              Current story state
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{story.universe}</Badge>
              <Badge variant="outline">{story.genre}</Badge>
              <Badge variant="outline">{story.tone}</Badge>
              <Badge variant="outline">
                Chapter {story.currentChapterNumber}
              </Badge>
            </div>
            <p className="text-sm leading-7 text-slate-600">
              {story.currentStateSummary}
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200/80 p-4">
                <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  Active goals
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {story.activeGoals.map((goal) => (
                    <li key={goal}>{goal}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-200/80 p-4">
                <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  Tensions
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {story.unresolvedTensions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-200/80 p-4">
                <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  Known facts
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
              Decision history
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
                    Chapter {decision.chapterNumber}: {decision.selectedLabel}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {decision.resolutionSummary}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-slate-500">
                No decisions resolved yet. The first chapter is ready in reader
                mode.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <CardTitle className="font-heading text-3xl">
            Chapter timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {story.chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="rounded-3xl border border-slate-200/80 p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Chapter {chapter.number}</Badge>
                <Badge variant="outline">{chapter.accessMode}</Badge>
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
