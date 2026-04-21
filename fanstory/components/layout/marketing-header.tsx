import Link from "next/link";
import { BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";

type MarketingHeaderProps = {
  isAuthenticated: boolean;
};

export function MarketingHeader({ isAuthenticated }: MarketingHeaderProps) {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold tracking-[0.24em] text-white uppercase"
        >
          <span className="rounded-full border border-white/15 bg-white/10 p-2">
            <BookOpenText className="size-4" />
          </span>
          FanStory
        </Link>
        <nav className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <Link href={isAuthenticated ? "/dashboard" : "/sign-in"}>
              {isAuthenticated ? "Dashboard" : "Sign in"}
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300"
          >
            <Link href={isAuthenticated ? "/stories/new" : "/sign-in"}>
              Start a story
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
