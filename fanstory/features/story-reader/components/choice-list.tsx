"use client";

import {
  type FormEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { LoaderCircle } from "lucide-react";
import type { StoryChoiceView } from "@/entities/story/types";
import { chooseStoryPathAction } from "@/server/stories/actions";
import { Button } from "@/components/ui/button";

type ChoiceListProps = {
  storyId: string;
  choices: StoryChoiceView[];
  pendingLabel: string;
  pendingDescription: string;
};

export function ChoiceList({
  storyId,
  choices,
  pendingLabel,
  pendingDescription,
}: ChoiceListProps) {
  const submittedSignatureRef = useRef<string | null>(null);
  const [submittingSignature, setSubmittingSignature] = useState<string | null>(
    null,
  );
  const choiceSignature = useMemo(
    () => `${storyId}:${choices.map((choice) => choice.id).join("|")}`,
    [choices, storyId],
  );
  const isSubmitting = submittingSignature === choiceSignature;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (submittedSignatureRef.current === choiceSignature) {
      event.preventDefault();
      return;
    }

    submittedSignatureRef.current = choiceSignature;
    setSubmittingSignature(choiceSignature);
  }

  return (
    <div className="relative grid gap-3" aria-busy={isSubmitting}>
      {isSubmitting ? (
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
      {choices.map((choice) => (
        <form
          key={choice.id}
          action={chooseStoryPathAction}
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="storyId" value={storyId} />
          <input type="hidden" name="choiceId" value={choice.id} />
          <Button
            type="submit"
            variant="outline"
            className="h-auto w-full justify-start rounded-3xl px-5 py-4 text-left"
            disabled={isSubmitting}
          >
            <span className="space-y-1">
              <span className="block text-sm font-medium">{choice.label}</span>
              {choice.outcomeHint ? (
                <span className="block text-xs text-slate-500">
                  {choice.outcomeHint}
                </span>
              ) : null}
            </span>
          </Button>
        </form>
      ))}
    </div>
  );
}
