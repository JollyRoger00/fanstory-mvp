import Link from "next/link";
import type { ReactNode } from "react";
import {
  BookMarked,
  CreditCard,
  FolderHeart,
  LayoutDashboard,
  LibraryBig,
  Sparkles,
} from "lucide-react";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";
import { getI18n } from "@/lib/i18n/server";
import { APP_NAME } from "@/lib/site";
import { UserMenu } from "@/components/layout/user-menu";

type AppShellProps = {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export async function AppShell({ children, user }: AppShellProps) {
  const { locale, t } = await getI18n();
  const navigation = [
    {
      href: "/dashboard",
      label: t("navigation.dashboard"),
      icon: LayoutDashboard,
    },
    { href: "/stories", label: t("navigation.stories"), icon: LibraryBig },
    { href: "/saves", label: t("navigation.saves"), icon: BookMarked },
    { href: "/wallet", label: t("navigation.wallet"), icon: CreditCard },
    {
      href: "/subscriptions",
      label: t("navigation.subscriptions"),
      icon: FolderHeart,
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_32%),linear-gradient(180deg,_#fffef8_0%,_#f8f5ef_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6">
        <aside className="rounded-[2rem] border border-white/60 bg-slate-950 px-5 py-6 text-white shadow-2xl shadow-slate-950/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 text-sm font-semibold tracking-[0.24em] uppercase"
          >
            <span className="rounded-full bg-amber-400 p-2 text-slate-950">
              <Sparkles className="size-4" />
            </span>
            {APP_NAME}
          </Link>
          <div className="mt-10 space-y-2">
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
        <main className="flex min-h-screen flex-col gap-6 rounded-[2rem] border border-white/60 bg-white/70 p-4 shadow-xl shadow-amber-950/5 backdrop-blur lg:p-8">
          <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-amber-700 uppercase">
                {t("navigation.workspaceEyebrow")}
              </p>
              <h1 className="font-heading text-3xl text-slate-950">
                {t("navigation.workspaceTitle")}
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
