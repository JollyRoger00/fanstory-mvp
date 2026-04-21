import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Coins,
  LockKeyhole,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth/session";

const pillars = [
  {
    title: "Interactive story engine",
    description:
      "Chapters are generated as a coherent run with structured state, choice history and a provider abstraction ready for real AI backends.",
    icon: Sparkles,
  },
  {
    title: "Profile as control center",
    description:
      "Stories, saves, balance, purchases and subscription status live under one dashboard instead of being scattered across temporary pages.",
    icon: BookOpenText,
  },
  {
    title: "Monetization foundations",
    description:
      "Wallet, purchase and subscription access are modeled server-side, so future payment providers can be integrated without rewriting core UI flows.",
    icon: Coins,
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#020617_0%,_#111827_55%,_#f8f5ef_55%,_#f8f5ef_100%)]">
      <MarketingHeader isAuthenticated={Boolean(user)} />
      <main className="pb-24">
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="space-y-8">
            <Badge className="rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/10">
              Final-product foundation for interactive AI fiction
            </Badge>
            <div className="space-y-6">
              <h1 className="font-heading max-w-4xl text-6xl leading-[0.95] tracking-tight text-white md:text-7xl">
                FanStory turns branching AI fiction into a real product surface.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Google sign-in, profile-centric UX, wallet and chapter access,
                story saves, subscription-ready entitlements, and a provider
                layer prepared for OpenAI or another generation backend.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-amber-400 px-8 text-slate-950 hover:bg-amber-300"
              >
                <Link href={user ? "/stories/new" : "/sign-in"}>
                  Start building stories
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
                  Open dashboard
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-white/10 bg-white/5 text-white md:col-span-2">
              <CardHeader>
                <CardTitle className="font-heading text-3xl">
                  Product-ready architecture, not a one-shot demo
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <LockKeyhole className="size-5 text-amber-300" />
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Premium chapter gating is evaluated in a dedicated access
                    service.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <Coins className="size-5 text-amber-300" />
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Wallet and purchase ledger are separate from components and
                    forms.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <Waypoints className="size-5 text-amber-300" />
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Provider abstraction is ready to swap mock generation for a
                    live model.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;

              return (
                <Card
                  key={pillar.title}
                  className="border-white/60 bg-white/80 shadow-sm"
                >
                  <CardHeader>
                    <span className="w-fit rounded-full bg-amber-100 p-3 text-amber-700">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle className="font-heading text-3xl">
                      {pillar.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-7 text-slate-600">
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
