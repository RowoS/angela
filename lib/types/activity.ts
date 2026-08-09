export type StaffRole = 'agent' | 'admin' | 'manager'

export type ActivityLogRow = {
  id: string
  actorId: string | null       // null on system/trigger-driven entries with no auth.uid()
  actorName: string | null     // resolved from profiles; null when actorId is null or the lookup misses
  actorRole: StaffRole | null  // null alongside actorId
  action: string
  entityType: string
  entityId: string
  subject: string | null       // "IT-2026-00042 — Login issue", a room name, an SLA name…; null if the source row no longer resolves
  metadata: Record<string, unknown>
  createdAt: string
}