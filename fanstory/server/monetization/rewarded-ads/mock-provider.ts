import "server-only";

import type {
  RewardedAdGrantVerification,
  RewardedAdProvider,
  RewardedAdVerificationInput,
} from "@/server/monetization/rewarded-ads/types";

export class MockRewardedAdProvider implements RewardedAdProvider {
  readonly name = "MOCK" as const;

  async verifyGrant(
    input: RewardedAdVerificationInput,
  ): Promise<RewardedAdGrantVerification> {
    return {
      provider: this.name,
      verificationKey: `mock:${input.userId}:${input.placement}:${Date.now()}`,
      metadata: {
        placement: input.placement,
        mode: "mock-dev-flow",
      },
    };
  }
}
