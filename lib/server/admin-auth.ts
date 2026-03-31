import { auth, clerkClient } from "@clerk/nextjs/server";

export type DashboardRole = "admin" | "staff" | "unknown";

function normalizeRole(role: string | null | undefined): DashboardRole {
  const normalized = role?.toLowerCase();

  if (!normalized) {
    return "unknown";
  }

  if (normalized.includes("admin")) {
    return "admin";
  }

  if (normalized.includes("staff")) {
    return "staff";
  }

  return "unknown";
}

export async function getCurrentDashboardRole(): Promise<DashboardRole> {
  const { userId, orgId } = await auth();

  if (!userId) {
    return "unknown";
  }

  const client = await clerkClient();
  const memberships = await client.users.getOrganizationMembershipList({
    userId,
  });

  if (!memberships.data.length) {
    return "unknown";
  }

  const activeMembership = orgId
    ? memberships.data.find(
        (membership) => membership.organization.id === orgId,
      )
    : memberships.data[0];

  return normalizeRole(activeMembership?.role);
}
