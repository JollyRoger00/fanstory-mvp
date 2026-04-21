import "server-only";

import { getServerEnv } from "@/lib/env/server";
import { MockRewardedAdProvider } from "@/server/monetization/rewarded-ads/mock-provider";
import type { RewardedAdProvider } from "@/server/monetization/rewarded-ads/types";

export function rewardedAdDevFlowEnabled() {
  const env = getServerEnv();
  return env.NODE_ENV !== "production";
}

export function getRewardedAdProvider(): RewardedAdProvider {
  if (!rewardedAdDevFlowEnabled()) {
    throw new Error(
      "Rewarded ads are not configured for production yet. Add a real ad verification provider before enabling this flow.",
    );
  }

  return new MockRewardedAdProvider();
}
