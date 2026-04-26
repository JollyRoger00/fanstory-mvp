import "server-only";

import { Prisma } from "@/lib/db/generated/client";
import type { AdminPagination } from "@/entities/admin/types";

export function clampNonNegative(value: number | null | undefined) {
  return Math.max(0, value ?? 0);
}

export function buildPagination(input: {
  page: number;
  pageSize: number;
  totalCount: number;
}): AdminPagination {
  const totalPages = Math.max(1, Math.ceil(input.totalCount / input.pageSize));

  return {
    page: Math.min(input.page, totalPages),
    pageSize: input.pageSize,
    totalCount: input.totalCount,
    totalPages,
  };
}

export function getPromptVersionModel(promptVersion: string | null) {
  if (!promptVersion) {
    return null;
  }

  const [, ...rest] = promptVersion.split(":");

  return rest.length ? rest.join(":") : promptVersion;
}

export function toInputJsonValue(value: unknown) {
  return value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}
