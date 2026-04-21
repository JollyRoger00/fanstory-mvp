import Link from "next/link";
import { StoryCard } from "@/features/stories/components/story-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n/server";
import { requireUser } from "@/server/auth/session";
import { listStories } from "@/server/stories/story.service";

export default async function StoriesPage() {
  const user = await requireUser();
  const stories = await listStories(user.id);
  const { t } = await getI18n();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("stories.list.eyebrow")}
        title={t("stories.list.title")}
        description={t("stories.list.description")}
        actions={
          <Button
            asChild
            className="rounded-full bg-slate-950 hover:bg-slate-800"
          >
            <Link href="/stories/new">{t("common.actions.newStory")}</Link>
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
          title={t("stories.list.emptyTitle")}
          description={t("stories.list.emptyDescription")}
          action={
            <Button
              asChild
              className="rounded-full bg-slate-950 hover:bg-slate-800"
            >
              <Link href="/stories/new">{t("common.actions.createStory")}</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
