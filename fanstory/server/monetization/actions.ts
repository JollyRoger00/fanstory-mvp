"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth/session";
import { claimRewardedAdChapter } from "@/server/monetization/rewarded-ad.service";

function revalidateMonetizationViews(storyId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/wallet");
  revalidatePath("/subscriptions");
  revalidatePath("/stories");

  if (!storyId) {
    return;
  }

  revalidatePath(`/stories/${storyId}`);
  revalidatePath(`/stories/${storyId}/read`);
}

export async function claimRewardedAdChapterAction(formData: FormData) {
  const user = await requireUser();
  const storyId = formData.get("storyId")?.toString();

  await claimRewardedAdChapter(user.id);

  revalidateMonetizationViews(storyId);
}
