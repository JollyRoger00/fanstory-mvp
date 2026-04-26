import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/db/generated/client";
import { getServerEnv } from "@/lib/env/server";

// Bump this when the Prisma schema changes in a way that can break a hot-reloaded
// dev server holding onto an older global client instance.
const prismaClientSignature = "2026-04-26-admin-mvp-v1";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSignature?: string;
};

function createPrismaClient() {
  const env = getServerEnv();
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
  });
}

if (
  globalForPrisma.prisma &&
  globalForPrisma.prismaSignature !== prismaClientSignature
) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSignature = prismaClientSignature;
}
