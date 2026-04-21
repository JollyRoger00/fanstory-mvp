"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth/session";
import { purchaseChapterAccess } from "@/server/purchases/purchase.service";

export async function purchaseChapterAction(formData: FormData) {
  const user = await requireUser();
  const storyId = formData.get("storyId")?.toString();

  if (!storyId) {
    throw new Error("storyId is required");
  }

  await purchaseChapterAccess(user.id, {
    storyId,
    chapterNumber: formData.get("chapterNumber"),
  });

  revalidatePath("/dashboard");
  revalidatePath("/wallet");
  revalidatePath(`/stories/${storyId}`);
  revalidatePath(`/stories/${storyId}/read`);
}
