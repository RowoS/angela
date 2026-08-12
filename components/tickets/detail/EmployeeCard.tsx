import { User, QrCode } from "lucide-react"
import type { TicketRequester } from "@/lib/types/tickets"

export function EmployeeCard({ requester, status }: { requester: TicketRequester | null; status: string }) {
    // Same derivation as QrConfirmedBadge (no explicit confirmed_at column
    // to read from) — kept as a plain text row here since that's how the
    // mockup styles it in this specific spot, distinct from the filled
    // pill badge used in the header for the same fact.
    const isConfirmed = status !== "pending_confirmation"

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-[#EFEFEF] bg-white p-4">
            <span className="text-[10px] font-bold tracking-wide text-black/40">EMPLOYEE</span>

            <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#008AAC]/10">
                    <User className="size-4 text-[#008AAC]" />
                </span>
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-[#26242A]">
                        {requester?.full_name ?? "Unknown Requester"}
                    </span>
                    <span className="text-[10px] text-black/50">{requester?.department ?? "—"}</span>
                    {requester?.employee_no && (
                        <span className="font-jetbrmono text-[10px] text-[#008AAC]">{requester.employee_no}</span>
                    )}
                </div>
            </div>

            {isConfirmed && (
                <div className="flex items-center gap-2 rounded-sm bg-[#F8F8F8] px-2.5 py-1.5 text-[10px] font-medium text-[#008AAC]">
                    <QrCode className="size-3.5 text-[#008AAC]" />
                    Creation confirmed by QR scan
                </div>
            )}
        </div>
    )
}