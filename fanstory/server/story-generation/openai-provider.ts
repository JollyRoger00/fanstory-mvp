import "server-only";

import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import { getServerEnv } from "@/lib/env/server";
import {
  getErrorMessage,
  getStoryGenerationFailureMessage,
  StoryGenerationError,
  type StoryGenerationStage,
} from "@/server/story-generation/errors";
import { logStoryGeneration } from "@/server/story-generation/logger";
import { getOpenAIClient } from "@/server/story-generation/openai-client";
import {
  buildApplyChoicePrompt,
  buildInitialChapterTextPrompt,
  buildInitialStoryPrompt,
  buildNextChapterPrompt,
  buildNextChapterTextPrompt,
} from "@/server/story-generation/prompts";
import {
  applyChoiceResponseSchema,
  chapterTextSchema,
  initialStoryResponseSchema,
  nextChapterResponseSchema,
  type ApplyChoiceResponsePayload,
  type InitialStoryResponsePayload,
  type NextChapterResponsePayload,
} from "@/server/story-generation/schemas";
import type {
  AppliedChoiceResult,
  ApplyChoiceRequest,
  GeneratedChapter,
  GeneratedChoice,
  GeneratedInitialStory,
  GenerateNextChapterRequest,
  InitialStoryRequest,
  StoryGenerationProvider,
} from "@/server/story-generation/types";

const PROMPT_VERSION_BASE = "openai-story-engine-v4";

type ResponseLike = {
  id: string;
  status: string | null;
  output_text: string;
  error?: {
    message?: string | null;
  } | null;
  incomplete_details?: unknown;
  output?: Array<{
    type: string;
    content?: Array<{
      type: string;
      refusal?: string;
    }>;
  }>;
  usage?: unknown;
  _request_id?: string | null;
};

type StructuredGenerationOptions<T> = {
  stage: StoryGenerationStage;
  schema: z.ZodType<T>;
  schemaName: string;
  instructions: string;
  userPrompt: string;
  userId?: string;
  storyId?: string;
  nextChapterNumber?: number;
  maxOutputTokens: number;
  promptVersion: string;
  model: string;
};

type TextGenerationOptions = {
  stage: StoryGenerationStage;
  instructions: string;
  userPrompt: string;
  userId?: string;
  storyId?: string;
  nextChapterNumber?: number;
  maxOutputTokens: number;
  promptVersion: string;
  model: string;
};

function toChoiceKey(chapterNumber: number, label: string, position: number) {
  return `ch${chapterNumber}-${position + 1}-${slugify(label).slice(0, 24)}`;
}

function mapChoices(
  chapterNumber: number,
  choices: Array<{ label: string; outcomeHint: string }>,
): GeneratedChoice[] {
  return choices.map((choice, index) => ({
    key: toChoiceKey(chapterNumber, choice.label, index),
    label: choice.label,
    outcomeHint: choice.outcomeHint,
  }));
}

function extractRequestId(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "requestID" in error &&
    typeof error.requestID === "string"
  ) {
    return error.requestID;
  }

  return null;
}

function extractRefusal(response: ResponseLike) {
  for (const item of response.output ?? []) {
    if (item.type !== "message") {
      continue;
    }

    for (const content of item.content ?? []) {
      if (content.type === "refusal" && content.refusal) {
        return content.refusal;
      }
    }
  }

  return null;
}

