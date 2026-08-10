'use client'

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ResponseResolutionMonth } from '@/lib/types/reports'

export function ResponseResolutionChart({ data }: { data: ResponseResolutionMonth[] }) {
  return (
    <div className="rounded-xl border border-[#e8ecf2] bg-white p-5.5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">Response &amp; Resolution Times</h3>
        <p className="mt-0.5 text-xs text-slate-400">Average in minutes, by month</p>
      </div>
      <div className="h-[200px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No data in this range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="avg_response" stroke="#6366f1" strokeWidth={2} dot={false} name="First Response" connectNulls />
              <Line type="monotone" dataKey="avg_resolution" stroke="#f59e0b" strokeWidth={2} dot={false} name="Resolution" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}