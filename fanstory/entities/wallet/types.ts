export type WalletTransactionView = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: Date;
};

export type WalletOverview = {
  balance: number;
  currency: string;
  transactions: WalletTransactionView[];
};
