import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicPageShell } from "@/components/layout/public-page-shell";
import { getCurrentLocale } from "@/lib/i18n/server";
import { withAppName } from "@/lib/site";
import { getPublicSiteContent } from "@/features/public/content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const { privacy } = getPublicSiteContent(locale);

  return {
    title: withAppName(privacy.title),
    description: privacy.lead,
  };
}

export default async function PrivacyPage() {
  const locale = await getCurrentLocale();
  const { privacy } = getPublicSiteContent(locale);

  return (
    <PublicPageShell
      eyebrow={privacy.eyebrow}
      title={privacy.title}
      lead={privacy.lead}
    >
      {privacy.sections.map((section) => (
        <Card key={section.title} className="border-white/60 bg-white/85 shadow-xl">
          <CardHeader>
            <CardTitle className="font-heading text-3xl text-slate-950">
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </CardContent>
        </Card>
      ))}
    </PublicPageShell>
  );
}
