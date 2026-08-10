'use client'

import { useState } from 'react'
import { MessageSquare, Clock, Paperclip, User, Tag, Calendar, Eye } from 'lucide-react'
import { PriorityBadge, StatusBadge, SLABadge } from '@/components/Badges'
import { TicketComments, type CommentRow } from './TicketComment'
import { TicketControls } from './TicketControls'
import { TicketAttachments, type AttachmentRow } from './TicketAttachment'
import { TicketCloseActions } from './TicketCloseActions'
import { describeActivity } from '@/lib/activity-format'
import { getSlaState } from '@/lib/actions/sla-actions'
import { useTicketControls } from '@/hooks/use-ticket-controls'
import type { TicketDetailData } from '@/lib/types/tickets'
import type { ActivityLogRow } from '@/lib/types/activity'
import type { ValidStatus } from '@/hooks/use-ticket-controls'
interface StaffMember {
  id: string
  full_name: string | null
  role: string
}

interface TicketDetailViewProps {
  ticket: TicketDetailData
  staff: StaffMember[]
  comments: CommentRow[]
  attachments: AttachmentRow[]
  activity: ActivityLogRow[]
  createdByName: string | null
  isReadOnly: boolean
}

type Tab = 'comments' | 'audit' | 'attachments'

export function TicketDetailView({
  ticket,
  staff,
  comments,
  attachments,
  activity,
  createdByName,
  isReadOnly,
}: TicketDetailViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('comments')
  const sla = getSlaState(ticket)

  // Separate hook instance from TicketControls' internal one — see PR
  // note: TicketCloseActions needs handlers passed in as props rather
  // than owning its own hook, so this is the one place two isUpdating
  // flags exist side by side. They gate disjoint actions (status/assign
  // vs. close), so it's cosmetic, not a correctness risk.
  const { isUpdating: isClosing, handleQrClose, handleOverrideClose } = useTicketControls(
    ticket.id,
    ticket.status === 'closed' ? 'resolved' : (ticket.status as ValidStatus),
    ticket.assigned_to?.id ?? null
  )

  const tabClass = (tab: Tab) =>
    `flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
      activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
    }`

  return (
    <div className="grid grid-cols-1 gap-5 p-7 lg:grid-cols-[1fr_320px]">
      {/* Left column */}
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-slate-100 bg-white p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-600">{ticket.ticket_number}</span>
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
            <SLABadge state={sla} />
          </div>
          <h2 className="mb-3 text-lg font-bold text-slate-900">{ticket.title}</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{ticket.description}</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
          <div className="flex border-b border-slate-100 px-5">
            <button className={tabClass('comments')} onClick={() => setActiveTab('comments')}>
              <MessageSquare size={13} /> Comments ({comments.length})
            </button>
            <button className={tabClass('audit')} onClick={() => setActiveTab('audit')}>
              <Clock size={13} /> Audit Log
            </button>
            <button className={tabClass('attachments')} onClick={() => setActiveTab('attachments')}>
              <Paperclip size={13} /> Attachments ({attachments.length})
            </button>
          </div>

          <div className="p-5">
            {activeTab === 'comments' && <TicketComments ticketId={ticket.id} comments={comments} />}

            {activeTab === 'audit' && (
              <ul className="flex flex-col divide-y divide-slate-100">
                {activity.length === 0 ? (
                  <p className="text-sm text-slate-400">No activity recorded yet.</p>
                ) : (
                  activity.map((a) => (
                    <li key={a.id} className="py-2.5">
                      <p className="text-sm text-slate-900">{describeActivity(a)}</p>
                      <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</span>
                    </li>
                  ))
                )}
              </ul>
            )}

            {activeTab === 'attachments' && (
              <TicketAttachments ticketId={ticket.id} ticketStatus={ticket.status as ValidStatus} attachments={attachments} />
            )}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-slate-100 bg-white p-4.5">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Requester</div>
          <div className="flex items-start gap-2.5">
            <User size={16} className="mt-0.5 text-slate-400" />
            <div>
              <div className="text-sm font-bold text-slate-900">{ticket.requester?.full_name ?? 'Unknown'}</div>
              <div className="text-xs text-slate-500">{ticket.requester?.department ?? '—'}</div>
              <div className="mt-1 font-mono text-xs text-indigo-600">{ticket.requester?.employee_no}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4.5">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Details</div>
          <div className="flex flex-col gap-3">
            {[
              { icon: <User size={13} />, label: 'Created By', value: createdByName ?? 'Unknown' },
              { icon: <Tag size={13} />, label: 'Category', value: ticket.category?.name ?? 'Uncategorized' },
              {
                icon: <Calendar size={13} />,
                label: 'Created',
                value: new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              },
              {
                icon: <Clock size={13} />,
                label: 'Due',
                value: ticket.due_at
                  ? new Date(ticket.due_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—',
              },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-2.5">
                <span className="mt-0.5 text-slate-400">{row.icon}</span>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{row.label}</div>
                  <div className="text-sm font-medium text-slate-900">{row.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isReadOnly ? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-4.5 text-xs text-slate-400">
            <Eye size={13} /> Read-only — managers cannot change status or assignment.
          </div>
        ) : (
          <>
            <TicketControls
              ticketId={ticket.id}
              currentStatus={ticket.status as ValidStatus}
              currentAssigneeId={ticket.assigned_to?.id ?? null}
              staffList={staff.map((s) => ({ id: s.id, full_name: s.full_name ?? 'Unnamed', role: s.role }))}
            />

            {ticket.status !== 'closed' && (
              <div className="rounded-xl border border-slate-100 bg-white p-4.5">
                <TicketCloseActions
                  isUpdating={isClosing}
                  onQrClose={handleQrClose}
                  onOverrideClose={handleOverrideClose}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}