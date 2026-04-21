import Link from "next/link";
import { StoryCard } from "@/features/stories/components/story-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/server/auth/session";
import { listStories } from "@/server/stories/story.service";

export default async function StoriesPage() {
  const user = await requireUser();
  const stories = await listStories(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Stories"
        title="Story library"
        description="All generated stories for the authenticated user. Each story owns its chapters, run state and entitlement checks."
        actions={
          <Button
            asChild
            className="rounded-full bg-slate-950 hover:bg-slate-800"
          >
            <Link href="/stories/new">New story</Link>
          </Button>
        }
      />
      {stories.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No stories generated"
          description="Use the new story flow to create a story aggregate, initial chapter and first choice set."
          action={
            <Button
              asChild
              className="rounded-full bg-slate-950 hover:bg-slate-800"
            >
              <Link href="/stories/new">Create the first story</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
