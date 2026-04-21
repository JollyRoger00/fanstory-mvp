import "server-only";

import type { WalletOverview } from "@/entities/wallet/types";
import { getMonetizationOverview } from "@/server/monetization/overview.service";

export async function getWalletOverview(
  userId: string,
): Promise<WalletOverview> {
  return getMonetizationOverview(userId);
}
