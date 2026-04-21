import "server-only";

import OpenAI from "openai";
import { getServerEnv } from "@/lib/env/server";

let openAIClient: OpenAI | null = null;

export function getOpenAIClient() {
  if (openAIClient) {
    return openAIClient;
  }

  const env = getServerEnv();

  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required when STORY_PROVIDER=openai.");
  }

  openAIClient = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  return openAIClient;
}
