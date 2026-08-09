import { describeActivity } from '@/lib/activity-format'
import type { ActivityLogRow } from '@/lib/types/activity'

export const ROLE_COLORS: Record<string, string> = { admin: '#818cf8', agent: '#34d399', manager: '#fb923c' }

export function getInitials(name: string) {
  const [first, second] = name.trim().split(/\s+/)
  return ((first?.[0] ?? '') + (second?.[0] ?? '')).toUpperCase() || '?'
}

export function toCsv(rows: ActivityLogRow[]) {
  const header = ['Timestamp', 'Actor', 'Action', 'Entity', 'Subject', 'Description']
  const lines = rows.map((r) =>
    [r.createdAt, r.actorName ?? 'System', r.action, r.entityType, r.subject ?? '', describeActivity(r)]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  )
  return [header.join(','), ...lines].join('\n')
}

export function groupLogsByDate(logs: ActivityLogRow[]) {
  const g: Record<string, ActivityLogRow[]> = {}
  for (const entry of logs) {
    const date = new Date(entry.createdAt).toLocaleDateString('en-US', { 
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
    })
    ;(g[date] ??= []).push(entry)
  }
  return g
}