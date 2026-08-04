// components/dashboard/TicketVolCard.tsx
'use client'

import { useEffect, useState, useTransition } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getTicketsOpenedOverTime, type OpenedBucket, type OpenedPeriod } from '@/lib/actions/dashboard-actions'
import { ErrorState } from './ErrorState'

const PERIOD_LABEL: Record<OpenedPeriod, string> = {
  week: 'Last 7 days',
  month: 'Last 30 days',
  year: 'Last 12 months',
}

export function TicketVolCard({ initial }: { initial: OpenedBucket[] | null }) {
  const [period, setPeriod] = useState<OpenedPeriod>('week')
  const [buckets, setBuckets] = useState<OpenedBucket[] | null>(initial)
  const [isPending, startTransition] = useTransition()
  const [fetchFailed, setFetchFailed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  const initialLoadFailed = initial === null
  const data = (buckets ?? []).map((b) => ({ month: b.bucket, tickets: b.count }))

  const handlePeriodChange = (next: OpenedPeriod) => {
    setPeriod(next)
    setFetchFailed(false)
    startTransition(async () => {
      try {
        setBuckets(await getTicketsOpenedOverTime(next))
      } catch {
        setFetchFailed(true)
      }
    })
  }

  return (
    <div className="w-3/5 rounded-xl border border-[#e8ecf2] bg-white p-5.5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Ticket Volume</h3>
          <p className="mt-0.5 text-xs text-slate-400">{PERIOD_LABEL[period]}</p>
        </div>
        <div className="flex gap-1">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              disabled={isPending || initialLoadFailed}
              className={`px-2 py-1 text-xs rounded-md capitalize ${
                period === p ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              } disabled:opacity-50`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {initialLoadFailed ? (
        <ErrorState label="ticket volume" />
      ) : (
        <>
          {fetchFailed && (
            <p className="text-xs text-red-600 mb-2">Couldn&apos;t refresh — showing last loaded data.</p>
          )}
          <div className="h-[180px] w-full">
            {!isMounted ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-md" />
            ) : data.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No tickets in this range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ticketVolGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} minTickGap={20} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ stroke: '#e2e8f0' }} />
                  <Area type="monotone" dataKey="tickets" stroke="#4f46e5" strokeWidth={2} fill="url(#ticketVolGrad)" dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  )
}