export const storyContentLanguages = ["en", "ru"] as const;

export type StoryContentLanguage = (typeof storyContentLanguages)[number];

export const defaultStoryContentLanguage: StoryContentLanguage = "en";
