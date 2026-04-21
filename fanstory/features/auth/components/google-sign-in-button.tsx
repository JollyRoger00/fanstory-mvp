import { Sparkles } from "lucide-react";
import { signInWithGoogle } from "@/server/auth/actions";
import { getI18n } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";

type GoogleSignInButtonProps = {
  callbackUrl?: string;
};

export async function GoogleSignInButton({
  callbackUrl = "/dashboard",
}: GoogleSignInButtonProps) {
  const { t } = await getI18n();

  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Button
        type="submit"
        size="lg"
        className="w-full rounded-full bg-slate-950 text-white hover:bg-slate-800"
      >
        <Sparkles className="size-4" />
        {t("common.actions.continueWithGoogle")}
      </Button>
    </form>
  );
}
