import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { formatRelativeDate } from "@/lib/utils";
import { listAdminGenerationLogs } from "@/server/admin/admin-stories.service";

type AdminGenerationLogsPageProps = {
  searchParams: Promise<{
    status?: string;
    provider?: string;
    page?: string;
  }>;
};

function selectClassName() {
  return "border-input h-10 rounded-full border bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
}

export default async function AdminGenerationLogsPage({
  searchParams,
}: AdminGenerationLogsPageProps) {
  const filters = await searchParams;
  const logs = await listAdminGenerationLogs(filters);
  const { locale } = await getI18n();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Логи генерации"
        description="Фильтрация по статусу и provider для быстрой диагностики проблем генератора."
      />

      <Card className="border-white/60 bg-white/85">
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="font-heading text-2xl">
              Generation diagnostics
            </CardTitle>
            <p className="text-sm text-slate-500">
              Всего: {logs.pagination.totalCount.toLocaleString("ru-RU")}
            </p>
          </div>
          <form className="flex flex-wrap items-center gap-2">
            <select
              name="status"
              defaultValue={logs.status}
              className={selectClassName()}
            >
              <option value="">Все статусы</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED</option>
            </select>
            <select
              name="provider"
              defaultValue={logs.provider}
              className={selectClassName()}
            >
              <option value="">Все provider</option>
              <option value="MOCK">MOCK</option>
              <option value="OPENAI">OPENAI</option>
            </select>
            <Button type="submit" className="h-10 rounded-full">
              Фильтровать
            </Button>
          </form>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>История</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Событие</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Ошибка</TableHead>
                <TableHead>Когда</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Link
                      href={`/admin/users/${log.userId}`}
                      className="font-medium text-slate-950 hover:text-amber-700"
                    >
                      {log.userEmail ?? log.userId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/stories/${log.storyId}`}
                      className="font-medium text-slate-950 hover:text-amber-700"
                    >
                      {log.storyTitle}
                    </Link>
                  </TableCell>
                  <TableCell>{log.provider}</TableCell>
                  <TableCell>{log.model ?? "—"}</TableCell>
                  <TableCell>{log.eventType}</TableCell>
                  <TableCell>{log.status}</TableCell>
                  <TableCell className="max-w-[280px] whitespace-normal text-xs text-slate-500">
                    {log.errorMessage ?? "—"}
                  </TableCell>
                  <TableCell>{formatRelativeDate(log.createdAt, locale)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <AdminPagination
            pathname="/admin/generation-logs"
            page={logs.pagination.page}
            totalPages={logs.pagination.totalPages}
            searchParams={filters}
          />
        </CardContent>
      </Card>
    </div>
  );
}
