import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureUserMonetizationBootstrap } from "@/server/monetization/entitlement.service";
import { createRewardedAdSession } from "@/server/monetization/rewarded-ads/session.service";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await ensureUserMonetizationBootstrap(session.user.id);

    const result = await createRewardedAdSession({
      userId: session.user.id,
      placement: "NEXT_CHAPTER",
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start rewarded ad session.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
