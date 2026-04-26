import "server-only";

import type { AdminPaymentsListView } from "@/entities/admin/types";
import { prisma } from "@/lib/db/client";
import { adminPaymentsQuerySchema } from "@/lib/validations/admin";
import { requireAdmin } from "@/server/admin/admin-auth";
import { buildPagination } from "@/server/admin/shared";

export async function listAdminPayments(
  payload: unknown,
): Promise<AdminPaymentsListView> {
  await requireAdmin();
  const input = adminPaymentsQuerySchema.parse(payload);
  const skip = (input.page - 1) * input.pageSize;

  const [totalCount, payments] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.findMany({
      include: {
        user: {
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
    items: payments.map((payment) => ({
      id: payment.id,
      purchaseId: payment.purchaseId,
      userId: payment.user.id,
      userEmail: payment.user.email,
      amount: payment.amountRubles,
      currency: payment.currency,
      provider: payment.provider,
      providerPaymentId: payment.providerPaymentId,
      status: payment.status,
      createdAt: payment.createdAt,
      completedAt: payment.paidAt ?? payment.appliedAt ?? null,
    })),
    pagination: buildPagination({
      page: input.page,
      pageSize: input.pageSize,
      totalCount,
    }),
  };
}
