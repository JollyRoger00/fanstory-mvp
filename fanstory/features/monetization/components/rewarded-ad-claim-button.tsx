"use client";

import { PlayCircle } from "lucide-react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type RewardedAdClaimButtonProps = {
  provider: "disabled" | "mock" | "yandex";
  desktopBlockId?: string | null;
  mobileBlockId?: string | null;
  label: string;
  pendingLabel: string;
  successMessage: string;
  incompleteMessage: string;
  unavailableMessage: string;
  loaderErrorMessage: string;
  storyId?: string;
  className?: string;
};

type RewardedAdSessionResponse = {
  token: string;
};

type YandexRewardedPlatform = "desktop" | "touch";

type YandexRewardedError = {
  type?: string;
  code?: string;
  text?: string;
};

type YandexRewardedManager = {
  getPlatform?: () => string;
  render: (config: {
    blockId: string;
    type: "rewarded";
    platform: YandexRewardedPlatform;
    onRewarded: (isRewarded: boolean) => void | Promise<void>;
    onError?: (data: YandexRewardedError) => void;
  }) => void;
};

declare global {
  interface Window {
    yaContextCb?: Array<() => void>;
    Ya?: {
      Context?: {
        AdvManager?: YandexRewardedManager;
      };
    };
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as
    | T
    | { error?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data && data.error
        ? data.error
        : "Request failed.",
    );
  }

  return data as T;
}

export function RewardedAdClaimButton({
  provider,
  desktopBlockId,
  mobileBlockId,
  label,
  pendingLabel,
  successMessage,
  incompleteMessage,
  unavailableMessage,
  loaderErrorMessage,
  className,
}: RewardedAdClaimButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function requestSessionToken() {
    const response = await fetch("/api/rewarded-ads/session", {
      method: "POST",
    });

    return parseJson<RewardedAdSessionResponse>(response);
  }

  async function claimToken(token: string) {
    const response = await fetch("/api/rewarded-ads/claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    return parseJson<{ ok: true }>(response);
  }

  async function runYandexRewardedFlow(token: string) {
    const queue = window.yaContextCb ?? (window.yaContextCb = []);

    return new Promise<void>((resolve, reject) => {
      let settled = false;
      const timer = window.setTimeout(() => {
        if (settled) {
          return;
        }

        settled = true;
        reject(new Error(loaderErrorMessage));
      }, 10000);

      const finish = (callback: () => void) => {
        if (settled) {
          return;
        }

        settled = true;
        window.clearTimeout(timer);
        callback();
      };

      const renderAd = () => {
        const manager = window.Ya?.Context?.AdvManager;

        if (!manager) {
          finish(() => reject(new Error(loaderErrorMessage)));
          return;
        }

        const platform =
          manager.getPlatform?.() === "desktop" ? "desktop" : "touch";
        const blockId =
          platform === "desktop" ? desktopBlockId : mobileBlockId;

        if (!blockId) {
          finish(() => reject(new Error(unavailableMessage)));
          return;
        }

        try {
          manager.render({
            blockId,
            type: "rewarded",
            platform,
            onRewarded: async (isRewarded) => {
              if (!isRewarded) {
                finish(() => reject(new Error(incompleteMessage)));
                return;
              }

              try {
                await claimToken(token);
                finish(resolve);
              } catch (error) {
                finish(() =>
                  reject(
                    error instanceof Error
                      ? error
                      : new Error(unavailableMessage),
                  ),
                );
              }
            },
            onError: (error) => {
              finish(() =>
                reject(
                  new Error(error.text || error.code || unavailableMessage),
                ),
              );
            },
          });
        } catch (error) {
          finish(() =>
            reject(
              error instanceof Error
                ? error
                : new Error(unavailableMessage),
            ),
          );
        }
      };

      if (window.Ya?.Context?.AdvManager) {
        renderAd();
        return;
      }

      if (!queue) {
        finish(() => reject(new Error(loaderErrorMessage)));
        return;
      }

      queue.push(renderAd);
    });
  }

  async function handleClick() {
    if (pending || provider === "disabled") {
      return;
    }

    setPending(true);

    try {
      const session = await requestSessionToken();

      if (provider === "mock") {
        await claimToken(session.token);
      } else {
        await runYandexRewardedFlow(session.token);
      }

      toast.success(successMessage);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : unavailableMessage,
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={pending || provider === "disabled"}
      className={className}
    >
      <PlayCircle className="size-4" />
      {pending ? pendingLabel : label}
    </Button>
  );
}
