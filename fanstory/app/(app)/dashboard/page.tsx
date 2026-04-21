import { DashboardOverview } from "@/features/profile/components/dashboard-overview";
import { getDashboardView } from "@/server/profile/dashboard.service";
import { requireUser } from "@/server/auth/session";

export default async function DashboardPage() {
  const user = await requireUser();
  const dashboard = await getDashboardView(user);

  return <DashboardOverview data={dashboard} />;
}
