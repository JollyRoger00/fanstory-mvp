import Link from "next/link";
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
import { listAdminStories } from "@/server/admin/admin-stories.service";

type AdminStoriesPageProps = {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
};

export default async function AdminStoriesPage({
  searchParams,
}: AdminStoriesPageProps) {
  const filters = await searchParams;
  const stories = await listAdminStories(filters);
  const { locale } = await getI18n();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Истории"
        description="Просмотр пользовательских историй и быстрый переход в диагностику конкретной истории."
      />

      <Card className="border-white/60 bg-white/85">
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="font-heading text-2xl">
              Каталог историй
            </CardTitle>
            <p className="text-sm text-slate-500">
              Найдено: {stories.pagination.totalCount.toLocaleString("ru-RU")}
            </p>
          </div>
          <form className="flex w-full max-w-md items-center gap-2">
            <Input
              type="search"
              name="query"
              placeholder="title, universe, user email, id"
              defaultValue={stories.query}
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
                <TableHead>Название</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Вселенная</TableHead>
                <TableHead>Жанр</TableHead>
                <TableHead>Глав</TableHead>
                <TableHead>Создана</TableHead>
                <TableHead>Обновлена</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.items.map((story) => (
                <TableRow key={story.id}>
                  <TableCell>
                    <Link
                      href={`/admin/stories/${story.id}`}
                      className="font-medium text-slate-950 hover:text-amber-700"
                    >
                      {story.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/users/${story.userId}`}
                      className="font-medium text-slate-950 hover:text-amber-700"
                    >
                      {story.userEmail ?? "Без email"}
                    </Link>
                  </TableCell>
                  <TableCell>{story.universe}</TableCell>
                  <TableCell>{story.genre}</TableCell>
                  <TableCell>{story.chapterCount.toLocaleString("ru-RU")}</TableCell>
                  <TableCell>{formatCalendarDate(story.createdAt, locale)}</TableCell>
                  <TableCell>{formatRelativeDate(story.updatedAt, locale)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <AdminPagination
            pathname="/admin/stories"
            page={stories.pagination.page}
            totalPages={stories.pagination.totalPages}
            searchParams={filters}
          />
        </CardContent>
      </Card>
    </div>
  );
}
