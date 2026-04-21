import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sanitizeCallbackUrl } from "@/lib/auth/callback-url";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentUser } from "@/server/auth/session";

type SignInPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const { t } = await getI18n();
  const callbackUrl = sanitizeCallbackUrl(params.callbackUrl);

  if (user) {
    redirect(callbackUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_28%),linear-gradient(180deg,_#fffef8_0%,_#f6f2ea_100%)] px-6 py-16">
      <Card className="w-full max-w-lg rounded-[2rem] border-white/60 bg-white/85 shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <Badge className="mx-auto rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100">
            {t("signIn.badge")}
          </Badge>
          <CardTitle className="font-heading text-5xl text-slate-950">
            {t("signIn.title")}
          </CardTitle>
          <p className="text-sm leading-7 text-slate-600">
            {t("signIn.description")}
          </p>
        </CardHeader>
        <CardContent>
          <GoogleSignInButton callbackUrl={callbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
