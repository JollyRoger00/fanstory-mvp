import { SaveList } from "@/features/saves/components/save-list";
import { PageHeader } from "@/components/shared/page-header";
import { getI18n } from "@/lib/i18n/server";
import { requireUser } from "@/server/auth/session";
import { listSaves } from "@/server/saves/save.service";

export default async function SavesPage() {
  const user = await requireUser();
  const saves = await listSaves(user.id);
  const { t } = await getI18n();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("saves.eyebrow")}
        title={t("saves.title")}
        description={t("saves.description")}
      />
      <SaveList saves={saves} />
    </div>
  );
}
