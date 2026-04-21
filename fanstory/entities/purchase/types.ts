export type PurchaseView = {
  id: string;
  type: string;
  amount: number;
  chapterNumber: number | null;
  description: string | null;
  createdAt: Date;
};
