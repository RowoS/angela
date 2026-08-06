import { createClient } from '@/lib/supabase/server'

export type ActivityLogRow = {
  id: string
  actorId: string | null // null on system/trigger-driven entries with no auth.uid()
  actorName: string | null // resolved from profiles; null when actorId is null or the lookup misses
  action: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown>
  createdAt: string
}

export type GetActivityLogFilters = {
  entityType?: string
  entityId?: string
  action?: string
  limit?: number
  before?: string // cursor: created_at of the last row already fetched
}

const DEFAULT_LIMIT = 25
const MAX_LIMIT = 200

export async function getActivityLog(
  filters: GetActivityLogFilters = {}
): Promise<ActivityLogRow[]> {
  const supabase = await createClient()
  const limit = Math.min(filters.limit ?? DEFAULT_LIMIT, MAX_LIMIT)

  let query = supabase
    .from('activity_log')
    .select('id, actor_id, action, entity_type, entity_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (filters.entityType) query = query.eq('entity_type', filters.entityType)
  if (filters.entityId) query = query.eq('entity_id', filters.entityId)
  if (filters.action) query = query.eq('action', filters.action)
  if (filters.before) query = query.lt('created_at', filters.before)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  const rows = data ?? []

  // Batched IN-lookup instead of an embedded `profiles(full_name)` select.
  // The embedded syntax depends on Supabase auto-discovering the FK by
  // name — one extra round trip here is cheaper than a silent break if
  // that relationship ever gets renamed.
  const actorIds = Array.from(
    new Set(rows.map((r) => r.actor_id).filter((id): id is string => id !== null))
  )

  const actorNames = new Map<string, string>()
  if (actorIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', actorIds)

    if (profilesError) throw new Error(profilesError.message)
    for (const p of profiles ?? []) {
      if (p.full_name) actorNames.set(p.id, p.full_name)
    }
  }

  return rows.map((row) => ({
    id: row.id,
    actorId: row.actor_id,
    actorName: row.actor_id ? actorNames.get(row.actor_id) ?? null : null,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata,
    createdAt: row.created_at,
  }))
}