'use client'

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { OpenedBucket } from '@/lib/actions/dashboard-actions'

export function TicketVolumeChart({ buckets, periodLabel }: { buckets: OpenedBucket[]; periodLabel: string }) {
  const data = buckets.map((b) => ({ month: b.bucket, tickets: b.count }))

  return (
    <div className="w-3/5 rounded-xl border border-[#e8ecf2] bg-white p-5.5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">Ticket Volume</h3>
        <p className="mt-0.5 text-xs text-slate-400">{periodLabel}</p>
      </div>
      <div className="h-[200px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No tickets in this range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="reportsTicketVolGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} minTickGap={20} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ stroke: '#e2e8f0' }} />
              <Area type="monotone" dataKey="tickets" stroke="#4f46e5" strokeWidth={2} fill="url(#reportsTicketVolGrad)" dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}