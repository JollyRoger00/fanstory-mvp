import { LoadingState } from "@/components/shared/loading-state";
import { getI18n } from "@/lib/i18n/server";

export default async function Loading() {
  const { t } = await getI18n();

  return (
    <LoadingState
      title={t("common.loading.title")}
      description={t("common.loading.description")}
    />
  );
}
