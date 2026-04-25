import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Coins,
  LockKeyhole,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentUser } from "@/server/auth/session";

const pillarIcons = [Sparkles, BookOpenText, Coins];
const architectureIcons = [LockKeyhole, Coins, Waypoints];

export default async function LandingPage() {
  const user = await getCurrentUser();
  const { t, raw } = await getI18n();
  const pillars =
    raw<Array<{ title: string; description: string }>>("landing.pillars");
  const architectureCards = raw<Array<{ title: string; description: string }>>(
    "landing.architectureCards",
  );
  const architectureTitle = t("landing.architectureTitle");

  return (
    <div className="bg-[linear-gradient(180deg,_#020617_0%,_#111827_55%,_#f8f5ef_55%,_#f8f5ef_100%)]">
      <main className="pb-24">
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="space-y-8">
            <Badge className="rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/10">
              {t("landing.badge")}
            </Badge>
            <div className="space-y-6">
              <h1 className="font-heading max-w-4xl text-6xl leading-[0.95] tracking-tight text-white md:text-7xl">
                {t("landing.title")}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                {t("landing.description")}
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-amber-400 px-8 text-slate-950 hover:bg-amber-300"
              >
                <Link href={user ? "/stories/new" : "/sign-in"}>
                  {t("landing.heroPrimary")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/20 bg-white/5 px-8 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href={user ? "/dashboard" : "/sign-in"}>
                  {t("landing.heroSecondary")}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-white/10 bg-white/5 text-white md:col-span-2">
              <CardHeader>
                <CardTitle className="font-heading text-3xl">
                  {architectureTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {architectureCards.map((card, index) => {
                  const Icon = architectureIcons[index] ?? LockKeyhole;

                  return (
                    <div
                      key={card.title}
                      className="rounded-3xl border border-white/10 bg-white/5 p-4"
                    >
                      <Icon className="size-5 text-amber-300" />
                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        {card.description}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {pillars.map((pillar, index) => {
              const Icon = pillarIcons[index] ?? Sparkles;

              return (
                <Card
                  key={pillar.title}
                  className="h-full border-white/60 bg-white/80 shadow-sm"
                >
                  <CardHeader>
                    <span className="w-fit rounded-full bg-amber-100 p-3 text-amber-700">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle className="font-heading text-[2rem] leading-tight">
                      {pillar.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-6 text-slate-600">
                    {pillar.description}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
