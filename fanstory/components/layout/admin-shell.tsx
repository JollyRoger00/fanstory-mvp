import Link from "next/link";
import type { ReactNode } from "react";
import {
  BookCopy,
  CreditCard,
  History,
  LayoutDashboard,
  Shield,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { getI18n } from "@/lib/i18n/server";
import { APP_NAME } from "@/lib/site";

type AdminShellProps = {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    accessSource?: "ROLE" | "ENV" | null;
  };
};

export async function AdminShell({ children, user }: AdminShellProps) {
  const { locale, t } = await getI18n();
  const isRu = locale === "ru";
  const navigation = [
    {
      href: "/admin",
      label: isRu ? "Обзор" : "Overview",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/users",
      label: isRu ? "Пользователи" : "Users",
      icon: Users,
    },
    {
      href: "/admin/payments",
      label: isRu ? "Платежи" : "Payments",
      icon: CreditCard,
    },
    {
      href: "/admin/stories",
      label: isRu ? "Истории" : "Stories",
      icon: BookCopy,
    },
    {
      href: "/admin/generation-logs",
      label: isRu ? "Логи генерации" : "Generation logs",
      icon: WandSparkles,
    },
    {
      href: "/admin/audit",
      label: isRu ? "Журнал действий" : "Audit log",
      icon: History,
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_32%),linear-gradient(180deg,_#fcfcfb_0%,_#f3f1eb_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[300px_1fr] lg:px-6">
        <aside className="rounded-[2rem] border border-white/60 bg-slate-950 px-5 py-6 text-white shadow-2xl shadow-slate-950/10">
          <Link
            href="/admin"
            className="flex items-center gap-3 text-sm font-semibold tracking-[0.24em] uppercase"
          >
            <span className="rounded-full bg-amber-400 p-2 text-slate-950">
              <Shield className="size-4" />
            </span>
            {APP_NAME} Admin
          </Link>
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/10 p-2 text-amber-300">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-white">
                  {user.name ?? t("userMenu.fallbackName")}
                </p>
                <p className="text-xs text-slate-300">
                  {user.accessSource === "ENV"
                    ? isRu
                      ? "Доступ через ADMIN_EMAILS"
                      : "Access via ADMIN_EMAILS"
                    : isRu
                      ? "Доступ через роль ADMIN"
                      : "Access via ADMIN role"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </aside>
        <main className="flex min-h-screen flex-col gap-6 rounded-[2rem] border border-white/60 bg-white/75 p-4 shadow-xl shadow-amber-950/5 backdrop-blur lg:p-8">
          <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-amber-700 uppercase">
                {isRu ? "Администрирование" : "Administration"}
              </p>
              <h1 className="font-heading text-3xl text-slate-950">
                {isRu ? "Панель управления" : "Control panel"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher
                currentLocale={locale}
                label={t("common.language.switchTo")}
                options={[
                  { value: "en", label: t("common.language.english") },
                  { value: "ru", label: t("common.language.russian") },
                ]}
              />
              <UserMenu
                name={user.name ?? t("userMenu.fallbackName")}
                email={user.email}
                image={user.image}
              />
            </div>
          </div>
          <div className="flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
