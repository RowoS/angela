import type { ManualStatus } from "@/lib/actions/ticket-actions"

export const STATUS_STYLES: Record<ManualStatus, { bg: string; text: string; label: string }> = {
    open: { bg: "bg-[#1949CF]/20", text: "text-[#1949CF]", label: "Open" },
    in_progress: { bg: "bg-[#8A38F5]/20", text: "text-[#8A38F5]", label: "In Progress" },
    on_hold: { bg: "bg-[#987700]/20", text: "text-[#987700]", label: "On Hold" },
    resolved: { bg: "bg-[#15803D]/20", text: "text-[#15803D]", label: "Resolved" },
    reopened: { bg: "bg-[#B91C1C]/20", text: "text-[#B91C1C]", label: "Reopened" }
}

export function StatusBadge({ status }: { status: ManualStatus }) {
    const s = STATUS_STYLES[status]
    return (
        <span className={`inline-flex items-center rounded-full text-[10px] px-2.5 py-1 font-medium ${s.bg} ${s.text}`}>
            {s.label}
        </span>
    )
}