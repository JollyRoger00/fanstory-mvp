"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth/session";
import { createSave } from "@/server/saves/save.service";

export async function createSaveAction(formData: FormData) {
  const user = await requireUser();
  const storyId = formData.get("storyId")?.toString();

  if (!storyId) {
    throw new Error("storyId is required");
  }

  await createSave(user.id, {
    storyId,
    label: formData.get("label"),
  });

  revalidatePath("/dashboard");
  revalidatePath("/saves");
  revalidatePath(`/stories/${storyId}`);
  revalidatePath(`/stories/${storyId}/read`);
}
