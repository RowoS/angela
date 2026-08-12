"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { QrCode, MessageSquare, Paperclip } from "lucide-react"
import type { QueueTicket } from "@/lib/types/tickets"
import { getSlaState } from "@/lib/utils/sla-utils"
import { PriorityBadge } from "./PriorityBadge"
import { StatusBadge } from "./StatusBadge"
import { SLABadge } from "./SLABadge"
import { AssigneeAvatar } from "./AssigneeAvatar"

function formatDueDate(iso: string | null) {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function QueueCard({ ticket }: { ticket: QueueTicket }) {
    const router = useRouter()
    const slaState = getSlaState(ticket)
    const href = `/tickets/${ticket.id}`

    return (
        <div
            onClick={() => router.push(href)}
            className="flex cursor-pointer flex-col gap-3 rounded-xl border border-[#EFEFEF] bg-white p-4 active:bg-[#FAFAFA]"
        >
            {/* Ticket # + title, priority pinned top-right */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                    <Link
                        href={href}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-sm font-semibold text-[#008AAC] hover:underline"
                    >
                        {ticket.ticket_number}
                    </Link>
                    <p className="truncate font-medium text-[#26242A]">{ticket.title}</p>
                </div>
                <PriorityBadge priority={ticket.priority} />
            </div>

            {/* Requester */}
            <div className="flex items-center gap-2 text-sm text-[#5B5B5B]">
                <span className="truncate">{ticket.requester?.full_name ?? "Unknown requester"}</span>
                {ticket.requester?.employee_no && (
                    <span className="shrink-0 rounded bg-[#E6F0FE] px-1.5 py-0.5 font-mono text-xs text-[#1D4ED8]">
                        {ticket.requester.employee_no}
                    </span>
                )}
            </div>

            {/* Status + category */}
            <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={ticket.status} />
                <span className="text-xs text-[#8A8A8A]">{ticket.category?.name ?? "Uncategorized"}</span>
            </div>

            {/* Assignee + due date */}
            <div className="flex items-center justify-between gap-2 border-t border-[#F2F2F2] pt-3">
                <AssigneeAvatar assignedTo={ticket.assigned_to} />
                <span className="shrink-0 text-xs text-[#8A8A8A]">Due {formatDueDate(ticket.due_at)}</span>
            </div>

            {/* SLA + comment/attachment counts + QR */}
            <div className="flex flex-wrap items-center gap-3">
                <SLABadge state={slaState} />
                <span className="flex items-center gap-1 text-xs text-[#8A8A8A]">
                    <MessageSquare className="size-3.5" />
                    {ticket.comment_count}
                </span>
                <span className="flex items-center gap-1 text-xs text-[#8A8A8A]">
                    <Paperclip className="size-3.5" />
                    {ticket.attachment_count}
                </span>
                <span className="ml-auto flex items-center gap-1 text-xs text-[#8A8A8A]">
                    <QrCode className="size-3.5" />
                    QR
                </span>
            </div>
        </div>
    )
}