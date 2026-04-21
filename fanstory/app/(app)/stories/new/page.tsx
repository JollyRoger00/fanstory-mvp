import { CreateStoryForm } from "@/features/stories/components/create-story-form";
import { PageHeader } from "@/components/shared/page-header";
import { getI18n } from "@/lib/i18n/server";

export default async function NewStoryPage() {
  const { t } = await getI18n();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("stories.create.eyebrow")}
        title={t("stories.create.title")}
        description={t("stories.create.description")}
      />
      <CreateStoryForm />
    </div>
  );
}
