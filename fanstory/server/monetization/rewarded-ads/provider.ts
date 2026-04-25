import "server-only";

import { getServerEnv } from "@/lib/env/server";
import { MockRewardedAdProvider } from "@/server/monetization/rewarded-ads/mock-provider";
import type {
  RewardedAdProvider,
  RewardedAdUiConfig,
} from "@/server/monetization/rewarded-ads/types";

export function getRewardedAdUiConfig(): RewardedAdUiConfig {
  const env = getServerEnv();
  const dailyLimit = env.REWARDED_AD_DAILY_LIMIT;

  if (env.REWARDED_AD_PROVIDER === "mock") {
    return {
      provider: "mock",
      dailyLimit,
    };
  }

  if (env.REWARDED_AD_PROVIDER === "yandex") {
    return {
      provider: "yandex",
      dailyLimit,
      desktopBlockId: env.YAN_REWARDED_DESKTOP_BLOCK_ID ?? "",
      mobileBlockId: env.YAN_REWARDED_MOBILE_BLOCK_ID ?? "",
    };
  }

  return {
    provider: "disabled",
    dailyLimit,
  };
}

export function getRewardedAdDailyLimit() {
  return getRewardedAdUiConfig().dailyLimit;
}

export function rewardedAdsEnabled() {
  return getRewardedAdUiConfig().provider !== "disabled";
}

export function getRewardedAdProvider(): RewardedAdProvider {
  const config = getRewardedAdUiConfig();

  if (config.provider === "mock") {
    return new MockRewardedAdProvider();
  }

  throw new Error(
    "Server-side rewarded ad verification is only available for the mock provider. Yandex rewarded ads use client-side callbacks with server-issued claim tokens.",
  );
}
