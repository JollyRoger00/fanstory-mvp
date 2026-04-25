import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { APP_NAME } from "@/lib/site";

type PublicPageShellProps = {
  eyebrow: string;
  title: string;
  lead: string;
  children: ReactNode;
};

export function PublicPageShell({
  eyebrow,
  title,
  lead,
  children,
}: PublicPageShellProps) {
  return (
    <main className="bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.14),_transparent_26%),linear-gradient(180deg,_#fffef8_0%,_#f6f2ea_100%)]">
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <div className="space-y-6">
          <Badge className="rounded-full bg-amber-100 px-4 py-2 text-amber-900 hover:bg-amber-100">
            {eyebrow}
          </Badge>
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
              {APP_NAME}
            </p>
            <h1 className="font-heading text-4xl text-slate-950 md:text-6xl">
              {title}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              {lead}
            </p>
          </div>
        </div>
        <div className="mt-10 space-y-6">{children}</div>
      </div>
    </main>
  );
}
