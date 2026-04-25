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

function hasMinimumParagraphs(text: string, minimum: number) {
  return (
    text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean).length >= minimum
  );
}

export const storyPlanSchema = z
  .object({
    targetChapterCount: z.number().int().min(30).max(50),
    storyPromise: z.string().min(30).max(220),
    centralQuestion: z.string().min(20).max(220),
    actBlueprint: z
      .array(
        z
          .object({
            name: z.string().min(4).max(60),
            chapterStart: z.number().int().min(1).max(50),
            chapterEnd: z.number().int().min(1).max(50),
            purpose: z.string().min(20).max(220),
          })
          .strict(),
      )
      .length(4),
    majorTurns: z
      .array(
        z
          .object({
            chapter: z.number().int().min(1).max(50),
            description: z.string().min(20).max(220),
          })
          .strict(),
      )
      .min(4)
      .max(6),
    persistentThreads: z.array(z.string().min(16).max(180)).min(4).max(7),
    endingDirections: z.array(z.string().min(16).max(180)).length(3),
    choiceAxes: z.array(z.string().min(12).max(120)).min(3).max(5),
  })
  .strict()
  .superRefine((plan, ctx) => {
    for (const [index, phase] of plan.actBlueprint.entries()) {
      if (phase.chapterStart > phase.chapterEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Act phase chapterStart must be less than or equal to chapterEnd.",
          path: ["actBlueprint", index],
        });
      }

      if (index === 0 && phase.chapterStart !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "The first act phase must start at chapter 1.",
          path: ["actBlueprint", index, "chapterStart"],
        });
      }

      if (index > 0) {
        const previous = plan.actBlueprint[index - 1];

        if (phase.chapterStart !== previous.chapterEnd + 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Act phases must form a continuous chapter sequence.",
            path: ["actBlueprint", index, "chapterStart"],
          });
        }
      }
    }

    const lastPhase = plan.actBlueprint.at(-1);

    if (lastPhase && lastPhase.chapterEnd !== plan.targetChapterCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The final act phase must end at targetChapterCount.",
        path: ["actBlueprint", plan.actBlueprint.length - 1, "chapterEnd"],
      });
    }
  });

export const chapterTextSchema = z
  .string()
  .min(4000)
  .max(14000)
  .refine((value) => hasMinimumParagraphs(value, 6), {
    message: "Chapter text must contain at least six paragraphs.",
  });

const chapterScaffoldSchema = z
  .object({
    title: z.string().min(4).max(120),
    summary: z.string().min(50).max(360),
    sceneBeats: z.array(z.string().min(20).max(220)).min(4).max(6),
    choices: z
      .array(generatedChoicePayloadSchema)
      .length(3)
      .superRefine(uniqueChoicesRefinement),
  })
  .strict();

const storyStateSnapshotSchema = z
  .object({
    summary: z.string().min(50).max(450),
    activeGoals: z.array(z.string().min(12).max(180)).min(2).max(5),
    unresolvedTensions: z.array(z.string().min(12).max(180)).min(3).max(6),
    knownFacts: z.array(z.string().min(8).max(180)).min(4).max(8),
  })
  .strict();

export const initialStoryResponseSchema = z
  .object({
    synopsis: z.string().min(40).max(320),
    storyPlan: storyPlanSchema,
    initialState: storyStateSnapshotSchema,
    firstChapter: chapterScaffoldSchema,
  })
  .strict();

export const applyChoiceResponseSchema = z
  .object({
    resolutionSummary: z.string().min(70).max(500),
    updatedState: storyStateSnapshotSchema,
    nextBeat: z.string().min(24).max(220),
    moodShift: z.string().min(24).max(220),
  })
  .strict();

export const nextChapterResponseSchema = z
  .object(chapterScaffoldSchema.shape)
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
