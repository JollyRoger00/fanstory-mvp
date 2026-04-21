import "server-only";

import { getServerEnv } from "@/lib/env/server";
import { MockStoryGenerationProvider } from "@/server/story-generation/mock-provider";
import type {
  AppliedChoiceResult,
  ApplyChoiceRequest,
  GeneratedChapter,
  GeneratedInitialStory,
  GenerateNextChapterRequest,
  InitialStoryRequest,
  StoryGenerationProvider,
} from "@/server/story-generation/types";

class OpenAIStoryGenerationProviderPlaceholder implements StoryGenerationProvider {
  key = "openai" as const;
  promptVersion = "openai-placeholder-v1";

  async generateInitialStory(
    input: InitialStoryRequest,
  ): Promise<GeneratedInitialStory> {
    void input;
    throw new Error(
      "OpenAI provider is not implemented yet. Use STORY_PROVIDER=mock for now.",
    );
  }

  async applyChoice(input: ApplyChoiceRequest): Promise<AppliedChoiceResult> {
    void input;
    throw new Error(
      "OpenAI provider is not implemented yet. Use STORY_PROVIDER=mock for now.",
    );
  }

  async generateNextChapter(
    input: GenerateNextChapterRequest,
  ): Promise<GeneratedChapter> {
    void input;
    throw new Error(
      "OpenAI provider is not implemented yet. Use STORY_PROVIDER=mock for now.",
    );
  }
}

export function getStoryGenerationProvider(): StoryGenerationProvider {
  const env = getServerEnv();

  if (env.STORY_PROVIDER === "openai") {
    return new OpenAIStoryGenerationProviderPlaceholder();
  }

  return new MockStoryGenerationProvider();
}
