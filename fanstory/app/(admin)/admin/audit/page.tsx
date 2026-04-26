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
import { listAdminAuditLogs } from "@/server/admin/admin-audit.service";

type AdminAuditPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function AdminAuditPage({
  searchParams,
}: AdminAuditPageProps) {
  const filters = await searchParams;
  const audit = await listAdminAuditLogs(filters);
  const { locale } = await getI18n();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Журнал действий"
        description="Аудит всех admin-мутаторов с причиной, целью и временем операции."
      />

      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Admin audit log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Админ</TableHead>
                <TableHead>Действие</TableHead>
                <TableHead>Целевой пользователь</TableHead>
                <TableHead>Entity type</TableHead>
                <TableHead>Entity id</TableHead>
                <TableHead>Причина</TableHead>
                <TableHead>Когда</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-950">
                        {item.adminEmail ?? item.adminUserId}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.adminName ?? "Без имени"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{item.action}</TableCell>
                  <TableCell>
                    {item.targetUserId ? (
                      <Link
                        href={`/admin/users/${item.targetUserId}`}
                        className="font-medium text-slate-950 hover:text-amber-700"
                      >
                        {item.targetUserEmail ?? item.targetUserId}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{item.entityType ?? "—"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {item.entityId ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-[280px] whitespace-normal">
                    {item.reason ?? "—"}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <p>{formatCalendarDate(item.createdAt, locale)}</p>
                      <p className="text-xs text-slate-500">
                        {formatRelativeDate(item.createdAt, locale)}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <AdminPagination
            pathname="/admin/audit"
            page={audit.pagination.page}
            totalPages={audit.pagination.totalPages}
            searchParams={filters}
          />
        </CardContent>
      </Card>
    </div>
  );
}
