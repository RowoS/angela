'use server'

import { createClient } from '@/lib/supabase/server'
import { getTicketsOpenedOverTime,  type OpenedPeriod } from '@/lib/actions/dashboard-actions'
import { type ReportPeriod, resolvePeriodWindows, pctChange } from '@/lib/types/reports'
import type {
    ReportKpis,
    SlaComplianceMonth,
    ResponseResolutionMonth,
    ReportCategoryBreakdown,
    AgentPerformanceRow,
    ReportsData
} from '@/lib/types/reports'


type RawKpiRow = {
  tickets_created: number
  avg_first_response_minutes: number | null
  sla_met_rate: number | null
  sla_breach_count: number
}

async function fetchKpiRow(start: Date, end: Date): Promise<RawKpiRow> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .rpc('report_kpis' as never, { p_start: start.toISOString(), p_end: end.toISOString() } as never)
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as RawKpiRow
}

export async function getReportKpis(period: ReportPeriod): Promise<ReportKpis> {
  const { current, prior } = resolvePeriodWindows(period)
  const [curr, prev] = await Promise.all([
    fetchKpiRow(current.start, current.end),
    fetchKpiRow(prior.start, prior.end),
  ])

  return {
    ticketsCreated: curr.tickets_created,
    ticketsCreatedChangePct: pctChange(curr.tickets_created, prev.tickets_created),
    avgFirstResponseMinutes: curr.avg_first_response_minutes,
    avgFirstResponseChangePct: pctChange(curr.avg_first_response_minutes ?? 0, prev.avg_first_response_minutes ?? 0),
    slaMetRate: curr.sla_met_rate,
    slaMetRateChangePp:
      curr.sla_met_rate !== null && prev.sla_met_rate !== null
        ? Math.round((curr.sla_met_rate - prev.sla_met_rate) * 10) / 10
        : null,
    slaBreachCount: curr.sla_breach_count,
    slaBreachChangePct: pctChange(curr.sla_breach_count, prev.sla_breach_count),
  }
}


export async function getSlaComplianceTrend(period: ReportPeriod): Promise<SlaComplianceMonth[]> {
  const { current } = resolvePeriodWindows(period)
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('report_sla_compliance_monthly' as never, {
    p_start: current.start.toISOString(),
    p_end: current.end.toISOString(),
  } as never)

  if (error) throw new Error(error.message)
  return ((data ?? []) as unknown as { month: string; met_pct: number; breached_pct: number }[]).map((r) => ({
    month: formatMonthLabel(r.month),
    met: r.met_pct,
    breached: r.breached_pct,
  }))
}


export async function getResponseResolutionTrend(period: ReportPeriod): Promise<ResponseResolutionMonth[]> {
  const { current } = resolvePeriodWindows(period)
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('report_response_resolution_monthly' as never, {
    p_start: current.start.toISOString(),
    p_end: current.end.toISOString(),
  } as never)

  if (error) throw new Error(error.message)
  return (
    (data ?? []) as unknown as { month: string; avg_response_minutes: number | null; avg_resolution_minutes: number | null }[]
  ).map((r) => ({
    month: formatMonthLabel(r.month),
    avg_response: r.avg_response_minutes,
    avg_resolution: r.avg_resolution_minutes,
  }))
}


export async function getReportCategoryBreakdown(period: ReportPeriod): Promise<ReportCategoryBreakdown[]> {
  const { current } = resolvePeriodWindows(period)
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('report_category_breakdown' as never, {
    p_start: current.start.toISOString(),
    p_end: current.end.toISOString(),
  } as never)

  if (error) throw new Error(error.message)
  return ((data ?? []) as unknown as { category_id: string; category_name: string; ticket_count: number }[])
    .filter((r) => r.ticket_count > 0)
    .map((r) => ({ name: r.category_name, value: r.ticket_count }))
}


export async function getAgentPerformance(period: ReportPeriod): Promise<AgentPerformanceRow[]> {
  const { current } = resolvePeriodWindows(period)
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('report_agent_performance' as never, {
    p_start: current.start.toISOString(),
    p_end: current.end.toISOString(),
  } as never)

  if (error) throw new Error(error.message)
  return (
    (data ?? []) as unknown as {
      agent_id: string
      agent_name: string
      assigned_count: number
      resolved_count: number
      avg_response_minutes: number | null
      sla_met_pct: number | null
    }[]
  ).map((r) => ({
    agentId: r.agent_id,
    agentName: r.agent_name,
    assigned: r.assigned_count,
    resolved: r.resolved_count,
    avgResponseMinutes: r.avg_response_minutes,
    slaMetPct: r.sla_met_pct,
  }))
}

/** Single entry point the page/client component calls — fetches every
 *  report section for a period in parallel. */
export async function getReportsData(period: ReportPeriod): Promise<ReportsData> {
  const [kpis, slaCompliance, responseResolution, categoryBreakdown, agentPerformance, ticketVolume] =
    await Promise.all([
      getReportKpis(period),
      getSlaComplianceTrend(period),
      getResponseResolutionTrend(period),
      getReportCategoryBreakdown(period),
      getAgentPerformance(period),
      getTicketsOpenedOverTime(periodToOpenedPeriod(period)),
    ])
  return { kpis, slaCompliance, responseResolution, categoryBreakdown, agentPerformance, ticketVolume }
}

function periodToOpenedPeriod(period: ReportPeriod): OpenedPeriod {
  if (period === '30d') return 'week'
  if (period === '90d' || period === '6m') return 'month'
  return 'year'
}

function formatMonthLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short' })
}