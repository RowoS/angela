export type SlaState = 'none' | 'ok' | 'warning' | 'breached'

interface SlaInput {
  due_at: string | null
  first_response_due_at: string | null
  first_response_at: string | null
  resolved_at: string | null
  status: string
}

// Matches dashboard_ticket_counts' window exactly (see
// 20260730080138_remote_schema.sql) so the queue and dashboard
// never disagree on what counts as "approaching."
const WARNING_WINDOW_MS = 60 * 60 * 1000

export function getSlaState({
  due_at,
  first_response_due_at,
  first_response_at,
  resolved_at,
  status,
}: SlaInput): SlaState {
  if (status === 'resolved' || status === 'closed' || status === 'cancelled') {
    return 'none'
  }

  const now = Date.now()

  const firstResponseBreached =
    !first_response_at &&
    !!first_response_due_at &&
    new Date(first_response_due_at).getTime() <= now

  const resolutionBreached =
    !resolved_at && !!due_at && new Date(due_at).getTime() <= now

  if (firstResponseBreached || resolutionBreached) return 'breached'

  const firstResponseWarning =
    !first_response_at &&
    !!first_response_due_at &&
    new Date(first_response_due_at).getTime() - now <= WARNING_WINDOW_MS

  const resolutionWarning =
    !resolved_at && !!due_at && new Date(due_at).getTime() - now <= WARNING_WINDOW_MS

  return firstResponseWarning || resolutionWarning ? 'warning' : 'ok'
}