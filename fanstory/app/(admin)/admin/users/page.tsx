import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { listAdminUsers } from "@/server/admin/admin-users.service";

type AdminUsersPageProps = {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const filters = await searchParams;
  const { locale } = await getI18n();
  const users = await listAdminUsers(filters);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Пользователи"
        description="Поиск по email, имени или id. Список отсортирован по дате регистрации."
      />

      <Card className="border-white/60 bg-white/85">
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="font-heading text-2xl">
              Каталог пользователей
            </CardTitle>
            <p className="text-sm text-slate-500">
              Всего найдено: {users.pagination.totalCount.toLocaleString("ru-RU")}
            </p>
          </div>
          <form className="flex w-full max-w-md items-center gap-2">
            <Input
              type="search"
              name="query"
              placeholder="email, имя или id"
              defaultValue={users.query}
              className="h-10 rounded-full"
            />
            <Button type="submit" className="h-10 rounded-full">
              Найти
            </Button>
          </form>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email / ID</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Создан</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Истории</TableHead>
                <TableHead>Покупки</TableHead>
                <TableHead>Подписка</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="font-medium text-slate-950 hover:text-amber-700"
                      >
                        {user.email ?? "Без email"}
                      </Link>
                      <p className="max-w-[220px] truncate text-xs text-slate-500">
                        {user.id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{user.name ?? "—"}</TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <p>{formatCalendarDate(user.createdAt, locale)}</p>
                      <p className="text-xs text-slate-500">
                        {formatRelativeDate(user.createdAt, locale)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <p>{user.walletBalance.toLocaleString("ru-RU")} credits</p>
                      <p className="text-xs text-slate-500">
                        {user.availableChapters.toLocaleString("ru-RU")} глав
                        доступно
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{user.storiesCount.toLocaleString("ru-RU")}</TableCell>
                  <TableCell>
                    {user.purchasesCount.toLocaleString("ru-RU")}
                  </TableCell>
                  <TableCell className="align-top">
                    {user.activeSubscription ? (
                      <div className="space-y-1">
                        <p>{user.activeSubscription.name}</p>
                        <p className="text-xs text-slate-500">
                          {user.activeSubscription.endsAt
                            ? formatCalendarDate(
                                user.activeSubscription.endsAt,
                                locale,
                              )
                            : "без срока"}
                        </p>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <Badge
                        variant={user.effectiveAdmin ? "default" : "outline"}
                      >
                        {user.effectiveAdmin ? "ADMIN" : user.role}
                      </Badge>
                      {user.adminAccessSource === "ENV" ? (
                        <p className="text-xs text-amber-700">через env</p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? "Verified" : "Pending"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <AdminPagination
            pathname="/admin/users"
            page={users.pagination.page}
            totalPages={users.pagination.totalPages}
            searchParams={filters}
          />
        </CardContent>
      </Card>
    </div>
  );
}
