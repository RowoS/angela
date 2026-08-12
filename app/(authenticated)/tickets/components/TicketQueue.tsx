'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Filter, Download, Loader2, MessageSquare, Paperclip, ArrowUpDown } from 'lucide-react'
import { PriorityBadge, StatusBadge, SLABadge } from '@/components/Badges'
import { getSlaState } from '@/lib/utils/sla-utils'
import { useTicketFilters } from '@/hooks/use-ticket-filters'
import type { SortKey } from '@/hooks/use-ticket-filters'
import type { QueueTicket } from '@/lib/types/tickets'
import type { Database } from '@/lib/supabase/types'

type Priority = Database['public']['Enums']['ticket_priority']
type Status = Database['public']['Enums']['ticket_status']

const STATUS_FILTERS: (Status | 'all')[] = ['all', 'open', 'in_progress', 'on_hold', 'resolved']
const PRIORITY_FILTERS: (Priority | 'all')[] = ['all', 'critical', 'high', 'medium', 'low']

interface TicketQueueProps {
  tickets: QueueTicket[]
}

export function TicketQueue({ tickets }: TicketQueueProps) {
  const { state, actions, data } = useTicketFilters(tickets)
  const [isExporting, setIsExporting] = useState(false)

  const chip = (active: boolean) =>
    `px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
      active
        ? 'bg-indigo-600 text-white border-indigo-600'
        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
    }`

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          value={state.search}
          onChange={(e) => actions.setSearch(e.target.value)}
          placeholder="Search by title, ticket #, or requester…"
          className="w-70 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />

        <div className="ml-1 flex items-center gap-1.5">
          <Filter size={13} className="text-slate-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status:</span>
          {STATUS_FILTERS.map((s) => (
            <button key={s} className={chip(state.filterStatus === s)} onClick={() => actions.setFilterStatus(s)}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="ml-1 flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Priority:</span>
          {PRIORITY_FILTERS.map((p) => (
            <button key={p} className={chip(state.filterPriority === p)} onClick={() => actions.setFilterPriority(p)}>
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <select
            value={state.filterCategory}
            onChange={(e) => actions.setFilterCategory(e.target.value)}
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 outline-none"
          >
            {data.categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All categories' : c}
              </option>
            ))}
          </select>
          <button
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            {isExporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Showing <strong className="text-slate-600">{data.filteredTickets.length}</strong> of {tickets.length} tickets
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/60">
              {[
                { label: 'Ticket #', key: 'ticket_number' as SortKey },
                { label: 'Title / Requester', key: null },
                { label: 'Category', key: null },
                { label: 'Priority', key: 'priority' as SortKey },
                { label: 'Status', key: 'status' as SortKey },
                { label: 'Assigned To', key: null },
                { label: 'Due', key: 'due_at' as SortKey },
                { label: 'SLA', key: null },
                { label: '', key: null },
              ].map((h, i) => (
                <th
                  key={i}
                  onClick={() => h.key && actions.toggleSort(h.key)}
                  className={`whitespace-nowrap border-b border-slate-100 px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 ${
                    h.key ? 'cursor-pointer select-none' : ''
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {h.label}
                    {h.key && (
                      <ArrowUpDown size={10} className={state.sortKey === h.key ? 'opacity-100' : 'opacity-30'} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                  No tickets match these filters.
                </td>
              </tr>
            ) : (
              data.filteredTickets.map((t) => {
                const slaState = getSlaState(t)
                const href = t.status === 'open' ? `/tickets/pending/${t.id}` : `/tickets/${t.id}`
                return (
                  <tr key={t.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-2.5">
                      <Link href={href} className="block font-mono text-xs font-bold text-indigo-600">
                        {t.ticket_number}
                      </Link>
                    </td>
                    <td className="max-w-60 px-4 py-2.5">
                      <Link href={href} className="block truncate text-sm font-medium text-slate-900">
                        {t.title}
                      </Link>
                      <div className="mt-0.5 text-xs text-slate-400">
                        {t.requester?.full_name ?? 'Unknown'}
                        {t.requester?.employee_no && (
                          <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-indigo-600">
                            {t.requester.employee_no}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{t.category?.name ?? 'Uncategorized'}</td>
                    <td className="px-4 py-2.5">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-2.5">
                      {t.assigned_to ? (
                        <span className="text-xs text-slate-600">{t.assigned_to.full_name ?? 'Unnamed'}</span>
                      ) : (
                        <span className="text-xs text-slate-300">Unassigned</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-slate-500">
                      {t.due_at
                        ? new Date(t.due_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <SLABadge state={slaState} />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3 text-slate-400">
                        {t.comment_count > 0 && (
                          <span className="flex items-center gap-1 text-[11px]">
                            <MessageSquare size={12} /> {t.comment_count}
                          </span>
                        )}
                        {t.attachment_count > 0 && (
                          <span className="flex items-center gap-1 text-[11px]">
                            <Paperclip size={12} /> {t.attachment_count}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}