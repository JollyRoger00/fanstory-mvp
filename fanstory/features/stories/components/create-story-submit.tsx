"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type CreateStorySubmitProps = {
  idleLabel: string;
  pendingLabel: string;
  pendingDescription: string;
};

export function CreateStorySubmit({
  idleLabel,
  pendingLabel,
  pendingDescription,
}: CreateStorySubmitProps) {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-3xl bg-white/80 px-6 text-center backdrop-blur-sm">
          <div className="space-y-3">
            <LoaderCircle className="mx-auto size-8 animate-spin text-amber-600" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-950">
                {pendingLabel}
              </p>
              <p className="text-sm text-slate-500">{pendingDescription}</p>
            </div>
          </div>
        </div>
      ) : null}
      <Button
        type="submit"
        className="w-full rounded-full bg-slate-950 hover:bg-slate-800"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? pendingLabel : idleLabel}
      </Button>
    </>
  );
}
