import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/session"
import { ROLE_MENUS } from "@/lib/types/sidebar"
import { Role } from "@/lib/types/dashboard"

/**
 * Call at the top of a nested layout.tsx to restrict everything under it
 * to a specific set of roles. Assumes the parent (authenticated) layout
 * has already confirmed the user is logged in — this only re-checks role,
 * not session, since getCurrentUser() is request-deduped via React cache()
 * and won't re-hit Supabase.
 */
export async function requireRole(allowed: Role[]) {
  const user = await getCurrentUser()

  // Belt-and-suspenders: should already be caught by the parent layout,
  // but a guard shouldn't assume it's always mounted under one.
  if (!user) redirect("/login")
  if (!user.role) redirect("/login?error=no-profile")

  if (!allowed.includes(user.role as Role)) {
    // No prior page to "return" to on a fresh URL hit — send them to
    // their own first allowed menu item instead of a guess.
    const fallback = ROLE_MENUS[user.role as Role]?.[0]?.href ?? "/dashboard"
    redirect(fallback)
  }

  return user
}