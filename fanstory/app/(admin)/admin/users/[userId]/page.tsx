import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adjustAdminUserChapterBalanceAction,
  adjustAdminUserWalletCreditsAction,
  cancelAdminUserSubscriptionAction,
  grantAdminUserSubscriptionAction,
  updateAdminUserRoleAction,
} from "@/server/admin/actions";
import { PageHeader } from "@/components/shared/page-header";
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
import { Textarea } from "@/components/ui/textarea";
import { getI18n } from "@/lib/i18n/server";
import {
  formatCalendarDate,
  formatRelativeDate,
  formatSignedNumber,
} from "@/lib/utils";
import { getAdminUserDetail } from "@/server/admin/admin-users.service";

type AdminUserDetailPageProps = {
  params: Promise<{
    userId: string;
  }>;
};

function selectClassName() {
  return "border-input h-10 w-full rounded-lg border bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
}

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { userId } = await params;
  const detail = await getAdminUserDetail(userId);
  const { locale } = await getI18n();

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title={detail.user.email ?? detail.user.name ?? detail.user.id}
        description={`Профиль, монетизация, подписки, истории и generation logs пользователя ${detail.user.id}.`}
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/users">К списку пользователей</Link>
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Профиль</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-950">ID:</span>{" "}
              {detail.user.id}
            </p>
            <p>
              <span className="font-medium text-slate-950">Имя:</span>{" "}
              {detail.user.name ?? "—"}
            </p>
            <p>
              <span className="font-medium text-slate-950">Email:</span>{" "}
              {detail.user.email ?? "—"}
            </p>
            <p>
              <span className="font-medium text-slate-950">Создан:</span>{" "}
              {formatCalendarDate(detail.user.createdAt, locale)}
            </p>
            <p>
              <span className="font-medium text-slate-950">Подтверждение:</span>{" "}
              {detail.user.emailVerified
                ? formatCalendarDate(detail.user.emailVerified, locale)
                : "не подтвержден"}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant={detail.user.effectiveAdmin ? "default" : "outline"}>
                {detail.user.effectiveAdmin ? "ADMIN" : detail.user.role}
              </Badge>
              {detail.user.adminAccessSource === "ENV" ? (
                <Badge variant="outline">ADMIN via env</Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Wallet и доступ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-950">Credits wallet:</span>{" "}
              {detail.wallet.balance.toLocaleString("ru-RU")}{" "}
              {detail.wallet.currency}
            </p>
            <p>
              <span className="font-medium text-slate-950">Доступно глав:</span>{" "}
              {detail.chapterBalances.total.toLocaleString("ru-RU")}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 p-3">
                <p className="text-xs uppercase text-slate-500">Welcome</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {detail.chapterBalances.welcome.toLocaleString("ru-RU")}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 p-3">
                <p className="text-xs uppercase text-slate-500">Subscription</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {detail.chapterBalances.subscriptionDaily.toLocaleString(
                    "ru-RU",
                  )}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 p-3">
                <p className="text-xs uppercase text-slate-500">Purchased</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {detail.chapterBalances.purchased.toLocaleString("ru-RU")}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 p-3">
                <p className="text-xs uppercase text-slate-500">Rewarded ad</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {detail.chapterBalances.rewardedAd.toLocaleString("ru-RU")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Текущая подписка</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {detail.activeSubscription ? (
              <>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  {detail.activeSubscription.name}
                </Badge>
                <p>
                  <span className="font-medium text-slate-950">Статус:</span>{" "}
                  {detail.activeSubscription.status}
                </p>
                <p>
                  <span className="font-medium text-slate-950">До:</span>{" "}
                  {detail.activeSubscription.endsAt
                    ? formatCalendarDate(detail.activeSubscription.endsAt, locale)
                    : "без срока"}
                </p>
              </>
            ) : (
              <p>Активной подписки нет.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 2xl:grid-cols-2">
        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Корректировка credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={adjustAdminUserWalletCreditsAction} className="space-y-3">
              <input type="hidden" name="userId" value={detail.user.id} />
              <Input
                type="number"
                name="amount"
                placeholder="Например: 100 или -50"
                required
                className="h-10"
              />
              <Textarea
                name="reason"
                placeholder="Причина операции"
                required
              />
              <Button type="submit" className="rounded-full">
                Применить
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Корректировка глав
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={adjustAdminUserChapterBalanceAction} className="space-y-3">
              <input type="hidden" name="userId" value={detail.user.id} />
              <Input
                type="number"
                name="quantity"
                placeholder="Например: 10 или -3"
                required
                className="h-10"
              />
              <Textarea
                name="reason"
                placeholder="Причина операции"
                required
              />
              <Button type="submit" className="rounded-full">
                Применить
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Выдать подписку вручную
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={grantAdminUserSubscriptionAction} className="space-y-3">
              <input type="hidden" name="userId" value={detail.user.id} />
              <select
                name="productId"
                required
                defaultValue=""
                className={selectClassName()}
              >
                <option value="" disabled>
                  Выберите продукт
                </option>
                {detail.availableSubscriptionProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.code})
                  </option>
                ))}
              </select>
              <Textarea
                name="reason"
                placeholder="Причина выдачи"
                required
              />
              <Button type="submit" className="rounded-full">
                Выдать подписку
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Отменить подписку
            </CardTitle>
          </CardHeader>
          <CardContent>
            {detail.activeSubscription ? (
              <form action={cancelAdminUserSubscriptionAction} className="space-y-3">
                <input type="hidden" name="userId" value={detail.user.id} />
                <Textarea
                  name="reason"
                  placeholder="Причина отмены"
                  required
                />
                <Button type="submit" variant="destructive" className="rounded-full">
                  Отменить активную подписку
                </Button>
              </form>
            ) : (
              <p className="text-sm text-slate-500">
                У пользователя нет активной подписки.
              </p>
            )}
          </CardContent>
        </Card>

        {detail.canManageRoles ? (
          <Card className="border-white/60 bg-white/85 2xl:col-span-2">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">
                Изменение роли
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateAdminUserRoleAction} className="grid gap-3 lg:grid-cols-[240px_1fr_auto]">
                <input type="hidden" name="userId" value={detail.user.id} />
                <select
                  name="role"
                  defaultValue={detail.user.role}
                  className={selectClassName()}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <Textarea
                  name="reason"
                  placeholder="Причина изменения роли"
                  required
                />
                <Button type="submit" className="self-end rounded-full">
                  Сменить роль
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="grid gap-4 2xl:grid-cols-2">
        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">
              Wallet transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Тип</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Баланс после</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Когда</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.walletTransactions.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.type}</TableCell>
                    <TableCell>{formatSignedNumber(entry.amount, locale)}</TableCell>
                    <TableCell>
                      {entry.balanceAfter.toLocaleString("ru-RU")}
                    </TableCell>
                    <TableCell className="max-w-[240px] whitespace-normal">
                      {entry.description}
                    </TableCell>
                    <TableCell>{formatRelativeDate(entry.createdAt, locale)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Chapter ledger</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Источник</TableHead>
                  <TableHead>Событие</TableHead>
                  <TableHead>Количество</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Когда</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.chapterLedger.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.source}</TableCell>
                    <TableCell>{entry.eventType}</TableCell>
                    <TableCell>
                      {formatSignedNumber(entry.quantity, locale)}
                    </TableCell>
                    <TableCell className="max-w-[240px] whitespace-normal">
                      {entry.description ?? "—"}
                    </TableCell>
                    <TableCell>{formatRelativeDate(entry.createdAt, locale)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 2xl:grid-cols-2">
        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Покупки</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Когда</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="max-w-[180px] truncate">
                      {purchase.id}
                    </TableCell>
                    <TableCell>{purchase.type}</TableCell>
                    <TableCell>{purchase.status}</TableCell>
                    <TableCell>{purchase.amount.toLocaleString("ru-RU")}</TableCell>
                    <TableCell className="max-w-[220px] whitespace-normal">
                      {purchase.productName ?? purchase.description ?? "—"}
                    </TableCell>
                    <TableCell>{formatRelativeDate(purchase.createdAt, locale)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/85">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Подписки</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Продукт</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Старт</TableHead>
                  <TableHead>Окончание</TableHead>
                  <TableHead>Отменена</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>{subscription.productName ?? "—"}</TableCell>
                    <TableCell>{subscription.status}</TableCell>
                    <TableCell>
                      {formatCalendarDate(subscription.startsAt, locale)}
                    </TableCell>
                    <TableCell>
                      {subscription.endsAt
                        ? formatCalendarDate(subscription.endsAt, locale)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {subscription.canceledAt
                        ? formatCalendarDate(subscription.canceledAt, locale)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Истории</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Вселенная</TableHead>
                <TableHead>Жанр</TableHead>
                <TableHead>Глав</TableHead>
                <TableHead>Текущая глава</TableHead>
                <TableHead>Обновлена</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.stories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell>
                    <Link
                      href={`/admin/stories/${story.id}`}
                      className="font-medium text-slate-950 hover:text-amber-700"
                    >
                      {story.title}
                    </Link>
                  </TableCell>
                  <TableCell>{story.universe}</TableCell>
                  <TableCell>{story.genre}</TableCell>
                  <TableCell>{story.chapterCount.toLocaleString("ru-RU")}</TableCell>
                  <TableCell>
                    {story.currentChapterNumber.toLocaleString("ru-RU")}
                  </TableCell>
                  <TableCell>{formatRelativeDate(story.updatedAt, locale)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-white/60 bg-white/85">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            Generation logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
              {detail.generationLogs.map((log) => (
                <TableRow key={log.id}>
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
        </CardContent>
      </Card>
    </div>
  );
}
