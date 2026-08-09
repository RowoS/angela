'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActivityLogRow, StaffRole } from '@/lib/types/activity'
import { ENTITY_TYPES_FOR_ROLE } from '@/lib/activity-format'

export type GetActivityLogFilters = {
  entityType?: string
  action?: string
  actorId?: string
  search?: string
  limit?: number
  before?: string // cursor: created_at of the last row already fetched
}

const DEFAULT_LIMIT = 25
const MAX_LIMIT = 200

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

async function getCallerRole(supabase: SupabaseServerClient): Promise<StaffRole> {
  const { data, error } = await supabase.rpc('get_caller_role')
  if (error || !data) throw new Error('Could not resolve caller role')
  return data as StaffRole
}

export async function getActivityLog(filters: GetActivityLogFilters = {}): Promise<ActivityLogRow[]> {
  const supabase = await createClient()
  const role = await getCallerRole(supabase)
  const allowedEntities = ENTITY_TYPES_FOR_ROLE[role]

  // Managers (or any future role with no allowlist) get nothing — the page
  // itself also redirects them, this is defense in depth, not the primary gate.
  if (allowedEntities.length === 0) return []

  const limit = Math.min(filters.limit ?? DEFAULT_LIMIT, MAX_LIMIT)

  let query = supabase
    .from('activity_log_detailed')
    .select('id, actor_id, actor_name, actor_role, action, entity_type, entity_id, subject, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  // Never trust the client's entityType — an agent hand-crafting
  // entityType=sla in a request should still get nothing back.
  const entityTypeFilter =
    filters.entityType && allowedEntities.includes(filters.entityType) ? [filters.entityType] : allowedEntities
  query = query.in('entity_type', entityTypeFilter)

  if (filters.action) query = query.eq('action', filters.action)
  if (filters.actorId) query = query.eq('actor_id', filters.actorId)
  if (filters.before) query = query.lt('created_at', filters.before)

  if (filters.search) {
    const escaped = filters.search.replace(/[%_]/g, (c) => `\\${c}`)
    query = query.or(`actor_name.ilike.%${escaped}%,subject.ilike.%${escaped}%,action.ilike.%${escaped}%`)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    id: row.id,
    actorId: row.actor_id,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    subject: row.subject,
    metadata: row.metadata,
    createdAt: row.created_at,
  }))
}

export async function getActivityActors(): Promise<{ id: string; fullName: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('profiles').select('id, full_name').order('full_name')
  if (error) throw new Error(error.message)
  return (data ?? [])
    .filter((p): p is { id: string; full_name: string } => !!p.full_name)
    .map((p) => ({ id: p.id, fullName: p.full_name }))
}

export async function getCallerRoleAction(): Promise<StaffRole> {
  const supabase = await createClient()
  return getCallerRole(supabase)
}