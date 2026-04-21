import { z } from "zod";

export const createStoryInputSchema = z.object({
  title: z.string().min(3).max(80),
  synopsis: z.string().min(20).max(300),
  universe: z.string().min(2).max(80),
  protagonist: z.string().min(2).max(80),
  theme: z.string().min(2).max(80),
  genre: z.string().min(2).max(40),
  tone: z.string().min(2).max(40),
});

export const chooseStoryPathSchema = z.object({
  storyId: z.string().min(1),
  choiceId: z.string().min(1),
});

export const purchaseChapterSchema = z.object({
  storyId: z.string().min(1),
  chapterNumber: z.coerce.number().int().gte(2),
});

export const createSaveSchema = z.object({
  storyId: z.string().min(1),
  label: z.string().min(2).max(60),
});

export type CreateStoryInput = z.infer<typeof createStoryInputSchema>;
