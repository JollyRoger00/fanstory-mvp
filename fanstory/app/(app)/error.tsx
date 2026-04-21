"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createTranslator, normalizeLocale } from "@/lib/i18n/translator";

type AppErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppErrorPage({ error, reset }: AppErrorPageProps) {
  void error;

  const locale = useMemo(() => {
    if (typeof document === "undefined") {
      return "en";
    }

    return normalizeLocale(document.documentElement.lang);
  }, []);

  const { t } = useMemo(() => createTranslator(locale), [locale]);

  return (
    <Card className="border-white/60 bg-white/85 shadow-xl">
      <CardContent className="flex flex-col items-start gap-5 p-8">
        <AlertTriangle className="size-8 text-amber-600" />
        <div className="space-y-2">
          <h2 className="font-heading text-3xl text-slate-950">
            {t("common.errors.title")}
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            {t("common.errors.description")}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={reset}
            className="rounded-full bg-slate-950 hover:bg-slate-800"
          >
            {t("common.errors.reset")}
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard">{t("common.actions.openDashboard")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
