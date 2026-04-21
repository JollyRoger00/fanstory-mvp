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
import { UserMenu } from "@/components/layout/user-menu";

type AppShellProps = {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stories", label: "Stories", icon: LibraryBig },
  { href: "/saves", label: "Saves", icon: BookMarked },
  { href: "/wallet", label: "Wallet", icon: CreditCard },
  { href: "/subscriptions", label: "Subscriptions", icon: FolderHeart },
];

export function AppShell({ children, user }: AppShellProps) {
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
            FanStory
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
          <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-white/8 p-4">
            <p className="text-xs font-semibold tracking-[0.24em] text-amber-300 uppercase">
              Product note
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Chapters, subscriptions, wallet and generation are already
              separated in the server layer, so payment and AI providers can
              evolve without rewriting UI routes.
            </p>
          </div>
        </aside>
        <main className="flex min-h-screen flex-col gap-6 rounded-[2rem] border border-white/60 bg-white/70 p-4 shadow-xl shadow-amber-950/5 backdrop-blur lg:p-8">
          <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-amber-700 uppercase">
                Interactive AI storytelling
              </p>
              <h1 className="font-heading text-3xl text-slate-950">
                Command center
              </h1>
            </div>
            <UserMenu
              name={user.name ?? "FanStory User"}
              email={user.email}
              image={user.image}
            />
          </div>
          <div className="flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
