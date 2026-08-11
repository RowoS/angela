import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'
 
/**
 * Service-role Supabase client. Bypasses RLS entirely — this is exactly
 * the case role-actions.ts's `requireRole` doc comment calls out:
 * "anything using the service_role key" needs its own authorization
 * check, because RLS isn't in the loop to catch a missing one.
 *
 * Only import this from 'use server' action files, and only after
 * calling requireRole(supabase, userId, ['admin']) with the normal
 * session-bound client first. Never import it into client components —
 * SUPABASE_SERVICE_ROLE_KEY must never reach the browser bundle.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
 
  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'The service-role key is only available server-side — confirm it is set in your deployment env, not just .env.local.'
    )
  }
 
  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
