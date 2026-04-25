import "server-only";

import {
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { getServerEnv } from "@/lib/env/server";
import type {
  RewardedAdPlacement,
  RewardedAdProviderName,
} from "@/server/monetization/rewarded-ads/types";

type RewardedAdSessionPayload = {
  jti: string;
  userId: string;
  placement: RewardedAdPlacement;
  provider: RewardedAdProviderName;
  iat: number;
  exp: number;
};

function getSigningSecret() {
  return getServerEnv().AUTH_SECRET;
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSigningSecret())
    .update(value)
    .digest("base64url");
}

function verifySignature(value: string, signature: string) {
  const expected = sign(value);
  const actualBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

export function issueRewardedAdSessionToken(input: {
  userId: string;
  placement: RewardedAdPlacement;
  provider: RewardedAdProviderName;
  expiresInSeconds?: number;
}) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresInSeconds = input.expiresInSeconds ?? 10 * 60;
  const payload: RewardedAdSessionPayload = {
    jti: randomUUID(),
    userId: input.userId,
    placement: input.placement,
    provider: input.provider,
    iat: issuedAt,
    exp: issuedAt + expiresInSeconds,
  };
  const encodedPayload = encode(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyRewardedAdSessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    throw new Error("Invalid rewarded ad session token.");
  }

  if (!verifySignature(encodedPayload, signature)) {
    throw new Error("Rewarded ad session token signature is invalid.");
  }

  const payload = JSON.parse(
    decode(encodedPayload),
  ) as RewardedAdSessionPayload;

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Rewarded ad session token has expired.");
  }

  return payload;
}
