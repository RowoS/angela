import type { StaffRole } from './types/activity'

type ActivityLike = {
  action: string
  actorName: string | null
  subject: string | null
  metadata: Record<string, unknown>
}

export type ActionMeta = { label: string; color: string; bg: string; icon: string }

export const ACTION_META: Record<string, ActionMeta> = {
  'ticket.draft_created':        { label: 'Ticket Created',          color: '#2563eb', bg: '#eff6ff', icon: '🎫' },
  'ticket.verified':             { label: 'Ticket Verified',         color: '#4f46e5', bg: '#eef2ff', icon: '📲' },
  'ticket.status_changed':       { label: 'Status Changed',          color: '#7c3aed', bg: '#f5f3ff', icon: '🔄' },
  'ticket.assigned':             { label: 'Ticket Assigned',         color: '#0891b2', bg: '#ecfeff', icon: '👤' },
  'ticket.deleted':               { label: 'Ticket Deleted',          color: '#dc2626', bg: '#fef2f2', icon: '🗑️' },
  'sla.created':                  { label: 'SLA Created',             color: '#16a34a', bg: '#f0fdf4', icon: '⏱' },
  'sla.updated':                  { label: 'SLA Updated',             color: '#d97706', bg: '#fffbeb', icon: '⏱' },
  'room_reservation.created':      { label: 'Room Reserved',           color: '#d97706', bg: '#fffbeb', icon: '🚪' },
  'room_reservation.cancelled':    { label: 'Reservation Cancelled',   color: '#dc2626', bg: '#fef2f2', icon: '❌' },
  'room_reservation.reactivated':  { label: 'Reservation Reactivated', color: '#16a34a', bg: '#f0fdf4', icon: '🚪' },
  'room_reservation.updated':      { label: 'Reservation Updated',     color: '#0891b2', bg: '#ecfeff', icon: '✏️' },
  'room_reservation.deleted':      { label: 'Reservation Deleted',     color: '#dc2626', bg: '#fef2f2', icon: '🗑️' },
  'conference_room.created':       { label: 'Room Added',              color: '#16a34a', bg: '#f0fdf4', icon: '🏢' },
  'conference_room.updated':       { label: 'Room Updated',            color: '#0891b2', bg: '#ecfeff', icon: '🏢' },
}

const DEFAULT_META: ActionMeta = { label: 'Activity', color: '#64748b', bg: '#f1f5f9', icon: '•' }
export function metaFor(action: string): ActionMeta {
  return ACTION_META[action] ?? DEFAULT_META
}

export const ACTIVITY_ACTIONS = Object.entries(ACTION_META).map(([value, m]) => ({ value, label: m.label }))

export const ENTITY_TYPES: { value: string; label: string }[] = [
  { value: 'ticket', label: 'Tickets' },
  { value: 'room_reservation', label: 'Room Reservations' },
  { value: 'conference_room', label: 'Conference Rooms' },
  { value: 'sla', label: 'SLAs' },
]

// SLA policy is an admin-only surface (slas_manage_admin) and conference
// room CRUD is admin-only (conference_rooms_manage_admin) — agents don't
// act on either, so they're excluded from an agent's view of the log
// rather than just being unfilterable noise.
export const ENTITY_TYPES_FOR_ROLE: Record<StaffRole, string[]> = {
  admin: ['ticket', 'room_reservation', 'conference_room', 'sla'],
  agent: ['ticket', 'room_reservation'],
  manager: [], // this page is admin/agent only — kept for type completeness
}

export const FILTER_GROUPS: { label: string; entityType: string }[] = [
  { label: 'Tickets', entityType: 'ticket' },
  { label: 'Rooms', entityType: 'room_reservation' },
  { label: 'Conference Rooms', entityType: 'conference_room' },
  { label: 'SLA', entityType: 'sla' },
]

export function entityTypesFor(role: StaffRole) {
  return ENTITY_TYPES.filter((t) => ENTITY_TYPES_FOR_ROLE[role].includes(t.value))
}

export function actionsFor(entityType: string, role: StaffRole) {
  const allowed = ENTITY_TYPES_FOR_ROLE[role]
  const pool = ACTIVITY_ACTIONS.filter((a) => allowed.some((e) => a.value.startsWith(`${e}.`)))
  return entityType ? pool.filter((a) => a.value.startsWith(`${entityType}.`)) : pool
}

export function describeActivity(a: ActivityLike): string {
  const who = a.actorName ?? 'System'
  switch (a.action) {
    case 'ticket.draft_created':
      return `${who} created a ticket${a.subject ? ` (${a.subject})` : ''}`
    case 'ticket.verified':
      return `${who} verified a ticket${a.subject ? ` (${a.subject})` : ''}`
    case 'ticket.status_changed':
      return `${who} changed a ticket's status (${a.metadata.from_status} → ${a.metadata.to_status})${a.subject ? ` — ${a.subject}` : ''}`
    case 'ticket.assigned':
      return `${who} assigned a ticket via ${a.metadata.method}${a.subject ? ` (${a.subject})` : ''}`
    case 'ticket.deleted':
      return `${who} deleted a ticket${a.subject ? ` (${a.subject})` : ''}`
    case 'sla.created':
    case 'sla.updated':
      return `${who} updated the ${a.metadata.priority} priority SLA`
    case 'room_reservation.created':
      return a.metadata.attached_to_event_id
        ? `${who} reserved a room for "${a.metadata.title}" and attached it to an existing event`
        : `${who} reserved a room for "${a.metadata.title}"`
    case 'room_reservation.cancelled':
      return `${who} cancelled a room reservation${a.subject ? ` (${a.subject})` : ''}`
    case 'room_reservation.reactivated':
      return `${who} reactivated a room reservation${a.subject ? ` (${a.subject})` : ''}`
    case 'room_reservation.updated': {
      const to = a.metadata.to as { title?: string } | undefined
      return `${who} updated a room reservation${to?.title ? ` (${to.title})` : ''}`
    }
    case 'room_reservation.deleted':
      return `${who} deleted a room reservation for "${a.metadata.title}"`
    case 'conference_room.created':
      return `${who} added a conference room (${a.metadata.name})`
    case 'conference_room.updated':
      return a.metadata.is_active === false
        ? `${who} deactivated a conference room (${a.metadata.name})`
        : `${who} updated a conference room (${a.metadata.name})`
    default:
      return `${who} — ${a.action}`
  }
}