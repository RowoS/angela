import { Clock, AlertTriangle } from "lucide-react"
import { SlaState } from "@/lib/utils/sla-utils"

export function SlaBadge({ state }: { state: SlaState }) {
    // "none" (resolved/closed/cancelled — no active SLA clock) and "ok"
    // (active clock, not close to due) both mean nothing to flag. A badge
    // here should mean "this needs your attention," so only warning/
    // breached render anything.
    if (state === "none" || state === "ok") return null

    if (state === "breached") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-xs font-semibold text-[#B91C1C]">
                <AlertTriangle className="size-3.5" />
                SLA Breached
            </span>
        )
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-semibold text-[#92400E]">
            <Clock className="size-3.5" />
            SLA Warning
        </span>
    )
}