import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { AdminPagination } from "@/features/admin/components/admin-pagination";
import { getI18n } from "@/lib/i18n/server";
import { formatCalendarDate, formatRelativeDate } from "@/lib/utils";
import { listAdminPayments } from "@/server/admin/admin-payments.service";

type AdminPaymentsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function AdminPaymentsPage({
  searchParams,
}: AdminPaymentsPageProps) {
  const filters = await searchParams;
  const payments = await listAdminPayments(filters);
  const { locale } = await getI18n();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Платежи"
        description="История созданных платежей по пользователям и провайдерам."
      />

      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            Платежные операции
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment / Purchase</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Провайдер</TableHead>
                <TableHead>Provider payment id</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Создан</TableHead>
                <TableHead>Завершен</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.items.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-950">{payment.id}</p>
                      <p className="text-xs text-slate-500">
                        purchase: {payment.purchaseId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/users/${payment.userId}`}
                      className="font-medium text-slate-950 hover:text-amber-700"
                    >
                      {payment.userEmail ?? "Без email"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {payment.amount.toLocaleString("ru-RU")} {payment.currency}
                  </TableCell>
                  <TableCell>{payment.provider}</TableCell>
                  <TableCell className="max-w-[220px] truncate">
                    {payment.providerPaymentId ?? "—"}
                  </TableCell>
                  <TableCell>{payment.status}</TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <p>{formatCalendarDate(payment.createdAt, locale)}</p>
                      <p className="text-xs text-slate-500">
                        {formatRelativeDate(payment.createdAt, locale)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {payment.completedAt
                      ? formatCalendarDate(payment.completedAt, locale)
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <AdminPagination
            pathname="/admin/payments"
            page={payments.pagination.page}
            totalPages={payments.pagination.totalPages}
            searchParams={filters}
          />
        </CardContent>
      </Card>
    </div>
  );
}
