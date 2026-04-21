import { ReaderView } from "@/features/story-reader/components/reader-view";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/server/auth/session";
import { getReaderView } from "@/server/story-reader/reader.service";

type ReaderPageProps = {
  params: Promise<{
    storyId: string;
  }>;
  searchParams: Promise<{
    chapter?: string;
  }>;
};

export default async function ReaderPage({
  params,
  searchParams,
}: ReaderPageProps) {
  const user = await requireUser();
  const { storyId } = await params;
  const query = await searchParams;
  const requestedChapter = query.chapter ? Number(query.chapter) : undefined;
  const reader = await getReaderView(user.id, storyId, requestedChapter);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Reader"
        title={reader.story.title}
        description="Play mode for the current story run, including entitlement checks and save checkpoints."
      />
      <ReaderView data={reader} />
    </div>
  );
}
