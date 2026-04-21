import { SaveList } from "@/features/saves/components/save-list";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/server/auth/session";
import { listSaves } from "@/server/saves/save.service";

export default async function SavesPage() {
  const user = await requireUser();
  const saves = await listSaves(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Saves"
        title="Saved checkpoints"
        description="Saves are persisted snapshots that can later support richer resume and branching behavior."
      />
      <SaveList saves={saves} />
    </div>
  );
}
