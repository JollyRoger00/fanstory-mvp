import { z } from "zod";

const generatedChoicePayloadSchema = z
  .object({
    label: z.string().min(8).max(120),
    outcomeHint: z.string().min(16).max(180),
  })
  .strict();

function uniqueChoicesRefinement(
  choices: Array<{ label: string }>,
  ctx: z.RefinementCtx,
) {
  const seen = new Set<string>();

  for (const [index, choice] of choices.entries()) {
    const normalized = choice.label.trim().toLocaleLowerCase("en-US");

    if (seen.has(normalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Choice labels must be unique.",
        path: [index, "label"],
      });
      continue;
    }

    seen.add(normalized);
  }
}

const storyStateSnapshotSchema = z
  .object({
    summary: z.string().min(40).max(320),
    activeGoals: z.array(z.string().min(12).max(180)).min(2).max(4),
    unresolvedTensions: z.array(z.string().min(12).max(180)).min(2).max(4),
    knownFacts: z.array(z.string().min(8).max(180)).min(3).max(5),
  })
  .strict();

export const initialStoryResponseSchema = z
  .object({
    synopsis: z.string().min(40).max(320),
    initialState: storyStateSnapshotSchema,
    firstChapter: z
      .object({
        title: z.string().min(4).max(120),
        summary: z.string().min(40).max(320),
        text: z.string().min(700).max(5000),
        choices: z
          .array(generatedChoicePayloadSchema)
          .length(3)
          .superRefine(uniqueChoicesRefinement),
      })
      .strict(),
  })
  .strict();

export const applyChoiceResponseSchema = z
  .object({
    resolutionSummary: z.string().min(50).max(400),
    updatedState: storyStateSnapshotSchema,
    nextBeat: z.string().min(16).max(180),
    moodShift: z.string().min(16).max(180),
  })
  .strict();

export const nextChapterResponseSchema = z
  .object({
    title: z.string().min(4).max(120),
    summary: z.string().min(40).max(320),
    text: z.string().min(700).max(5000),
    choices: z
      .array(generatedChoicePayloadSchema)
      .length(3)
      .superRefine(uniqueChoicesRefinement),
  })
  .strict();

export type InitialStoryResponsePayload = z.infer<
  typeof initialStoryResponseSchema
>;
export type ApplyChoiceResponsePayload = z.infer<
  typeof applyChoiceResponseSchema
>;
export type NextChapterResponsePayload = z.infer<
  typeof nextChapterResponseSchema
>;
