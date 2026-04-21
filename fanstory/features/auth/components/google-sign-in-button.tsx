import { Sparkles } from "lucide-react";
import { signInWithGoogle } from "@/server/auth/actions";
import { Button } from "@/components/ui/button";

type GoogleSignInButtonProps = {
  callbackUrl?: string;
};

export function GoogleSignInButton({
  callbackUrl = "/dashboard",
}: GoogleSignInButtonProps) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Button
        type="submit"
        size="lg"
        className="w-full rounded-full bg-slate-950 text-white hover:bg-slate-800"
      >
        <Sparkles className="size-4" />
        Continue with Google
      </Button>
    </form>
  );
}
