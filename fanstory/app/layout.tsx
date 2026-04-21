import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  IBM_Plex_Mono,
  Space_Grotesk,
} from "next/font/google";
import { Toaster } from "sonner";
import { getServerEnv } from "@/lib/env/server";
import { getI18n } from "@/lib/i18n/server";
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
  const { t } = await getI18n();
  const env = getServerEnv();
  const title = t("metadata.title");
  const description = t("metadata.description");
  const metadataBase = new URL(env.NEXT_PUBLIC_APP_URL);
  const production = env.NODE_ENV === "production";

  return {
    metadataBase,
    applicationName: "FanStory",
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
      siteName: "FanStory",
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
  const { locale } = await getI18n();

  return (
    <html
      lang={locale}
      className={`${spaceGrotesk.variable} ${cormorant.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-slate-950">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
