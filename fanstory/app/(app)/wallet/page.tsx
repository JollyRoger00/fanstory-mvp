import { WalletSummary } from "@/features/wallet/components/wallet-summary";
import { PageHeader } from "@/components/shared/page-header";
import { getI18n } from "@/lib/i18n/server";
import { requireUser } from "@/server/auth/session";
import { getWalletOverview } from "@/server/wallet/wallet.service";

export default async function WalletPage() {
  const user = await requireUser();
  const wallet = await getWalletOverview(user.id);
  const { locale, t } = await getI18n();
  const description =
    locale === "ru"
      ? "Покупайте главы и следите за доступом в одном месте."
      : "Buy chapters and manage access in one place.";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("wallet.eyebrow")}
        title={t("wallet.title")}
        description={description}
      />
      <WalletSummary wallet={wallet} />
    </div>
  );
}
