import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

// cache() scopes memoization to a single request. The root (authenticated)
// layout and every nested guard layout can each call getCurrentUser() —
// Supabase only actually gets hit once per page load.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, password_reset_required")
    .eq("id", user.id)
    .single()

  return {
    ...user,
    role: profile?.role ?? null,
    name: profile?.full_name ?? user.email ?? "User",
    passwordResetRequired: profile?.password_reset_required ?? false

  }
})