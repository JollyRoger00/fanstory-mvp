import { Coins, Plus } from "lucide-react";
import type { WalletOverview } from "@/entities/wallet/types";
import { grantDemoCreditsAction } from "@/server/wallet/actions";
import { InfoHint } from "@/components/shared/info-hint";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getI18n } from "@/lib/i18n/server";
import { formatCredits, formatRelativeDate } from "@/lib/utils";

type WalletSummaryProps = {
  wallet: WalletOverview;
  developmentBillingEnabled: boolean;
};

export async function WalletSummary({
  wallet,
  developmentBillingEnabled,
}: WalletSummaryProps) {
  const { locale, raw, t } = await getI18n();
  const transactionTypeLabels = raw<Record<string, string>>(
    "common.enums.walletTransactionType",
  );
  const transactionDescriptions = raw<Record<string, string>>(
    "wallet.transactionDescriptions",
  );

  return (
    <div className="space-y-6">
      <Card className="border-white/60 bg-slate-950 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold tracking-[0.24em] text-amber-300 uppercase">
                {t("common.labels.wallet")}
              </p>
              <InfoHint
                label={t("wallet.tooltips.balance")}
                className="text-amber-200"
              />
            </div>
            <CardTitle className="font-heading text-4xl">
              {formatCredits(wallet.balance, locale)}
            </CardTitle>
          </div>
          <Coins className="size-6 text-amber-300" />
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            {t("wallet.descriptionCard")}
          </p>
          {developmentBillingEnabled ? (
            <form action={grantDemoCreditsAction}>
              <Button
                type="submit"
                className="rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300"
              >
                <Plus className="size-4" />
                {t("common.actions.addDemoCredits")}
              </Button>
            </form>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            {t("wallet.ledgerTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("wallet.table.type")}</TableHead>
                <TableHead>{t("wallet.table.description")}</TableHead>
                <TableHead>{t("wallet.table.amount")}</TableHead>
                <TableHead>{t("wallet.table.balanceAfter")}</TableHead>
                <TableHead>{t("wallet.table.when")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallet.transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {transactionTypeLabels[transaction.type] ??
                      transaction.type}
                  </TableCell>
                  <TableCell>
                    {transactionDescriptions[transaction.type] ??
                      transaction.description}
                  </TableCell>
                  <TableCell>
                    {formatCredits(transaction.amount, locale)}
                  </TableCell>
                  <TableCell>
                    {formatCredits(transaction.balanceAfter, locale)}
                  </TableCell>
                  <TableCell>
                    {formatRelativeDate(transaction.createdAt, locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
