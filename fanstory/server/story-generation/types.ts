import type { StoryContentLanguage } from "@/entities/story/language";
import type { CreateStoryInput } from "@/lib/validations/story";

export type StoryStateSnapshot = {
  summary: string;
  activeGoals: string[];
  unresolvedTensions: string[];
  knownFacts: string[];
};

export type StoryArcPhase = {
  name: string;
  chapterStart: number;
  chapterEnd: number;
  purpose: string;
};

export type StoryMajorTurn = {
  chapter: number;
  description: string;
};

export type StoryPlan = {
  targetChapterCount: number;
  storyPromise: string;
  centralQuestion: string;
  actBlueprint: StoryArcPhase[];
  majorTurns: StoryMajorTurn[];
  persistentThreads: string[];
  endingDirections: string[];
  choiceAxes: string[];
};

export type StoryProgressSnapshot = {
  chapterNumber: number;
  targetChapterCount: number;
  chaptersRemaining: number;
  completionPercent: number;
  currentPhase: string;
  phasePurpose: string;
  nextMajorTurn: string | null;
};

export type StoryChapterContext = {
  number: number;
  title: string;
  summary: string;
};

export type ChoiceHistoryEntry = {
  chapterNumber: number;
  selectedLabel: string;
  resolutionSummary: string;
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
  storyPlan?: StoryPlan;
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
  storyPlan: StoryPlan;
  storyProgress: StoryProgressSnapshot;
  currentState: StoryStateSnapshot;
  selectedChoice: GeneratedChoice;
  recentChapters: StoryChapterContext[];
  choiceHistory: ChoiceHistoryEntry[];
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
  storyPlan: StoryPlan;
  storyProgress: StoryProgressSnapshot;
  previousChapterSummary: string;
  recentChapters: StoryChapterContext[];
  choiceHistory: ChoiceHistoryEntry[];
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
