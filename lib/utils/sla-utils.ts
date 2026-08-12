export type SlaPriority = 'low' | 'medium' | 'high' | 'critical'

export type SlaRow = {
  id: string
  name: string
  priority: SlaPriority
  first_response_minutes: number
  resolution_minutes: number
}

export type SlaState = 'none' | 'ok' | 'warning' | 'breached'

export interface SlaInput {
  due_at: string | null
  first_response_due_at: string | null
  first_response_at: string | null
  resolved_at: string | null
  status: string
}

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