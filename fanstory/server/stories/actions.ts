"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createStory, advanceStory } from "@/server/stories/story.service";
import { requireUser } from "@/server/auth/session";

export async function createStoryAction(formData: FormData) {
  const user = await requireUser();

  const story = await createStory(user.id, {
    title: formData.get("title"),
    synopsis: formData.get("synopsis"),
    universe: formData.get("universe"),
    protagonist: formData.get("protagonist"),
    theme: formData.get("theme"),
    genre: formData.get("genre"),
    tone: formData.get("tone"),
  });

  revalidatePath("/dashboard");
  revalidatePath("/stories");
  redirect(`/stories/${story.id}`);
}

export async function chooseStoryPathAction(formData: FormData) {
  const user = await requireUser();
  const storyId = formData.get("storyId")?.toString();

  if (!storyId) {
    throw new Error("storyId is required");
  }

  await advanceStory(user.id, {
    storyId,
    choiceId: formData.get("choiceId"),
  });

  revalidatePath("/dashboard");
  revalidatePath("/stories");
  revalidatePath(`/stories/${storyId}`);
  revalidatePath(`/stories/${storyId}/read`);
  redirect(`/stories/${storyId}/read`);
}
