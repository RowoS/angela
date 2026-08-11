export type NotificationEvent =
  | 'ticket_created'
  | 'status_changed'
  | 'ticket_assigned'
  | 'comment_public'
  | 'comment_internal'
  | 'qr_confirmed'
  | 'qr_closed'
  | 'sla_warning'
  | 'sla_breached'
  | 'room_reservation_created'

export type NotificationSettingRow = {
  event_type: NotificationEvent
  in_app: boolean
}

// Display order/labels live here rather than in the DB — the enum only
// needs to be a stable identifier, the UI owns how it's presented.
export const NOTIFICATION_EVENT_LABELS: Record<NotificationEvent, string> = {
  ticket_created: 'Ticket created (QR confirmed)',
  status_changed: 'Status changed',
  ticket_assigned: 'Ticket assigned / reassigned',
  comment_public: 'New public comment',
  comment_internal: 'New internal note',
  qr_confirmed: 'Employee QR scan — ticket confirmed',
  qr_closed: 'Employee QR scan — ticket closed',
  sla_warning: 'SLA warning (approaching breach)',
  sla_breached: 'SLA breached',
  room_reservation_created: 'Room reservation created',
}

export const NOTIFICATION_EVENT_ORDER: NotificationEvent[] = [
  'ticket_created',
  'status_changed',
  'ticket_assigned',
  'comment_public',
  'comment_internal',
  'qr_confirmed',
  'qr_closed',
  'sla_warning',
  'sla_breached',
  'room_reservation_created',
]