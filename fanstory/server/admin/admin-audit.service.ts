import "server-only";

import { z } from "zod";
import type { AdminAuditLogsListView } from "@/entities/admin/types";
import { prisma } from "@/lib/db/client";
import type { Prisma } from "@/lib/db/generated/client";
import { adminAuditQuerySchema } from "@/lib/validations/admin";
import { requireAdmin } from "@/server/admin/admin-auth";
import { buildPagination, toInputJsonValue } from "@/server/admin/shared";

type AuditExecutor = Pick<Prisma.TransactionClient, "adminAuditLog">;

const recordAdminAuditLogSchema = z.object({
  adminUserId: z.string().min(1),
  targetUserId: z.string().min(1).nullable().optional(),
  action: z.string().trim().min(1),
  entityType: z.string().trim().min(1).nullable().optional(),
  entityId: z.string().trim().min(1).nullable().optional(),
  before: z.unknown().optional(),
  after: z.unknown().optional(),
  reason: z.string().trim().min(1).nullable().optional(),
});

export async function recordAdminAuditLog(
  executor: AuditExecutor,
  payload: unknown,
) {
  const input = recordAdminAuditLogSchema.parse(payload);

  return executor.adminAuditLog.create({
    data: {
      adminUserId: input.adminUserId,
      targetUserId: input.targetUserId ?? null,
      action: input.action,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      beforeJson:
        typeof input.before === "undefined"
          ? undefined
          : toInputJsonValue(input.before),
      afterJson:
        typeof input.after === "undefined"
          ? undefined
          : toInputJsonValue(input.after),
      reason: input.reason ?? null,
    },
  });
}

export async function listAdminAuditLogs(
  payload: unknown,
): Promise<AdminAuditLogsListView> {
  await requireAdmin();
  const input = adminAuditQuerySchema.parse(payload);
  const skip = (input.page - 1) * input.pageSize;

  const [totalCount, logs] = await Promise.all([
    prisma.adminAuditLog.count(),
    prisma.adminAuditLog.findMany({
      include: {
        adminUser: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        targetUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: input.pageSize,
    }),
  ]);

  return {
    items: logs.map((log) => ({
      id: log.id,
      adminUserId: log.adminUser.id,
      adminEmail: log.adminUser.email,
      adminName: log.adminUser.name,
      targetUserId: log.targetUser?.id ?? null,
      targetUserEmail: log.targetUser?.email ?? null,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      reason: log.reason,
      createdAt: log.createdAt,
    })),
    pagination: buildPagination({
      page: input.page,
      pageSize: input.pageSize,
      totalCount,
    }),
  };
}
