import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentUser } from "@/server/auth/session";

export default async function NotFoundPage() {
  const { t } = await getI18n();
  const user = await getCurrentUser();
  const href = user ? "/dashboard" : "/";
  const label = user
    ? t("common.actions.openDashboard")
    : t("common.errors.goHome");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_24%),linear-gradient(180deg,_#fffef8_0%,_#f6f2ea_100%)] px-6">
      <Card className="w-full max-w-xl rounded-[2rem] border-white/60 bg-white/85 shadow-xl">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center">
          <Compass className="size-8 text-amber-600" />
          <div className="space-y-3">
            <h1 className="font-heading text-4xl text-slate-950">
              {t("common.errors.notFoundTitle")}
            </h1>
            <p className="text-sm leading-7 text-slate-600">
              {t("common.errors.notFoundDescription")}
            </p>
          </div>
          <Button
            asChild
            className="rounded-full bg-slate-950 hover:bg-slate-800"
          >
            <Link href={href}>{label}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
