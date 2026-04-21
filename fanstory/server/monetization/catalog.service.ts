import "server-only";

import type {
  MonetizationOverview,
  MonetizationProductView,
} from "@/entities/monetization/types";
import { prisma } from "@/lib/db/client";
import { monetizationProductTypes } from "@/server/monetization/catalog";

function mapProduct(product: {
  id: string;
  code: string;
  type: "CHAPTER_PACK" | "SUBSCRIPTION";
  name: string;
  description: string | null;
  priceRubles: number;
  currency: string;
  interval: string | null;
  chapterAmount: number | null;
  dailyChapterLimit: number | null;
  isPriceFinal: boolean;
  metadata: unknown;
}): MonetizationProductView {
  return {
    id: product.id,
    code: product.code,
    type: product.type,
    name: product.name,
    description: product.description,
    priceRubles: product.priceRubles,
    currency: product.currency,
    interval: product.interval,
    chapterAmount: product.chapterAmount,
    dailyChapterLimit: product.dailyChapterLimit,
    isPriceFinal: product.isPriceFinal,
    metadata: (product.metadata as Record<string, unknown> | null) ?? null,
  };
}

export async function listActiveMonetizationProducts() {
  const products = await prisma.monetizationProduct.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: [
      { type: "asc" },
      { chapterAmount: "asc" },
      { priceRubles: "asc" },
      { name: "asc" },
    ],
  });

  return products.map(mapProduct);
}

export async function getMonetizationCatalog(): Promise<
  Pick<MonetizationOverview, "chapterPacks" | "subscriptions">
> {
  const products = await listActiveMonetizationProducts();

  return {
    chapterPacks: products.filter(
      (product) => product.type === monetizationProductTypes.chapterPack,
    ),
    subscriptions: products.filter(
      (product) => product.type === monetizationProductTypes.subscription,
    ),
  };
}
