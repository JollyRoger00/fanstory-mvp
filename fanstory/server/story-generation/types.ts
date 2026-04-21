import type { StoryContentLanguage } from "@/entities/story/language";
import type { CreateStoryInput } from "@/lib/validations/story";

export type StoryStateSnapshot = {
  summary: string;
  activeGoals: string[];
  unresolvedTensions: string[];
  knownFacts: string[];
};

export type GeneratedChoice = {
  key: string;
  label: string;
  outcomeHint?: string;
};

export type StoryGenerationContext = {
  title: string;
  synopsis: string | null;
  universe: string;
  protagonist: string;
  theme: string;
  genre: string;
  tone: string;
  contentLanguage: StoryContentLanguage;
};

export type InitialStoryRequest = CreateStoryInput & {
  userId: string;
};

export type GeneratedInitialStory = {
  title: string;
  synopsis: string;
  provider: "MOCK" | "OPENAI";
  promptVersion: string;
  initialState: StoryStateSnapshot;
  firstChapter: {
    title: string;
    summary: string;
    text: string;
    choices: GeneratedChoice[];
  };
};

export type ApplyChoiceRequest = {
  story: StoryGenerationContext;
  currentChapterNumber: number;
  currentState: StoryStateSnapshot;
  selectedChoice: GeneratedChoice;
  choiceHistory: Array<{
    selectedLabel: string;
    resolutionSummary: string;
  }>;
};

export type AppliedChoiceResult = {
  resolutionSummary: string;
  updatedState: StoryStateSnapshot;
  nextBeat: string;
  moodShift: string;
};

export type GenerateNextChapterRequest = {
  story: StoryGenerationContext;
  nextChapterNumber: number;
  previousChapterSummary: string;
  transition: AppliedChoiceResult;
};

export type GeneratedChapter = {
  title: string;
  summary: string;
  text: string;
  choices: GeneratedChoice[];
  provider: "MOCK" | "OPENAI";
};

export interface StoryGenerationProvider {
  key: "mock" | "openai";
  promptVersion: string;
  generateInitialStory(
    input: InitialStoryRequest,
  ): Promise<GeneratedInitialStory>;
  applyChoice(input: ApplyChoiceRequest): Promise<AppliedChoiceResult>;
  generateNextChapter(
    input: GenerateNextChapterRequest,
  ): Promise<GeneratedChapter>;
}
