import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth/session";

type SignInPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_28%),linear-gradient(180deg,_#fffef8_0%,_#f6f2ea_100%)] px-6 py-16">
      <Card className="w-full max-w-lg rounded-[2rem] border-white/60 bg-white/85 shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <Badge className="mx-auto rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100">
            Google-only access
          </Badge>
          <CardTitle className="font-heading text-5xl text-slate-950">
            Enter FanStory
          </CardTitle>
          <p className="text-sm leading-7 text-slate-600">
            Authentication is intentionally constrained to Google. Once the
            account is created, the user lands in a profile-driven workspace
            with stories, saves, balance and access data.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleSignInButton callbackUrl={params.callbackUrl} />
          <p className="text-center text-xs tracking-[0.22em] text-slate-400 uppercase">
            Auth.js + Prisma adapter + protected routes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
