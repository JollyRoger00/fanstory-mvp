import { WalletSummary } from "@/features/wallet/components/wallet-summary";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/server/auth/session";
import { getWalletOverview } from "@/server/wallet/wallet.service";

export default async function WalletPage() {
  const user = await requireUser();
  const wallet = await getWalletOverview(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Wallet"
        title="Balance and ledger"
        description="Credits, ledger history and placeholder top-up flow live in a dedicated wallet service."
      />
      <WalletSummary wallet={wallet} />
    </div>
  );
}
