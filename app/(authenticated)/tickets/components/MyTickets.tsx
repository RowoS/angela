'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { PriorityBadge, StatusBadge, SLABadge } from '@/components/Badges'
import { getSlaState, type SlaState } from '@/lib/actions/sla-actions'
import type { QueueTicket } from '@/lib/actions/ticket-actions'

interface MyTicketsProps {
  tickets: QueueTicket[]
  viewerName: string;
}

interface SummaryChip {
  label: string
  count: number
  color: string
  bg: string
}

export function MyTickets({ tickets, viewerName }: MyTicketsProps) {
  const withSla = useMemo(
    () => tickets.map((t) => ({ ticket: t, sla: getSlaState(t) as SlaState })),
    [tickets]
  )

  const chips: SummaryChip[] = useMemo(
    () => [
      { label: 'All', count: tickets.length, color: '#64748b', bg: '#f1f5f9' },
      {
        label: 'Open',
        count: tickets.filter((t) => t.status === 'open').length,
        color: '#2563eb',
        bg: '#eff6ff',
      },
      {
        label: 'In Progress',
        count: tickets.filter((t) => t.status === 'in_progress').length,
        color: '#7c3aed',
        bg: '#f5f3ff',
      },
      {
        label: 'On Hold',
        count: tickets.filter((t) => t.status === 'on_hold').length,
        color: '#d97706',
        bg: '#fffbeb',
      },
      {
        label: 'SLA Warning',
        count: withSla.filter(({ sla }) => sla === 'warning').length,
        color: '#ea580c',
        bg: '#fff7ed',
      },
      {
        label: 'Breached',
        count: withSla.filter(({ sla }) => sla === 'breached').length,
        color: '#dc2626',
        bg: '#fef2f2',
      },
    ],
    [tickets, withSla]
  )

  return (
    <div className="flex flex-col gap-5 p-7">
      <p className="text-sm text-slate-500">
        Tickets currently assigned to <strong className="text-slate-900">{viewerName}</strong>
      </p>

      <div className="flex flex-wrap gap-2.5">
        {chips.map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-1.5 rounded-xl px-3.5 py-2"
            style={{ backgroundColor: c.bg }}
          >
            <span className="font-mono text-base font-extrabold" style={{ color: c.color }}>
              {c.count}
            </span>
            <span className="text-xs font-semibold" style={{ color: c.color }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {tickets.length === 0 ? (
          <div className="py-15 text-center text-sm text-slate-400">
            No tickets currently assigned to you.
          </div>
        ) : (
          withSla.map(({ ticket: t, sla }) => (
            <Link
              key={t.id}
              href={`/tickets/${t.id}`}
              className="block rounded-xl border border-slate-100 bg-white px-5.5 py-4.5 transition-colors hover:border-indigo-300 hover:shadow-sm"
            >
              <div className="flex items-start gap-3.5">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600">{t.ticket_number}</span>
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                    <SLABadge state={sla} />
                  </div>
                  <div className="mb-1 truncate text-sm font-bold text-slate-900">{t.title}</div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">{t.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                    {t.requester?.employee_no && (
                      <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-600">
                        {t.requester.employee_no}
                      </span>
                    )}
                    <span>{t.requester?.full_name ?? 'Unknown'}</span>
                    {t.requester?.department && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span>{t.requester.department}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                  <span className="text-[11px] text-slate-400">
                    {t.due_at
                      ? `Due ${new Date(t.due_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : 'No due date'}
                  </span>
                  {t.comment_count > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MessageSquare size={12} /> {t.comment_count}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}