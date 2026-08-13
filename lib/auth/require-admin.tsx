import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";

/**
 * Server-only guard for admin-gated routes. Redirects to /login if
 * unauthenticated, /unauthorized if authenticated but not an admin.
 *
 * This is distinct from `requireRole` in role-actions.ts: that one is
 * defense-in-depth for code paths that bypass RLS on their own
 * (service-role calls, security-definer RPCs) and throws. This one
 * gates page rendering and redirects — it exists so a non-admin never
 * sees the settings shell in the first place, even though RLS would
 * reject their writes regardless.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/unauthorized");
  }

  return user;
}