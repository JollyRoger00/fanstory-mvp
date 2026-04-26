import "server-only";

import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { getServerEnv } from "@/lib/env/server";
import type { UserRole } from "@/lib/db/generated/client";

export type AdminAccessSource = "ROLE" | "ENV";

export type AdminActor = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  isAdmin: boolean;
  adminAccessSource: AdminAccessSource | null;
  canManageRoles: boolean;
};

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? null;
}

export function getConfiguredAdminEmails() {
  return new Set(
    getServerEnv()
      .ADMIN_EMAILS.split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function hasEnvAdminAccess(email: string | null | undefined) {
  const normalized = normalizeEmail(email);

  return normalized ? getConfiguredAdminEmails().has(normalized) : false;
}

export function resolveAdminAccess(input: {
  role: UserRole;
  email: string | null;
}) {
  if (input.role === "ADMIN") {
    return {
      isAdmin: true,
      adminAccessSource: "ROLE" as const,
      canManageRoles: true,
    };
  }

  if (hasEnvAdminAccess(input.email)) {
    return {
      isAdmin: true,
      adminAccessSource: "ENV" as const,
      canManageRoles: false,
    };
  }

  return {
    isAdmin: false,
    adminAccessSource: null,
    canManageRoles: false,
  };
}

export async function requireAdmin(): Promise<AdminActor> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const access = resolveAdminAccess({
    role: user.role,
    email: user.email,
  });

  if (!access.isAdmin) {
    notFound();
  }

  return {
    ...user,
    ...access,
  };
}
