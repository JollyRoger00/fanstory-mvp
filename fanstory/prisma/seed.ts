import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../lib/db/generated/client";
import { monetizationProductCatalog } from "../server/monetization/catalog";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run prisma/seed.ts");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
  }),
});

async function main() {
  for (const product of monetizationProductCatalog) {
    await prisma.monetizationProduct.upsert({
      where: {
        code: product.code,
      },
      update: {
        type: product.type,
        status: "ACTIVE",
        name: product.name,
        description: product.description,
        priceRubles: product.priceRubles,
        currency: "RUB",
        interval: product.interval ?? null,
        chapterAmount: product.chapterAmount ?? null,
        dailyChapterLimit: product.dailyChapterLimit ?? null,
        isPriceFinal: product.isPriceFinal,
        metadata: (product.metadata ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
      },
      create: {
        code: product.code,
        type: product.type,
        status: "ACTIVE",
        name: product.name,
        description: product.description,
        priceRubles: product.priceRubles,
        currency: "RUB",
        interval: product.interval ?? null,
        chapterAmount: product.chapterAmount ?? null,
        dailyChapterLimit: product.dailyChapterLimit ?? null,
        isPriceFinal: product.isPriceFinal,
        metadata: (product.metadata ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
