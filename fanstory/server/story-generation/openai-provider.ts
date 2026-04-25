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
  buildInitialStoryPrompt,
  buildNextChapterPrompt,
} from "@/server/story-generation/prompts";
import {
  applyChoiceResponseSchema,
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

const PROMPT_VERSION_BASE = "openai-story-engine-v3";

type ParsedResponseLike<T> = {
  id: string;
  status: string | null;
  error?: {
    message?: string | null;
  } | null;
  incomplete_details?: unknown;
  output_parsed: T | null;
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

function extractRefusal(response: ParsedResponseLike<unknown>) {
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
  const client = getOpenAIClient();
  const startedAt = Date.now();

  logStoryGeneration("info", {
    provider: "openai",
    stage,
    model,
    promptVersion,
    userId,
    storyId,
    nextChapterNumber,
    reason: "request_started",
  });

  try {
    const response = (await client.responses.parse({
      model,
      instructions,
      input: userPrompt,
      store: false,
      temperature: 0.8,
      truncation: "disabled",
      max_output_tokens: maxOutputTokens,
      text: {
        format: zodTextFormat(schema, schemaName),
      },
    })) as ParsedResponseLike<T>;

    const requestId = response._request_id ?? null;
    const refusal = extractRefusal(response);

    if (response.error) {
      logStoryGeneration("error", {
        provider: "openai",
        stage,
        model,
        promptVersion,
        requestId,
        responseId: response.id,
        durationMs: Date.now() - startedAt,
        userId,
        storyId,
        nextChapterNumber,
        reason: "response_error",
        details: response.error,
      });

      throw new StoryGenerationError(getStoryGenerationFailureMessage(stage), {
        stage,
        provider: "openai",
        requestId,
      });
    }

    if (response.status !== "completed") {
      logStoryGeneration("error", {
        provider: "openai",
        stage,
        model,
        promptVersion,
        requestId,
        responseId: response.id,
        durationMs: Date.now() - startedAt,
        userId,
        storyId,
        nextChapterNumber,
        reason: "response_incomplete",
        details: {
          status: response.status,
          incompleteDetails: response.incomplete_details,
        },
      });

      throw new StoryGenerationError(getStoryGenerationFailureMessage(stage), {
        stage,
        provider: "openai",
        requestId,
      });
    }

    if (refusal) {
      logStoryGeneration("warn", {
        provider: "openai",
        stage,
        model,
        promptVersion,
        requestId,
        responseId: response.id,
        durationMs: Date.now() - startedAt,
        userId,
        storyId,
        nextChapterNumber,
        reason: "model_refusal",
        details: refusal,
      });

      throw new StoryGenerationError(getStoryGenerationFailureMessage(stage), {
        stage,
        provider: "openai",
        requestId,
      });
    }

    if (!response.output_parsed) {
      logStoryGeneration("error", {
        provider: "openai",
        stage,
        model,
        promptVersion,
        requestId,
        responseId: response.id,
        durationMs: Date.now() - startedAt,
        userId,
        storyId,
        nextChapterNumber,
        reason: "missing_parsed_output",
      });

      throw new StoryGenerationError(getStoryGenerationFailureMessage(stage), {
        stage,
        provider: "openai",
        requestId,
      });
    }

    const parsed = schema.parse(response.output_parsed);

    logStoryGeneration("info", {
      provider: "openai",
      stage,
      model,
      promptVersion,
      requestId,
      responseId: response.id,
      durationMs: Date.now() - startedAt,
      userId,
      storyId,
      nextChapterNumber,
      usage: response.usage,
      reason: "request_completed",
    });

    return parsed;
  } catch (error) {
    if (error instanceof StoryGenerationError) {
      throw error;
    }

    const requestId = extractRequestId(error);

    logStoryGeneration(
      "error",
      {
        provider: "openai",
        stage,
        model,
        promptVersion,
        requestId,
        durationMs: Date.now() - startedAt,
        userId,
        storyId,
        nextChapterNumber,
        reason: "request_failed",
        details: getErrorMessage(error),
      },
      error,
    );

    throw new StoryGenerationError(getStoryGenerationFailureMessage(stage), {
      stage,
      provider: "openai",
      requestId,
      cause: error,
    });
  }
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
    const prompt = buildInitialStoryPrompt(input);
    const payload = await generateStructuredOutput<InitialStoryResponsePayload>(
      {
        stage: "initial_story",
        schema: initialStoryResponseSchema,
        schemaName: "fanstory_initial_story",
        instructions: prompt.instructions,
        userPrompt: prompt.userPrompt,
        userId: input.userId,
        maxOutputTokens: 4600,
        promptVersion: this.promptVersion,
        model: this.model,
      },
    );

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
        text: payload.firstChapter.text,
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
      maxOutputTokens: 1400,
      promptVersion: this.promptVersion,
      model: this.model,
    });

    return payload;
  }

  async generateNextChapter(
    input: GenerateNextChapterRequest,
  ): Promise<GeneratedChapter> {
    const prompt = buildNextChapterPrompt(input);
    const payload = await generateStructuredOutput<NextChapterResponsePayload>({
      stage: "next_chapter",
      schema: nextChapterResponseSchema,
      schemaName: "fanstory_next_chapter",
      instructions: prompt.instructions,
      userPrompt: prompt.userPrompt,
      nextChapterNumber: input.nextChapterNumber,
      maxOutputTokens: 4600,
      promptVersion: this.promptVersion,
      model: this.model,
    });

    return {
      title: payload.title,
      summary: payload.summary,
      text: payload.text,
      choices: mapChoices(input.nextChapterNumber, payload.choices),
      provider: "OPENAI",
    };
  }
}
