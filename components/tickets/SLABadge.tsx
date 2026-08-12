import { Timer, AlertTriangle } from "lucide-react"
import { SlaState } from "@/lib/utils/sla-utils"

export function SLABadge({ state }: { state: SlaState }) {
    // "none" (resolved/closed/cancelled — no active SLA clock) and "ok"
    // (active clock, not close to due) both mean nothing to flag. A badge
    // here should mean "this needs your attention," so only warning/
    // breached render anything.
    if (state === "none" || state === "ok") return null

    if (state === "breached") {
        return (
            <span className="inline-flex items-center justify-center gap-1 rounded-full bg-[#DD1515]/10 px-2 py-1 text-[10px] font-medium text-[#DD1515]">
                <AlertTriangle className="size-3" />
                SLA Breached
            </span>
        )
    }

    return (
        <span className="inline-flex items-center justify-center gap-1 rounded-full bg-[#987700]/10 px-2 py-1 text-[10px] font-medium text-[#987700]">
            <Timer className="size-3" />
            SLA Warning
        </span>
    )
}