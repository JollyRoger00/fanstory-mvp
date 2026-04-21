import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/db/generated/client";

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
  await prisma.subscriptionPlan.upsert({
    where: { code: "fanstory-plus-monthly" },
    update: {
      name: "FanStory Plus",
      description:
        "Unlimited premium chapter access while active, prioritized generation queue, and subscription-based gating foundation.",
      interval: "MONTHLY",
      priceCredits: 99,
      chapterDiscountPercent: 100,
      unlimitedPremiumAccess: true,
      status: "ACTIVE",
      metadata: {
        highlight: "Best for active readers",
      },
    },
    create: {
      code: "fanstory-plus-monthly",
      name: "FanStory Plus",
      description:
        "Unlimited premium chapter access while active, prioritized generation queue, and subscription-based gating foundation.",
      interval: "MONTHLY",
      priceCredits: 99,
      chapterDiscountPercent: 100,
      unlimitedPremiumAccess: true,
      status: "ACTIVE",
      metadata: {
        highlight: "Best for active readers",
      },
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { code: "fanstory-pro-yearly" },
    update: {
      name: "FanStory Pro",
      description:
        "Long-term plan for heavy users with yearly billing placeholder and room for future payment provider integration.",
      interval: "YEARLY",
      priceCredits: 999,
      chapterDiscountPercent: 100,
      unlimitedPremiumAccess: true,
      status: "ACTIVE",
      metadata: {
        highlight: "Best annual value",
      },
    },
    create: {
      code: "fanstory-pro-yearly",
      name: "FanStory Pro",
      description:
        "Long-term plan for heavy users with yearly billing placeholder and room for future payment provider integration.",
      interval: "YEARLY",
      priceCredits: 999,
      chapterDiscountPercent: 100,
      unlimitedPremiumAccess: true,
      status: "ACTIVE",
      metadata: {
        highlight: "Best annual value",
      },
    },
  });
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
