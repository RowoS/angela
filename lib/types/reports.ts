import type { OpenedBucket } from "../actions/dashboard-actions"

export type ReportPeriod = '30d' | '90d' | '6m' | '1y'

export const REPORT_PERIOD_LABEL: Record<ReportPeriod, string> = {
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '6m': 'Last 6 months',
  '1y': 'This year',
}

const PERIOD_DAYS: Record<ReportPeriod, number> = {
  '30d': 30,
  '90d': 90,
  '6m': 182,
  '1y': 365,
}

export type PeriodWindow = { start: Date; end: Date }

/** Current window plus the immediately preceding window of equal length,
 *  so callers can compute %-change without duplicating date math. */
export function resolvePeriodWindows(
  period: ReportPeriod,
  now = new Date()
): { current: PeriodWindow; prior: PeriodWindow } {
  const end = now
  const days = PERIOD_DAYS[period]
  const start = new Date(end.getTime() - days * 86_400_000)
  const priorEnd = start
  const priorStart = new Date(priorEnd.getTime() - days * 86_400_000)
  return { current: { start, end }, prior: { start: priorStart, end: priorEnd } }
}

export function pctChange(current: number, prior: number): number | null {
  if (prior === 0) return current === 0 ? 0 : null
  return Math.round(((current - prior) / prior) * 1000) / 10
}

export type ReportKpis = {
  ticketsCreated: number
  ticketsCreatedChangePct: number | null
  avgFirstResponseMinutes: number | null
  avgFirstResponseChangePct: number | null
  slaMetRate: number | null
  slaMetRateChangePp: number | null
  slaBreachCount: number
  slaBreachChangePct: number | null
}

export type SlaComplianceMonth = { month: string; met: number; breached: number }

export type ResponseResolutionMonth = { month: string; avg_response: number | null; avg_resolution: number | null }

export type ReportCategoryBreakdown = { name: string; value: number }

export type AgentPerformanceRow = {
  agentId: string
  agentName: string
  assigned: number
  resolved: number
  avgResponseMinutes: number | null
  slaMetPct: number | null
}

export type ReportsData = {
  kpis: ReportKpis
  slaCompliance: SlaComplianceMonth[]
  responseResolution: ResponseResolutionMonth[]
  categoryBreakdown: ReportCategoryBreakdown[]
  agentPerformance: AgentPerformanceRow[]
  ticketVolume: OpenedBucket[]
}