import type { TicketPriority } from "@/lib/types/tickets"

const PRIORITY_STYLES: Record<TicketPriority, { bg: string; text: string; dot: string; label: string }> = {
    critical: { bg: "bg-[#DD1515]/10", text: "text-[#DD1515]", dot: "bg-[#DD1515]", label: "CRITICAL" },
    high: { bg: "bg-[#FF9100]/10", text: "text-[#FF9100]", dot: "bg-[#FF9100]", label: "HIGH" },
    medium: { bg: "bg-[#987700]/10", text: "text-[#987700]", dot: "bg-[#987700]", label: "MEDIUM" },
    low: { bg: "bg-[#3AB02A]/10", text: "text-[#3AB02A]", dot: "bg-[#3AB02A]", label: "LOW" },
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
    const s = PRIORITY_STYLES[priority]
    return (
        <span className={`inline-flex items-center gap-1.5 py-0.5 rounded-full px-2 text-[11px] font-normal font-jetbrmono tracking-wide ${s.bg} ${s.text}`}>
            <span className={`size-1 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    )
}