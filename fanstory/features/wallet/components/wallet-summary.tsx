import { Coins, Plus } from "lucide-react";
import type { WalletOverview } from "@/entities/wallet/types";
import { grantDemoCreditsAction } from "@/server/wallet/actions";
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
import { formatCredits, formatRelativeDate } from "@/lib/utils";

type WalletSummaryProps = {
  wallet: WalletOverview;
};

export function WalletSummary({ wallet }: WalletSummaryProps) {
  return (
    <div className="space-y-6">
      <Card className="border-white/60 bg-slate-950 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-amber-300 uppercase">
              Wallet
            </p>
            <CardTitle className="font-heading text-4xl">
              {formatCredits(wallet.balance)}
            </CardTitle>
          </div>
          <Coins className="size-6 text-amber-300" />
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            Wallet balance is updated through a dedicated service and
            transaction ledger, not with UI-local state. Real payment
            integration can replace the demo top-up action without changing page
            components.
          </p>
          <form action={grantDemoCreditsAction}>
            <Button
              type="submit"
              className="rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300"
            >
              <Plus className="size-4" />
              Add demo credits
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance after</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallet.transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{formatCredits(transaction.amount)}</TableCell>
                  <TableCell>
                    {formatCredits(transaction.balanceAfter)}
                  </TableCell>
                  <TableCell>
                    {formatRelativeDate(transaction.createdAt)}
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
