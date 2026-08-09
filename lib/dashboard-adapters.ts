// lib/dashboard-adapters.ts
import { Zap, TrendingUp, TriangleAlert, Clock4 } from 'lucide-react'
import type {
  DashboardCounts,
  RecentTicket,
  CategoryBreakdown,
  AgentWorkload,
} from '@/lib/actions/dashboard-actions'
import type { StatCardProps } from '@/components/dashboard/StatCard'
import type { Priority, Status } from '@/lib/types/dashboard'

export function toStatCards(counts: DashboardCounts): StatCardProps[] {
  return [
    { label: 'Open Tickets', value: counts.openCount, sub: 'Awaiting assignment or first response', icon: Zap, accent: '#8A38F5' },
    { label: 'In Progress', value: counts.inProgressCount, sub: 'Currently being worked on', icon: TrendingUp, accent: '#1949CF' },
    { label: 'SLA Breached', value: counts.breachedSlaCount, sub: 'Past resolution deadline', icon: TriangleAlert, accent: '#DD1515' },
    { label: 'SLA Warning', value: counts.approachingSlaCount, sub: 'Approaching resolution deadline', icon: Clock4, accent: '#FF9100' },
  ]
}

export function toCategorySeries(rows: CategoryBreakdown[]) {
  return rows.map((r) => ({ name: r.categoryName, value: r.ticketCount }))
}

export function toRecentTicketItems(rows: RecentTicket[]) {
  return rows.map((r) => ({
    id: r.id,
    ticket_number: r.ticketNumber,
    title: r.title,
    priority: r.priority as Priority,
    status: r.status as Status,
    employee: { full_name: r.employeeName ?? 'Employee' },
  }))
}
export function formatMinutes(minutes: number | null): string {
  if (minutes === null) return '—'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}


export function toWorkloadItems(rows: AgentWorkload[]) {
  return rows.map((r) => ({
    agent: r.agentName,
    in_progress: r.inProgressCount,
    closed: r.closedCount,
  }))
}

export function computeResolutionRate(rows: AgentWorkload[]): number {
  const closed = rows.reduce((sum, r) => sum + r.closedCount, 0)
  const inProgress = rows.reduce((sum, r) => sum + r.inProgressCount, 0)
  const total = closed + inProgress
  return total === 0 ? 0 : Math.round((closed / total) * 100)
}