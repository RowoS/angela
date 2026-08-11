import type { AgentPerformanceRow } from '@/lib/types/reports'

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function formatMinutes(mins: number | null): string {
  if (mins === null) return '—'
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function AgentPerformanceTable({ rows }: { rows: AgentPerformanceRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#e8ecf2] bg-white">
      <div className="border-b border-[#f1f5f9] px-5.5 py-4">
        <h3 className="text-sm font-bold text-slate-900">Agent Performance</h3>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#fafbff]">
            {['Agent', 'Assigned', 'Resolved', 'Avg Response', 'SLA Met', 'Satisfaction'].map((h) => (
              <th
                key={h}
                className="border-b border-[#f1f5f9] px-5.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5.5 py-6 text-center text-sm text-slate-400">
                No agent activity in this range.
              </td>
            </tr>
          )}
          {rows.map((a, i) => (
            <tr key={a.agentId} className={i < rows.length - 1 ? 'border-b border-[#f1f5f9]' : ''}>
              <td className="px-5.5 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100">
                    <span className="text-[9px] font-bold text-violet-600">{initials(a.agentName)}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-slate-900">{a.agentName}</span>
                </div>
              </td>
              <td className="px-5.5 py-3 font-mono text-[13px] text-slate-600">{a.assigned}</td>
              <td className="px-5.5 py-3 font-mono text-[13px] text-slate-600">{a.resolved}</td>
              <td className="px-5.5 py-3 font-mono text-[13px] text-slate-600">{formatMinutes(a.avgResponseMinutes)}</td>
              <td className="px-5.5 py-3">
                {a.slaMetPct === null ? (
                  <span className="text-[13px] text-slate-400">—</span>
                ) : (
                  <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-600">{a.slaMetPct}%</span>
                )}
              </td>
              {/* Satisfaction/CSAT has no backing table yet — stubbed per your call. */}
              <td className="px-5.5 py-3 text-[13px] text-slate-400">—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}