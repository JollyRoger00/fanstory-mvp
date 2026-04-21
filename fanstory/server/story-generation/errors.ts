export type StoryGenerationStage =
  | "initial_story"
  | "apply_choice"
  | "next_chapter";

type StoryGenerationErrorOptions = {
  stage: StoryGenerationStage;
  provider: "mock" | "openai";
  requestId?: string | null;
  cause?: unknown;
};

export class StoryGenerationError extends Error {
  readonly stage: StoryGenerationStage;
  readonly provider: "mock" | "openai";
  readonly requestId: string | null;

  constructor(message: string, options: StoryGenerationErrorOptions) {
    super(message, {
      cause: options.cause,
    });
    this.name = "StoryGenerationError";
    this.stage = options.stage;
    this.provider = options.provider;
    this.requestId = options.requestId ?? null;
  }
}

export function getStoryGenerationFailureMessage(
  stage: StoryGenerationStage,
): string {
  switch (stage) {
    case "initial_story":
      return "OpenAI failed to generate the opening story package. Check server logs for the request ID and diagnostics.";
    case "apply_choice":
      return "OpenAI failed to resolve the selected choice. Check server logs for the request ID and diagnostics.";
    case "next_chapter":
      return "OpenAI failed to generate the next chapter. Check server logs for the request ID and diagnostics.";
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}
