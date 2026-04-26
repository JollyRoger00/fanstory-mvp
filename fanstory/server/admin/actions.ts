"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  cancelAdminUserSubscription,
  grantAdminUserSubscription,
} from "@/server/admin/admin-subscriptions.service";
import { updateAdminUserRole } from "@/server/admin/admin-users.service";
import {
  adjustAdminUserChapterBalance,
  adjustAdminUserWalletCredits,
} from "@/server/admin/admin-wallet.service";

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function revalidateAdminUserPaths(userId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/audit");
}

export async function adjustAdminUserWalletCreditsAction(formData: FormData) {
  const userId = getRequiredString(formData, "userId");

  await adjustAdminUserWalletCredits({
    userId,
    amount: formData.get("amount"),
    reason: getRequiredString(formData, "reason"),
  });

  revalidateAdminUserPaths(userId);
  redirect(`/admin/users/${userId}`);
}

export async function adjustAdminUserChapterBalanceAction(formData: FormData) {
  const userId = getRequiredString(formData, "userId");

  await adjustAdminUserChapterBalance({
    userId,
    quantity: formData.get("quantity"),
    reason: getRequiredString(formData, "reason"),
  });

  revalidateAdminUserPaths(userId);
  redirect(`/admin/users/${userId}`);
}

export async function grantAdminUserSubscriptionAction(formData: FormData) {
  const userId = getRequiredString(formData, "userId");

  await grantAdminUserSubscription({
    userId,
    productId: getRequiredString(formData, "productId"),
    reason: getRequiredString(formData, "reason"),
  });

  revalidateAdminUserPaths(userId);
  redirect(`/admin/users/${userId}`);
}

export async function cancelAdminUserSubscriptionAction(formData: FormData) {
  const userId = getRequiredString(formData, "userId");

  await cancelAdminUserSubscription({
    userId,
    reason: getRequiredString(formData, "reason"),
  });

  revalidateAdminUserPaths(userId);
  redirect(`/admin/users/${userId}`);
}

export async function updateAdminUserRoleAction(formData: FormData) {
  const userId = getRequiredString(formData, "userId");

  await updateAdminUserRole({
    userId,
    role: getRequiredString(formData, "role"),
    reason: getRequiredString(formData, "reason"),
  });

  revalidateAdminUserPaths(userId);
  redirect(`/admin/users/${userId}`);
}
