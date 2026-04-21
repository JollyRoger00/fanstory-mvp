import { WalletSummary } from "@/features/wallet/components/wallet-summary";
import { PageHeader } from "@/components/shared/page-header";
import { devBillingToolsEnabled } from "@/lib/env/server";
import { getI18n } from "@/lib/i18n/server";
import { requireUser } from "@/server/auth/session";
import { getWalletOverview } from "@/server/wallet/wallet.service";

export default async function WalletPage() {
  const user = await requireUser();
  const wallet = await getWalletOverview(user.id);
  const { t } = await getI18n();
  const developmentBillingEnabled = devBillingToolsEnabled();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("wallet.eyebrow")}
        title={t("wallet.title")}
        description={t("wallet.description")}
      />
      <WalletSummary
        wallet={wallet}
        developmentBillingEnabled={developmentBillingEnabled}
      />
    </div>
  );
}
