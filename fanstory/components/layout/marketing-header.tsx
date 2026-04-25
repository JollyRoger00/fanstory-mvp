import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";
import { getI18n } from "@/lib/i18n/server";
import { APP_NAME } from "@/lib/site";
import { Button } from "@/components/ui/button";

type MarketingHeaderProps = {
  isAuthenticated: boolean;
};

export async function MarketingHeader({
  isAuthenticated,
}: MarketingHeaderProps) {
  const { locale, t } = await getI18n();

  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold tracking-[0.24em] text-white uppercase"
        >
          <span className="rounded-full border border-white/15 bg-white/10 p-2">
            <BookOpenText className="size-4" />
          </span>
          {APP_NAME}
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher
            currentLocale={locale}
            label={t("common.language.switchTo")}
            options={[
              { value: "en", label: t("common.language.english") },
              { value: "ru", label: t("common.language.russian") },
            ]}
          />
          <Button
            asChild
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <Link href={isAuthenticated ? "/dashboard" : "/sign-in"}>
              {isAuthenticated
                ? t("navigation.dashboard")
                : t("common.actions.signIn")}
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300"
          >
            <Link href={isAuthenticated ? "/stories/new" : "/sign-in"}>
              {t("common.actions.startStory")}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
