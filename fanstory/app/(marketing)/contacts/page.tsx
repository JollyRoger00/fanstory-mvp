import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicPageShell } from "@/components/layout/public-page-shell";
import { getCurrentLocale } from "@/lib/i18n/server";
import { withAppName } from "@/lib/site";
import { getPublicSiteContent } from "@/features/public/content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { contacts } = getPublicSiteContent(locale);

  return {
    title: withAppName(contacts.title),
    description: contacts.lead,
  };
}

export default async function ContactsPage() {
  const locale = await getCurrentLocale();
  const { contacts } = getPublicSiteContent(locale);

  return (
    <PublicPageShell
      eyebrow={contacts.eyebrow}
      title={contacts.title}
      lead={contacts.lead}
    >
      <Card className="border-white/60 bg-white/85 shadow-xl">
        <CardHeader>
          <CardTitle className="font-heading text-3xl text-slate-950">
            {contacts.detailsTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contacts.details.map((detail) => (
            <div
              key={detail.label}
              className="grid gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-[220px_1fr]"
            >
              <p className="text-sm font-semibold text-slate-950">
                {detail.label}
              </p>
              <p className="text-sm leading-7 text-slate-600">{detail.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-dashed border-amber-300 bg-amber-50 shadow-sm">
        <CardContent className="p-6 text-sm leading-7 text-amber-950">
          {contacts.note}
        </CardContent>
      </Card>
    </PublicPageShell>
  );
}
