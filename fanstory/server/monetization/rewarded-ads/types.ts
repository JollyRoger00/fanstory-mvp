export type RewardedAdPlacement = "NEXT_CHAPTER";
export type RewardedAdProviderName = "MOCK" | "YAN";
export type RewardedAdUiProvider = "disabled" | "mock" | "yandex";

export type RewardedAdUiConfig =
  | {
      provider: "disabled";
      dailyLimit: number;
    }
  | {
      provider: "mock";
      dailyLimit: number;
    }
  | {
      provider: "yandex";
      dailyLimit: number;
      desktopBlockId: string;
      mobileBlockId: string;
    };

export type RewardedAdGrantVerification = {
  provider: RewardedAdProviderName;
  verificationKey: string;
  metadata: Record<string, unknown> | null;
};

export type RewardedAdVerificationInput = {
  userId: string;
  placement: RewardedAdPlacement;
};

export interface RewardedAdProvider {
  readonly name: RewardedAdProviderName;
  verifyGrant(
    input: RewardedAdVerificationInput,
  ): Promise<RewardedAdGrantVerification>;
}
