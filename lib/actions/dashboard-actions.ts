'use server'

import { createClient } from '@/lib/supabase/server'
import { getActivityLog } from '@/lib/actions/activity-actions'
import type { ActivityLogRow } from '@/lib/types/activity'

export type DashboardCounts = {
  openCount: number
  inProgressCount: number
  approachingSlaCount: number
  breachedSlaCount: number
}

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dashboard_ticket_counts')
    .select('*')
    .maybeSingle()

  if (error) throw new Error(error.message)
  // The view is a single unconditional aggregate, so a missing row
  // means something's actually wrong (RLS misconfigured, view dropped)
  // rather than "no data yet" — surface it instead of masking it as zeros.
  if (!data) throw new Error('Dashboard counts unavailable')

  return {
    openCount: data.open_count,
    inProgressCount: data.in_progress_count,
    approachingSlaCount: data.approaching_sla_count,
    breachedSlaCount: data.breached_sla_count,
  }
}

export type RecentTicket = {
  id: string
  ticketNumber: string
  title: string
  priority: string
  status: string
  categoryId: string
  createdAt: string
  employeeName: string | null
}

export async function getRecentTickets(): Promise<RecentTicket[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dashboard_recent_tickets')
    .select('*')

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id,
    ticketNumber: r.ticket_number,
    title: r.title,
    priority: r.priority,
    status: r.status,
    categoryId: r.category_id,
    createdAt: r.created_at,
    employeeName: r.requester_name
  }))
}

export type AvgFirstResponse = {
  avgMinutes: number | null
  sampleSize: number
}

export async function getAvgFirstResponse(): Promise<AvgFirstResponse> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dashboard_avg_first_response')
    .select('*')
    .maybeSingle()

  if (error) throw new Error(error.message)
  return {
    avgMinutes: data?.avg_first_response_minutes ?? null,
    sampleSize: data?.sample_size ?? 0,
  }
}

export type CategoryBreakdown = {
  categoryId: string
  categoryName: string
  ticketCount: number
}

export async function getTicketsByCategory(): Promise<CategoryBreakdown[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dashboard_tickets_by_category')
    .select('*')

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    categoryId: r.category_id,
    categoryName: r.category_name,
    ticketCount: r.ticket_count,
  }))
}

export type OpenedPeriod = 'week' | 'month' | 'year'

export type OpenedBucket = {
  bucket: string
  count: number
}

export async function getTicketsOpenedOverTime(period: OpenedPeriod): Promise<OpenedBucket[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dashboard_tickets_opened_daily')
    .select('day, ticket_count')

  if (error) throw new Error(error.message)

  const grain = period === 'week' ? 'day' : period === 'month' ? 'day' : 'month'
  const buckets = new Map<string, number>()

  for (const row of data ?? []) {
    const date = new Date(row.day)
    const key =
      grain === 'day'
        ? date.toISOString().slice(0, 10)
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    buckets.set(key, (buckets.get(key) ?? 0) + row.ticket_count)
  }

  return Array.from(buckets, ([bucket, count]) => ({ bucket, count })).sort((a, b) =>
    a.bucket.localeCompare(b.bucket)
  )
}

// Preserves current behavior: dashboard activity card is admin-only.
// getActivityLog already scopes an agent's results to their allowed
// entity types — pass adminOnly: false if you later want agents to see
// their scoped activity on their own dashboard too.
export async function getRecentActivity(
  limit = 10,
  { adminOnly = true }: { adminOnly?: boolean } = {}
): Promise<ActivityLogRow[]> {
  if (adminOnly) {
    const supabase = await createClient()
    const { data: role } = await supabase.rpc('get_caller_role')
    if (role !== 'admin') return []
  }
  return getActivityLog({ limit })
}

export type AgentWorkload = {
  agentId: string
  agentName: string
  inProgressCount: number
  closedCount: number
}

export async function getAgentWorkload(): Promise<AgentWorkload[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dashboard_agent_workload')
    .select('*')

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    agentId: r.agent_id,
    agentName: r.agent_name,
    inProgressCount: r.in_progress_count,
    closedCount: r.closed_count,
  }))
}