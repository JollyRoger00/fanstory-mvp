import "server-only";

import { getServerEnv } from "@/lib/env/server";
import { MockStoryGenerationProvider } from "@/server/story-generation/mock-provider";
import { OpenAIStoryGenerationProvider } from "@/server/story-generation/openai-provider";
import type { StoryGenerationProvider } from "@/server/story-generation/types";

export function getStoryGenerationProvider(): StoryGenerationProvider {
  const env = getServerEnv();

  if (env.STORY_PROVIDER === "openai") {
    return new OpenAIStoryGenerationProvider();
  }

  return new MockStoryGenerationProvider();
}
