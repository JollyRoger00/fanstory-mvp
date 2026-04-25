import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ensureUserMonetizationBootstrap } from "@/server/monetization/entitlement.service";
import { claimRewardedAdSession } from "@/server/monetization/rewarded-ads/session.service";

type ClaimBody = {
  token?: string;
};

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: ClaimBody | null = null;

  try {
    body = (await request.json()) as ClaimBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid rewarded ad claim payload." },
      { status: 400 },
    );
  }

  if (!body?.token) {
    return NextResponse.json(
      { error: "Rewarded ad session token is required." },
      { status: 400 },
    );
  }

  try {
    await ensureUserMonetizationBootstrap(session.user.id);

    await claimRewardedAdSession({
      userId: session.user.id,
      token: body.token,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to claim rewarded ad chapter.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
