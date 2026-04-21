export type RewardedAdPlacement = "NEXT_CHAPTER";

export type RewardedAdGrantVerification = {
  provider: "MOCK";
  verificationKey: string;
  metadata: Record<string, unknown> | null;
};

export type RewardedAdVerificationInput = {
  userId: string;
  placement: RewardedAdPlacement;
};

export interface RewardedAdProvider {
  readonly name: "MOCK";
  verifyGrant(
    input: RewardedAdVerificationInput,
  ): Promise<RewardedAdGrantVerification>;
}
