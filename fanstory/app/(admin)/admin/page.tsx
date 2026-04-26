import {
  CreditCard,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { getAdminOverview } from "@/server/admin/admin-users.service";

export default async function AdminDashboardPage() {
  const overview = await getAdminOverview();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Обзор продукта"
        description="Короткая сводка по пользователям, оплатам, подпискам и качеству генерации."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Всего пользователей"
          value={overview.totalUsers.toLocaleString("ru-RU")}
          hint={`${overview.newUsersLast24Hours.toLocaleString("ru-RU")} новых за 24 часа`}
          icon={<Users className="size-4 text-slate-400" />}
        />
        <MetricCard
          label="Всего историй"
          value={overview.totalStories.toLocaleString("ru-RU")}
          hint="Все пользовательские истории"
          icon={<Sparkles className="size-4 text-slate-400" />}
        />
        <MetricCard
          label="Платежи"
          value={overview.totalPayments.toLocaleString("ru-RU")}
          hint={`${overview.successfulPayments.toLocaleString("ru-RU")} успешных`}
          icon={<CreditCard className="size-4 text-slate-400" />}
        />
        <MetricCard
          label="Подписки и ошибки"
          value={overview.activeSubscriptions.toLocaleString("ru-RU")}
          hint={`${overview.generationErrorsLast24Hours.toLocaleString("ru-RU")} ошибок генерации за 24 часа`}
          icon={<ShieldCheck className="size-4 text-slate-400" />}
        />
      </div>
    </div>
  );
}
