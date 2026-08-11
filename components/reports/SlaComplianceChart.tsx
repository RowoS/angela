'use client'

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SlaComplianceMonth } from '@/lib/types/reports'

export function SlaComplianceChart({ data }: { data: SlaComplianceMonth[] }) {
  return (
    <div className="rounded-xl border border-[#e8ecf2] bg-white p-5.5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">SLA Compliance</h3>
        <p className="mt-0.5 text-xs text-slate-400">Met vs. breached, by month</p>
      </div>
      <div className="h-[200px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No SLA-tracked tickets in this range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={18} barGap={4} stackOffset="expand">
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="met" fill="#10b981" name="Met" stackId="a" />
              <Bar dataKey="breached" fill="#fca5a5" radius={[4, 4, 0, 0]} name="Breached" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}