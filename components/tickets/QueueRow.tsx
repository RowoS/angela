"use client"
 
import { useRouter } from "next/navigation"
import Link from "next/link"
import { QrCode, MessageSquare, Paperclip } from "lucide-react"
import { TableCell, TableRow } from "@/components/ui/table"
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

export function QueueRow({ ticket }: { ticket: QueueTicket }) {
    const router = useRouter()
    const slaState = getSlaState(ticket)
    const href = `/tickets/${ticket.id}`

    return (
        <TableRow 
            onClick={() => router.push(href)}
            className="border-b border-[#EFEFEF] hover:bg-[#FAFAFA]"
        >
            <TableCell className="align-top pl-3 py-4">
                <Link
                    href={href}
                    onClick={(e) => e.stopPropagation()}
                    className="font-mono text-sm font-semibold text-[#008AAC] hover:underline"
                >
                    {ticket.ticket_number}
                </Link>
                <div className="mt-1 flex items-center gap-1 text-xs text-[#8A8A8A]">
                    <QrCode className="size-3.5" />
                    QR
                </div>
            </TableCell>

            <TableCell className="align-top py-4">
                <p className="font-medium text-[#26242A]">{ticket.title}</p>
                <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-[#5B5B5B]">{ticket.requester?.full_name ?? "Unknown requester"}</span>
                    {ticket.requester?.employee_no && (
                        <span className="rounded bg-[#E6F0FE] px-1.5 py-0.5 font-mono text-xs text-[#1D4ED8]">
                            {ticket.requester.employee_no}
                        </span>
                    )}
                </div>
            </TableCell>

            <TableCell className="align-top py-4">
                <p className="text-[#26242A]">{ticket.category?.name ?? "Uncategorized"}</p>
            </TableCell>

            <TableCell className="align-top py-4">
                <PriorityBadge priority={ticket.priority} />
            </TableCell>

            <TableCell className="align-top py-4">
                <StatusBadge status={ticket.status} />
            </TableCell>

            <TableCell className="align-top py-4">
                <AssigneeAvatar assignedTo={ticket.assigned_to} />
            </TableCell>

            <TableCell className="align-top py-4 text-sm text-[#26242A]">
                {formatDueDate(ticket.due_at)}
            </TableCell>

            <TableCell className="align-top pr-3 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-32 shrink-0">
                        <SLABadge state={slaState} />
                    </div>
                    <span className="flex items-center gap-1 text-xs text-[#8A8A8A]">
                        <MessageSquare className="size-3.5" />
                        {ticket.comment_count}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#8A8A8A]">
                        <Paperclip className="size-3.5" />
                        {ticket.attachment_count}
                    </span>
                </div>
            </TableCell>
        </TableRow>
    )
}