function truncateForLog(value: string, limit = 800) {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit)}...`;
}

function isRetryableStructuredError(error: unknown) {
  return (
    error instanceof SyntaxError ||
    error instanceof z.ZodError ||
    (error instanceof Error &&
      /JSON|parse|Unexpected end|Unterminated string/i.test(error.message))
  );
}

function isRetryableTextError(error: unknown) {
  return (
    error instanceof z.ZodError ||
    (error instanceof Error &&
      /at least six paragraphs|min|too_small|too_big/i.test(error.message))
  );
}

async function requestStructuredResponse<T>({
  schema,
  schemaName,
  instructions,
  userPrompt,
  maxOutputTokens,
  model,
  temperature,
}: {
  schema: z.ZodType<T>;
  schemaName: string;
  instructions: string;
  userPrompt: string;
  maxOutputTokens: number;
  model: string;
  temperature: number;
}) {
  const client = getOpenAIClient();

  return (await client.responses.create({
    model,
    instructions,
    input: userPrompt,
    store: false,
    temperature,
    truncation: "disabled",
    max_output_tokens: maxOutputTokens,
    text: {
      format: zodTextFormat(schema, schemaName),
    },
  })) as ResponseLike;
}

async function requestTextResponse({
  instructions,
  userPrompt,
  maxOutputTokens,
  model,
  temperature,
}: {
  instructions: string;
  userPrompt: string;
  maxOutputTokens: number;
  model: string;
  temperature: number;
}) {
  const client = getOpenAIClient();

  return (await client.responses.create({
    model,
    instructions,
    input: userPrompt,
    store: false,
    temperature,
    truncation: "disabled",
    max_output_tokens: maxOutputTokens,
  })) as ResponseLike;
}

function ensureCompletedResponse(
  response: ResponseLike,
  context: {
    stage: StoryGenerationStage;
    promptVersion: string;
    model: string;
    userId?: string;
    storyId?: string;
    nextChapterNumber?: number;
    startedAt: number;
    details?: unknown;
  },
) {
  const requestId = response._request_id ?? null;
  const refusal = extractRefusal(response);

  if (response.error) {
    logStoryGeneration("error", {
      provider: "openai",
      stage: context.stage,
      model: context.model,
      promptVersion: context.promptVersion,
      requestId,
      responseId: response.id,
      durationMs: Date.now() - context.startedAt,
      userId: context.userId,
      storyId: context.storyId,
      nextChapterNumber: context.nextChapterNumber,
      reason: "response_error",
      details: {
        context: context.details,
        error: response.error,
      },
    });

    throw new StoryGenerationError(
      getStoryGenerationFailureMessage(context.stage),
      {
        stage: context.stage,
        provider: "openai",
        requestId,
      },
    );
  }

  if (response.status !== "completed") {
    logStoryGeneration("error", {
      provider: "openai",
      stage: context.stage,
      model: context.model,
      promptVersion: context.promptVersion,
      requestId,
      responseId: response.id,
      durationMs: Date.now() - context.startedAt,
      userId: context.userId,
      storyId: context.storyId,
      nextChapterNumber: context.nextChapterNumber,
      reason: "response_incomplete",
      details: {
        context: context.details,
        status: response.status,
        incompleteDetails: response.incomplete_details,
      },
    });

    throw new StoryGenerationError(
      getStoryGenerationFailureMessage(context.stage),
      {
        stage: context.stage,
        provider: "openai",
        requestId,
      },
    );
  }

  if (refusal) {
    logStoryGeneration("warn", {
      provider: "openai",
      stage: context.stage,
      model: context.model,
      promptVersion: context.promptVersion,
      requestId,
      responseId: response.id,
      durationMs: Date.now() - context.startedAt,
      userId: context.userId,
      storyId: context.storyId,
      nextChapterNumber: context.nextChapterNumber,
      reason: "model_refusal",
      details: refusal,
    });

    throw new StoryGenerationError(
      getStoryGenerationFailureMessage(context.stage),
      {
        stage: context.stage,
        provider: "openai",
        requestId,
      },
    );
  }

  return requestId;
}

async function generateStructuredOutput<T>({
  stage,
  schema,
  schemaName,
  instructions,
  userPrompt,
  userId,
  storyId,
  nextChapterNumber,
  maxOutputTokens,
  promptVersion,
  model,
}: StructuredGenerationOptions<T>): Promise<T> {
  const attempts = [
    { temperature: 0.35, maxOutputTokens },
    { temperature: 0.15, maxOutputTokens },
  ];
  let lastError: unknown = null;
  let lastRequestId: string | null = null;

  for (const [index, attempt] of attempts.entries()) {
    const startedAt = Date.now();
    let response: ResponseLike | null = null;

    logStoryGeneration("info", {
      provider: "openai",
      stage,
      model,
      promptVersion,
      userId,
      storyId,
      nextChapterNumber,
      reason: "request_started",
      details: {
        attempt: index + 1,
        temperature: attempt.temperature,
        mode: "structured",
      },
    });

    try {
      response = await requestStructuredResponse({
        schema,
        schemaName,
        instructions,
        userPrompt,
        maxOutputTokens: attempt.maxOutputTokens,
        model,
        temperature: attempt.temperature,
      });

      lastRequestId = ensureCompletedResponse(response, {
        stage,
        promptVersion,
        model,
        userId,
        storyId,
        nextChapterNumber,
        startedAt,
        details: {
          attempt: index + 1,
          temperature: attempt.temperature,
          mode: "structured",
        },
      });

      const parsed = schema.parse(JSON.parse(response.output_text));

      logStoryGeneration("info", {
        provider: "openai",
        stage,
        model,
        promptVersion,
        requestId: lastRequestId,
        responseId: response.id,
        durationMs: Date.now() - startedAt,
        userId,
        storyId,
        nextChapterNumber,
        usage: response.usage,
        reason: "request_completed",
        details: {
          attempt: index + 1,
          temperature: attempt.temperature,
          mode: "structured",
        },
      });

      return parsed;
    } catch (error) {
      if (error instanceof StoryGenerationError) {
        throw error;
      }

      lastError = error;
      const requestId =
        response?._request_id ?? extractRequestId(error) ?? lastRequestId;
      const retryable = isRetryableStructuredError(error);
      const isLastAttempt = index === attempts.length - 1;

      logStoryGeneration(
        isLastAttempt || !retryable ? "error" : "warn",
        {
          provider: "openai",
          stage,
          model,
          promptVersion,
          requestId,
          responseId: response?.id,
          durationMs: Date.now() - startedAt,
          userId,
          storyId,
          nextChapterNumber,
          reason:
            isLastAttempt || !retryable
              ? "request_failed"
              : "response_parse_retry",
          details: {
            attempt: index + 1,
            temperature: attempt.temperature,
            mode: "structured",
            error: getErrorMessage(error),
            rawOutputPreview: response?.output_text
              ? truncateForLog(response.output_text)
              : null,
          },
        },
        isLastAttempt || !retryable ? error : undefined,
      );

      if (!retryable || isLastAttempt) {
        throw new StoryGenerationError(
          getStoryGenerationFailureMessage(stage),
          {
            stage,
            provider: "openai",
            requestId,
            cause: error,
          },
        );
      }
    }
  }

  throw new StoryGenerationError(getStoryGenerationFailureMessage(stage), {
    stage,
    provider: "openai",
    requestId: lastRequestId,
    cause: lastError,
  });
}

async function generateTextOutput({
  stage,
  instructions,
  userPrompt,
  userId,
  storyId,
  nextChapterNumber,
  maxOutputTokens,
  promptVersion,
  model,
}: TextGenerationOptions): Promise<string> {
  const attempts = [
    { temperature: 0.7, maxOutputTokens },
    { temperature: 0.5, maxOutputTokens },
  ];
  let lastError: unknown = null;
  let lastRequestId: string | null = null;

  for (const [index, attempt] of attempts.entries()) {
    const startedAt = Date.now();
    let response: ResponseLike | null = null;

    logStoryGeneration("info", {
      provider: "openai",
      stage,
      model,
      promptVersion,
      userId,
      storyId,
      nextChapterNumber,
      reason: "request_started",
      details: {
        attempt: index + 1,
        temperature: attempt.temperature,
        mode: "plain_text",
      },
    });

    try {
      response = await requestTextResponse({
        instructions,
        userPrompt,
        maxOutputTokens: attempt.maxOutputTokens,
        model,
        temperature: attempt.temperature,
      });

      lastRequestId = ensureCompletedResponse(response, {
        stage,
        promptVersion,
        model,
        userId,
        storyId,
        nextChapterNumber,
        startedAt,
        details: {
          attempt: index + 1,
          temperature: attempt.temperature,
          mode: "plain_text",
        },
      });

      const text = chapterTextSchema.parse(response.output_text.trim());

      logStoryGeneration("info", {
        provider: "openai",
        stage,
        model,
        promptVersion,
        requestId: lastRequestId,
        responseId: response.id,
        durationMs: Date.now() - startedAt,
        userId,
        storyId,
        nextChapterNumber,
        usage: response.usage,
        reason: "request_completed",
        details: {
          attempt: index + 1,
          temperature: attempt.temperature,
          mode: "plain_text",
        },
      });

      return text;
    } catch (error) {
      if (error instanceof StoryGenerationError) {
        throw error;
      }

      lastError = error;
      const requestId =
        response?._request_id ?? extractRequestId(error) ?? lastRequestId;
      const retryable = isRetryableTextError(error);
      const isLastAttempt = index === attempts.length - 1;

      logStoryGeneration(
        isLastAttempt || !retryable ? "error" : "warn",
        {
          provider: "openai",
          stage,
          model,
          promptVersion,
          requestId,
          responseId: response?.id,
          durationMs: Date.now() - startedAt,
          userId,
          storyId,
          nextChapterNumber,
          reason:
            isLastAttempt || !retryable
              ? "request_failed"
              : "text_validation_retry",
          details: {
            attempt: index + 1,
            temperature: attempt.temperature,
            mode: "plain_text",
            error: getErrorMessage(error),
            outputLength: response?.output_text.length ?? 0,
            rawOutputPreview: response?.output_text
              ? truncateForLog(response.output_text)
              : null,
          },
        },
        isLastAttempt || !retryable ? error : undefined,
      );

      if (!retryable || isLastAttempt) {
        throw new StoryGenerationError(
          getStoryGenerationFailureMessage(stage),
          {
            stage,
            provider: "openai",
            requestId,
            cause: error,
          },
        );
      }
    }
  }

  throw new StoryGenerationError(getStoryGenerationFailureMessage(stage), {
    stage,
    provider: "openai",
    requestId: lastRequestId,
    cause: lastError,
  });
}

export class OpenAIStoryGenerationProvider implements StoryGenerationProvider {
  key = "openai" as const;
  promptVersion: string;
  private readonly model: string;

  constructor() {
    const env = getServerEnv();
    this.model = env.OPENAI_MODEL!;
    this.promptVersion = `${PROMPT_VERSION_BASE}:${this.model}`;
  }

  async generateInitialStory(
    input: InitialStoryRequest,
  ): Promise<GeneratedInitialStory> {
    const scaffoldPrompt = buildInitialStoryPrompt(input);
    const payload = await generateStructuredOutput<InitialStoryResponsePayload>(
      {
        stage: "initial_story",
        schema: initialStoryResponseSchema,
        schemaName: "fanstory_initial_story",
        instructions: scaffoldPrompt.instructions,
        userPrompt: scaffoldPrompt.userPrompt,
        userId: input.userId,
        maxOutputTokens: 2200,
        promptVersion: this.promptVersion,
        model: this.model,
      },
    );

    const chapterPrompt = buildInitialChapterTextPrompt({
      story: input,
      storyPlan: payload.storyPlan,
      initialState: payload.initialState,
      chapter: {
        title: payload.firstChapter.title,
        summary: payload.firstChapter.summary,
        sceneBeats: payload.firstChapter.sceneBeats,
        choices: payload.firstChapter.choices,
      },
    });
    const chapterText = await generateTextOutput({
      stage: "initial_story",
      instructions: chapterPrompt.instructions,
      userPrompt: chapterPrompt.userPrompt,
      userId: input.userId,
      maxOutputTokens: 3600,
      promptVersion: this.promptVersion,
      model: this.model,
    });

    return {
      title: input.title,
      synopsis: payload.synopsis,
      provider: "OPENAI",
      promptVersion: this.promptVersion,
      storyPlan: payload.storyPlan,
      initialState: payload.initialState,
      firstChapter: {
        title: payload.firstChapter.title,
        summary: payload.firstChapter.summary,
        text: chapterText,
        choices: mapChoices(1, payload.firstChapter.choices),
      },
    };
  }

  async applyChoice(input: ApplyChoiceRequest): Promise<AppliedChoiceResult> {
    const prompt = buildApplyChoicePrompt(input);
    const payload = await generateStructuredOutput<ApplyChoiceResponsePayload>({
      stage: "apply_choice",
      schema: applyChoiceResponseSchema,
      schemaName: "fanstory_apply_choice",
      instructions: prompt.instructions,
      userPrompt: prompt.userPrompt,
      maxOutputTokens: 1200,
      promptVersion: this.promptVersion,
      model: this.model,
    });

    return payload;
  }

  async generateNextChapter(
    input: GenerateNextChapterRequest,
  ): Promise<GeneratedChapter> {
    const scaffoldPrompt = buildNextChapterPrompt(input);
    const payload = await generateStructuredOutput<NextChapterResponsePayload>({
      stage: "next_chapter",
      schema: nextChapterResponseSchema,
      schemaName: "fanstory_next_chapter",
      instructions: scaffoldPrompt.instructions,
      userPrompt: scaffoldPrompt.userPrompt,
      nextChapterNumber: input.nextChapterNumber,
      maxOutputTokens: 1800,
      promptVersion: this.promptVersion,
      model: this.model,
    });

    const chapterPrompt = buildNextChapterTextPrompt({
      story: input.story,
      storyPlan: input.storyPlan,
      storyProgress: input.storyProgress,
      previousChapterSummary: input.previousChapterSummary,
      currentState: input.transition.updatedState,
      recentChapters: input.recentChapters,
      choiceHistory: input.choiceHistory,
      transition: input.transition,
      chapter: {
        title: payload.title,
        summary: payload.summary,
        sceneBeats: payload.sceneBeats,
        choices: payload.choices,
      },
    });
    const chapterText = await generateTextOutput({
      stage: "next_chapter",
      instructions: chapterPrompt.instructions,
      userPrompt: chapterPrompt.userPrompt,
      nextChapterNumber: input.nextChapterNumber,
      maxOutputTokens: 3600,
      promptVersion: this.promptVersion,
      model: this.model,
    });

    return {
      title: payload.title,
      summary: payload.summary,
      text: chapterText,
      choices: mapChoices(input.nextChapterNumber, payload.choices),
      provider: "OPENAI",
    };
  }
}
