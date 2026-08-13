'use client'

import { useState, useTransition } from 'react'
import { Download, TrendingUp, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import StatCard from '@/components/dashboard/StatCard'
import { ByCategoryCard } from '@/components/dashboard/ByCategory'
import { ErrorState } from '@/components/dashboard/ErrorState'
import { TicketVolumeChart } from '@/components/reports/TicketVolumeChart'
import { SlaComplianceChart } from '@/components/reports/SlaComplianceChart'
import { ResponseResolutionChart } from '@/components/reports/ResponseResolutionChart'
import { AgentPerformanceTable } from '@/components/reports/AgentPerformanceTable'
import { getReportsData } from '@/lib/actions/reports-actions'
import type { ReportsData } from '@/lib/types/reports'
import { REPORT_PERIOD_LABEL, type ReportPeriod } from '@/lib/types/reports'
import { downloadCsv } from '@/lib/utils/reports-csv'
import { toCsv } from '@/lib/utils/csv-utils'

const PERIOD_OPTIONS: ReportPeriod[] = ['30d', '90d', '6m', '1y']

export function ReportsPageClient({
  initial,
  initialPeriod,
}: {
  initial: ReportsData | null
  initialPeriod: ReportPeriod
}) {
  const [period, setPeriod] = useState<ReportPeriod>(initialPeriod)
  const [data, setData] = useState<ReportsData | null>(initial)
  const [isPending, startTransition] = useTransition()
  const [fetchFailed, setFetchFailed] = useState(false)

  const handlePeriodChange = (next: ReportPeriod) => {
    setPeriod(next)
    setFetchFailed(false)
    startTransition(async () => {
      try {
        setData(await getReportsData(next))
      } catch {
        setFetchFailed(true)
      }
    })
  }

const handleExport = () => {
    if (!data) return
    
    // 1. Define clean, human-readable column titles
    const headers = ['Agent Name', 'Assigned', 'Resolved', 'Avg Response (mins)', 'SLA Met (%)']

    // 2. Map the data directly to an array of values (2D array)
    const rows = data.agentPerformance.map((a) => [
      a.agentName,
      a.assigned,
      a.resolved,
      a.avgResponseMinutes,
      a.slaMetPct,
    ])
    
    // 3. Pass the data and the headers to our unified function
    const csv = toCsv(rows, { headers })
    
    downloadCsv(`agent-performance-${period}.csv`, csv)
  }

  if (!data) {
    return (
      <div className="p-7">
        <ErrorState label="reports" />
      </div>
    )
  }

  const { kpis } = data

  return (
    <div className="flex flex-col gap-6 p-7">
      <div className="flex items-center justify-end gap-2.5">
        <select
          value={period}
          onChange={(e) => handlePeriodChange(e.target.value as ReportPeriod)}
          disabled={isPending}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 outline-none disabled:opacity-50"
        >
          {PERIOD_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {REPORT_PERIOD_LABEL[p]}
            </option>
          ))}
        </select>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {fetchFailed && <p className="text-xs text-red-600">Couldn&apos;t refresh — showing last loaded data.</p>}

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Tickets Created"
          value={kpis.ticketsCreated}
          sub={changeLabel(kpis.ticketsCreatedChangePct)}
          icon={TrendingUp}
          accent="#4f46e5"
        />
        <StatCard
          label="Avg. First Response"
          value={kpis.avgFirstResponseMinutes !== null ? `${Math.round(kpis.avgFirstResponseMinutes)}m` : '—'}
          sub={changeLabel(kpis.avgFirstResponseChangePct)}
          icon={Clock}
          accent="#7c3aed"
        />
        <StatCard
          label="SLA Met Rate"
          value={kpis.slaMetRate !== null ? `${kpis.slaMetRate}%` : '—'}
          sub={
            kpis.slaMetRateChangePp !== null
              ? `${kpis.slaMetRateChangePp >= 0 ? '+' : ''}${kpis.slaMetRateChangePp}pp vs. prior period`
              : 'No prior-period data'
          }
          icon={CheckCircle2}
          accent="#10b981"
        />
        <StatCard
          label="SLA Breaches"
          value={kpis.slaBreachCount}
          sub={changeLabel(kpis.slaBreachChangePct)}
          icon={AlertTriangle}
          accent="#dc2626"
        />
      </div>

      <div className="flex gap-4">
        <TicketVolumeChart buckets={data.ticketVolume} periodLabel={REPORT_PERIOD_LABEL[period]} />
        <ByCategoryCard data={data.categoryBreakdown} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SlaComplianceChart data={data.slaCompliance} />
        <ResponseResolutionChart data={data.responseResolution} />
      </div>

      <AgentPerformanceTable rows={data.agentPerformance} />
    </div>
  )
}

function changeLabel(pct: number | null): string {
  if (pct === null) return 'No prior-period data'
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct}% vs. prior period`
}