"use client";

import { useMemo } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { createTranslator, normalizeLocale } from "@/lib/i18n/translator";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  void error;

  const locale = useMemo(() => {
    if (typeof document === "undefined") {
      return "en";
    }

    return normalizeLocale(document.documentElement.lang);
  }, []);

  const { t } = useMemo(() => createTranslator(locale), [locale]);

  return (
    <ErrorState
      title={t("common.errors.title")}
      description={t("common.errors.description")}
      retryLabel={t("common.errors.reset")}
      homeLabel={t("common.errors.goHome")}
      onRetry={reset}
    />
  );
}
