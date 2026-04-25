import type { ReactNode } from "react";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { getCurrentUser } from "@/server/auth/session";

export default async function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader isAuthenticated={Boolean(user)} />
      <div className="flex-1">{children}</div>
      <MarketingFooter />
    </div>
  );
}
