import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicPageShell } from "@/components/layout/public-page-shell";
import { getCurrentLocale } from "@/lib/i18n/server";
import { withAppName } from "@/lib/site";
import { getPublicSiteContent } from "@/features/public/content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { pricing } = getPublicSiteContent(locale);

  return {
    title: withAppName(pricing.title),
    description: pricing.lead,
  };
}

export default async function PricingPage() {
  const locale = await getCurrentLocale();
  const { pricing } = getPublicSiteContent(locale);

  return (
    <PublicPageShell
      eyebrow={pricing.eyebrow}
      title={pricing.title}
      lead={pricing.lead}
    >
      <Card className="border-white/60 bg-white/85 shadow-xl">
        <CardHeader>
          <CardTitle className="font-heading text-3xl text-slate-950">
            {pricing.serviceTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
          <p>{pricing.serviceDescription}</p>
          <div className="rounded-3xl bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-900">
              {pricing.freeAccessTitle}
            </p>
            <p className="mt-2">{pricing.freeAccessDescription}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/60 bg-white/85 shadow-xl">
          <CardHeader>
            <CardTitle className="font-heading text-3xl text-slate-950">
              {pricing.chapterPacksTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pricing.packs.map((pack) => (
              <div
                key={pack.name}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-lg font-semibold text-slate-950">
                    {pack.name}
                  </h2>
                  <p className="text-2xl font-semibold text-slate-950">
                    {pack.price}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {pack.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/85 shadow-xl">
          <CardHeader>
            <CardTitle className="font-heading text-3xl text-slate-950">
              {pricing.subscriptionsTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pricing.subscriptions.map((subscription) => (
              <div
                key={subscription.name}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-lg font-semibold text-slate-950">
                    {subscription.name}
                  </h2>
                  <p className="text-2xl font-semibold text-slate-950">
                    {subscription.price}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {subscription.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/60 bg-slate-950 text-white shadow-xl">
        <CardHeader>
          <CardTitle className="font-heading text-3xl">
            {locale === "ru" ? "Порядок оказания услуги" : "Service delivery"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm leading-7 text-slate-300">
            {pricing.fulfillmentNotes.map((note) => (
              <li key={note} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                {note}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </PublicPageShell>
  );
}
