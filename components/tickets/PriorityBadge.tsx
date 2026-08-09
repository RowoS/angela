import type { TicketPriority } from "@/lib/types/tickets"

const PRIORITY_STYLES: Record<TicketPriority, { bg: string; text: string; dot: string; label: string }> = {
    critical: { bg: "bg-[#FDE7E7]", text: "text-[#D92D20]", dot: "bg-[#D92D20]", label: "CRITICAL" },
    high: { bg: "bg-[#FEF0E6]", text: "text-[#B54708]", dot: "bg-[#B54708]", label: "HIGH" },
    medium: { bg: "bg-[#E6F0FE]", text: "text-[#1D4ED8]", dot: "bg-[#1D4ED8]", label: "MEDIUM" },
    low: { bg: "bg-[#F2F2F2]", text: "text-[#5B5B5B]", dot: "bg-[#5B5B5B]", label: "LOW" },
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
    const s = PRIORITY_STYLES[priority]
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${s.bg} ${s.text}`}>
            <span className={`size-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    )
}