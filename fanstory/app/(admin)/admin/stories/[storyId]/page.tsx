import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
import { getI18n } from "@/lib/i18n/server";
import { formatCalendarDate, formatRelativeDate } from "@/lib/utils";
import { getAdminStoryDetail } from "@/server/admin/admin-stories.service";

type AdminStoryDetailPageProps = {
  params: Promise<{
    storyId: string;
  }>;
};

export default async function AdminStoryDetailPage({
  params,
}: AdminStoryDetailPageProps) {
  const { storyId } = await params;
  const detail = await getAdminStoryDetail(storyId);
  const { locale } = await getI18n();

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title={detail.story.title}
        description={detail.story.synopsis ?? "Диагностика story, run и generation logs."}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/stories">К списку историй</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/admin/users/${detail.story.userId}`}>
                К пользователю
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{detail.story.status}</Badge>
              <Badge variant="outline">{detail.story.universe}</Badge>
              <Badge variant="outline">{detail.story.genre}</Badge>
              <Badge variant="outline">{detail.story.tone}</Badge>
            </div>
            <p>
              <span className="font-medium text-slate-950">Пользователь:</span>{" "}
              <Link
                href={`/admin/users/${detail.story.userId}`}
                className="hover:text-amber-700"
              >
                {detail.story.userEmail ?? detail.story.userId}
              </Link>
            </p>
            <p>
              <span className="font-medium text-slate-950">Protagonist:</span>{" "}
              {detail.story.protagonist}
            </p>
            <p>
              <span className="font-medium text-slate-950">Theme:</span>{" "}
              {detail.story.theme}
            </p>
            <p>
              <span className="font-medium text-slate-950">Создана:</span>{" "}
              {formatCalendarDate(detail.story.createdAt, locale)}
            </p>
            <p>
              <span className="font-medium text-slate-950">Обновлена:</span>{" "}
              {formatRelativeDate(detail.story.updatedAt, locale)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">StoryRun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {detail.storyRun ? (
              <>
                <p>
                  <span className="font-medium text-slate-950">ID:</span>{" "}
                  {detail.storyRun.id}
                </p>
                <p>
                  <span className="font-medium text-slate-950">Статус:</span>{" "}
                  {detail.storyRun.status}
                </p>
                <p>
                  <span className="font-medium text-slate-950">Provider:</span>{" "}
                  {detail.storyRun.provider}
                </p>
                <p>
                  <span className="font-medium text-slate-950">
                    Prompt version:
                  </span>{" "}
                  {detail.storyRun.promptVersion}
                </p>
                <p>
                  <span className="font-medium text-slate-950">Current chapter:</span>{" "}
                  {detail.storyRun.currentChapterNumber}
                </p>
                <p className="rounded-2xl border border-slate-200/80 p-3">
                  {detail.storyRun.currentStateSummary}
                </p>
              </>
            ) : (
              <p>StoryRun не найден.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Chapters и choices</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {detail.chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="rounded-[2rem] border border-slate-200/80 bg-slate-50 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <Badge variant="secondary">Глава {chapter.number}</Badge>
                <span className="text-xs text-slate-500">
                  {formatCalendarDate(chapter.createdAt, locale)}
                </span>
              </div>
              <h3 className="mt-3 font-heading text-2xl text-slate-950">
                {chapter.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {chapter.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {chapter.choices.map((choice) => (
                  <Badge key={choice.id} variant="outline">
                    {choice.label}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Decisions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Глава</TableHead>
                <TableHead>Выбор</TableHead>
                <TableHead>Итог</TableHead>
                <TableHead>Когда</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.decisions.map((decision) => (
                <TableRow key={decision.id}>
                  <TableCell>{decision.chapterNumber}</TableCell>
                  <TableCell>{decision.selectedLabel}</TableCell>
                  <TableCell className="max-w-[420px] whitespace-normal">
                    {decision.resolutionSummary}
                  </TableCell>
                  <TableCell>{formatRelativeDate(decision.createdAt, locale)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Generation logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Событие</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Ошибка</TableHead>
                <TableHead>Когда</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.generationLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Link
                      href={`/admin/users/${log.userId}`}
                      className="font-medium text-slate-950 hover:text-amber-700"
                    >
                      {log.userEmail ?? log.userId}
                    </Link>
                  </TableCell>
                  <TableCell>{log.provider}</TableCell>
                  <TableCell>{log.model ?? "—"}</TableCell>
                  <TableCell>{log.eventType}</TableCell>
                  <TableCell>{log.status}</TableCell>
                  <TableCell className="max-w-[320px] whitespace-normal text-xs text-slate-500">
                    {log.errorMessage ?? "—"}
                  </TableCell>
                  <TableCell>{formatRelativeDate(log.createdAt, locale)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
