import type { TicketStatus } from "@/lib/types/tickets"

// IMPORTANT: this must stay typed against the FULL TicketStatus (8
// values), not ManualStatus (5). ManualStatus deliberately excludes
// pending_confirmation/closed/cancelled — those get set through
// different flows (closeTicketViaQr, confirmTicketCreation, etc.), not
// updateTicketStatus. But a real ticket can legitimately BE any of the
// 8 statuses, and this component needs to render whichever one it
// actually is — using the narrower type here is exactly what caused
// "Cannot read properties of undefined (reading 'bg')" on any
// closed/cancelled/pending_confirmation ticket.
export const STATUS_STYLES: Record<TicketStatus, { bg: string; text: string; label: string }> = {
    pending_confirmation: { bg: "", text: "", label: "" },
    open: { bg: "bg-[#1949CF]/20", text: "text-[#1949CF]", label: "Open" },
    in_progress: { bg: "bg-[#8A38F5]/20", text: "text-[#8A38F5]", label: "In Progress" },
    on_hold: { bg: "bg-[#987700]/20", text: "text-[#987700]", label: "On Hold" },
    resolved: { bg: "bg-[#15803D]/20", text: "text-[#15803D]", label: "Resolved" },
    closed: { bg: "bg-[#5B5B5B]/10", text: "text-[#5B5B5B]", label: "Closed" },
    reopened: { bg: "bg-[#B91C1C]/20", text: "text-[#B91C1C]", label: "Reopened" },
    cancelled: { bg: "", text: "", label: "" },
}

export function StatusBadge({ status }: { status: TicketStatus }) {
    const s = STATUS_STYLES[status]
    return (
        <span className={`inline-flex items-center rounded-full text-[10px] px-2.5 py-1 font-medium ${s.bg} ${s.text}`}>
            {s.label}
        </span>
    )
}