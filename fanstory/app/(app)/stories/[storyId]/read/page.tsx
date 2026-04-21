import { notFound } from "next/navigation";
import { ReaderView } from "@/features/story-reader/components/reader-view";
import { PageHeader } from "@/components/shared/page-header";
import { isResourceNotFoundError } from "@/lib/errors/app-error";
import { getI18n } from "@/lib/i18n/server";
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
  const reader = await getReaderView(user.id, storyId, requestedChapter).catch(
    (error) => {
      if (isResourceNotFoundError(error)) {
        notFound();
      }

      throw error;
    },
  );
  const { t } = await getI18n();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("stories.reader.eyebrow")}
        title={reader.story.title}
        description={t("stories.reader.description")}
      />
      <ReaderView data={reader} />
    </div>
  );
}
