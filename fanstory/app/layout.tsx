import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  IBM_Plex_Mono,
  Space_Grotesk,
} from "next/font/google";
import { Toaster } from "sonner";
import { YandexAdsLoader } from "@/components/ads/yandex-ads-loader";
import { getServerEnv } from "@/lib/env/server";
import { getCurrentLocale } from "@/lib/i18n/server";
import { APP_NAME, getSiteDescription } from "@/lib/site";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const env = getServerEnv();
  const title = APP_NAME;
  const description = getSiteDescription(locale);
  const metadataBase = new URL(env.NEXT_PUBLIC_APP_URL);
  const production = env.NODE_ENV === "production";

  return {
    metadataBase,
    applicationName: APP_NAME,
    title,
    description,
    robots: production
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: false,
        },
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      url: metadataBase,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();

  return (
    <html
      lang={locale}
      className={`${spaceGrotesk.variable} ${cormorant.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-slate-950">
        <YandexAdsLoader />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
