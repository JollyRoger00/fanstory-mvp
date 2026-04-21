"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";
import { setLocaleAction } from "@/lib/i18n/actions";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  currentLocale: Locale;
  label: string;
  options: Array<{
    value: Locale;
    label: string;
  }>;
  className?: string;
};

export function LanguageSwitcher({
  currentLocale,
  label,
  options,
  className,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  return (
    <form action={setLocaleAction} className={cn("flex items-center gap-2", className)}>
      <input type="hidden" name="pathname" value={currentPath} />
      <span className="sr-only">{label}</span>
      <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 p-1 text-slate-600 shadow-xs">
        <span className="flex items-center px-2 text-slate-500">
          <Languages className="size-4" />
        </span>
        {options.map((option) => (
          <button
            key={option.value}
            type="submit"
            name="locale"
            value={option.value}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.22em] uppercase transition",
              currentLocale === option.value
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </form>
  );
}
