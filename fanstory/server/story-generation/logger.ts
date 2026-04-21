import type { StoryGenerationStage } from "@/server/story-generation/errors";

type StoryGenerationLogLevel = "info" | "warn" | "error";

type StoryGenerationLogPayload = {
  provider: "mock" | "openai";
  stage: StoryGenerationStage;
  model?: string;
  promptVersion?: string;
  requestId?: string | null;
  durationMs?: number;
  storyId?: string;
  userId?: string;
  nextChapterNumber?: number;
  responseId?: string;
  usage?: unknown;
  reason?: string;
  details?: unknown;
};

function createLogPrefix(level: StoryGenerationLogLevel) {
  return `[story-generation:${level}]`;
}

export function logStoryGeneration(
  level: StoryGenerationLogLevel,
  payload: StoryGenerationLogPayload,
  error?: unknown,
) {
  const logger =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.info;

  if (error) {
    logger(createLogPrefix(level), payload, error);
    return;
  }

  logger(createLogPrefix(level), payload);
}
