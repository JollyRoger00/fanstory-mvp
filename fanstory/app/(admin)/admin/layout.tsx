import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { requireAdmin } from "@/server/admin/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <AdminShell
      user={{
        name: admin.name,
        email: admin.email,
        image: admin.image,
        accessSource: admin.adminAccessSource,
      }}
    >
      {children}
    </AdminShell>
  );
}
