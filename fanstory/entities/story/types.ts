import type { NextChapterAccessView } from "@/entities/monetization/types";
import type { StoryContentLanguage } from "@/entities/story/language";

export type StoryListItem = {
  id: string;
  slug: string;
  title: string;
  synopsis: string | null;
  universe: string;
  genre: string;
  tone: string;
  contentLanguage: StoryContentLanguage;
  status: string;
  chapterCount: number;
  currentChapterNumber: number;
  createdAt: Date;
  updatedAt: Date;
};

export type StoryAccessState = NextChapterAccessView;

export type StoryChoiceView = {
  id: string;
  key: string;
  label: string;
  outcomeHint: string | null;
};

export type StoryChapterView = {
  id: string;
  number: number;
  title: string;
  summary: string;
  content: string;
  createdAt: Date;
  choices: StoryChoiceView[];
};

export type StoryDecisionView = {
  id: string;
  chapterNumber: number;
  selectedLabel: string;
  resolutionSummary: string;
  createdAt: Date;
};

export type StoryDetailView = {
  id: string;
  title: string;
  slug: string;
  synopsis: string | null;
  universe: string;
  protagonist: string;
  theme: string;
  genre: string;
  tone: string;
  contentLanguage: StoryContentLanguage;
  status: string;
  currentChapterNumber: number;
  currentStateSummary: string;
  activeGoals: string[];
  unresolvedTensions: string[];
  knownFacts: string[];
  chapters: StoryChapterView[];
  decisions: StoryDecisionView[];
  nextAccess: StoryAccessState;
};

export type ReaderView = {
  story: StoryDetailView;
  visibleChapters: StoryChapterView[];
  activeChapter: StoryChapterView;
  canContinue: boolean;
  nextAccess: StoryAccessState;
  saveCount: number;
};
