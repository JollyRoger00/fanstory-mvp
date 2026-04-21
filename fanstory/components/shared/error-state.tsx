"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title: string;
  description: string;
  retryLabel: string;
  homeLabel: string;
  homeHref?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title,
  description,
  retryLabel,
  homeLabel,
  homeHref = "/",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_24%),linear-gradient(180deg,_#fffef8_0%,_#f6f2ea_100%)] px-6">
      <div className="max-w-lg rounded-[2rem] border border-white/60 bg-white/85 p-8 text-center shadow-xl">
        <AlertTriangle className="mx-auto size-8 text-amber-600" />
        <h1 className="font-heading mt-5 text-4xl text-slate-950">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {onRetry ? (
            <Button
              type="button"
              onClick={onRetry}
              className="rounded-full bg-slate-950 hover:bg-slate-800"
            >
              {retryLabel}
            </Button>
          ) : null}
          <Button asChild variant="outline" className="rounded-full">
            <Link href={homeHref}>{homeLabel}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
