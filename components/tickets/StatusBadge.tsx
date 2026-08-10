import type { TicketStatus } from "@/lib/types/tickets"

const STATUS_STYLES: Record<TicketStatus, { bg: string; text: string; label: string }> = {
    pending_confirmation: { bg: "bg-[#F2F2F2]", text: "text-[#5B5B5B]", label: "Pending confirmation" },
    open: { bg: "bg-[#E6F0FE]", text: "text-[#1D4ED8]", label: "Open" },
    in_progress: { bg: "bg-[#EDE9FE]", text: "text-[#6D28D9]", label: "In progress" },
    on_hold: { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", label: "On hold" },
    resolved: { bg: "bg-[#DCFCE7]", text: "text-[#15803D]", label: "Resolved" },
    closed: { bg: "bg-[#F2F2F2]", text: "text-[#5B5B5B]", label: "Closed" },
    reopened: { bg: "bg-[#FEE2E2]", text: "text-[#B91C1C]", label: "Reopened" },
    cancelled: { bg: "bg-[#F2F2F2]", text: "text-[#8A8A8A]", label: "Cancelled" },
}

export function StatusBadge({ status }: { status: TicketStatus }) {
    const s = STATUS_STYLES[status]
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${s.bg} ${s.text}`}>
            {s.label}
        </span>
    )
}