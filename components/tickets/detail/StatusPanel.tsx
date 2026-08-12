"use client"

import { useTransition } from "react"
import { updateTicketStatus } from "@/lib/actions/ticket-actions" // ADJUST if this differs from the real export path
import type { ManualStatus } from "@/lib/actions/ticket-actions"
import type { TicketStatus } from "@/lib/types/tickets"
import { CloseViaQRDialog } from "./CloseViaQRDialog" // confirm this matches the real on-disk filename/casing exactly

const STATUS_OPTIONS: { value: ManualStatus; label: string; bg: string; text: string }[] = [
    { value: "open", label: "Open", bg: "bg-[#1949CF]/10", text: "text-[#1949CF]" },
    { value: "in_progress", label: "In Progress", bg: "bg-[#8A38F5]/10", text: "text-[#8A38F5]" },
    { value: "on_hold", label: "On Hold", bg: "bg-[#987700]/10", text: "text-[#987700]" },
]

// Extend this if more "can't jump straight there" rules come up later —
// currently just the one requested: from Open, you can't skip straight
// to Resolved or Reopened.
function isDisabledOption(
    currentStatus: TicketStatus,
    wasReopened: boolean,
    optionValue: ManualStatus
): boolean {
    if (
        currentStatus === "resolved" ||
        currentStatus === "closed" ||
        currentStatus === "pending_confirmation" ||
        currentStatus === "cancelled"
    ) {
        return true
    }

    // Once a ticket has been reopened, Open stays disabled for the rest
    // of this cycle — even after moving to in_progress / on_hold —
    // until it's resolved/closed again (handled by the branch above).
    if (wasReopened && optionValue === "open") {
        return true
    }

    return false
}

export function StatusPanel({ 
    ticketId, 
    currentStatus,
    wasReopened
}: { 
    ticketId: string; 
    currentStatus: TicketStatus; 
    wasReopened: boolean;
}) {
    const [isPending, startTransition] = useTransition()

    const handleSetStatus = (status: ManualStatus) => {
        if (status === currentStatus) return
        startTransition(async () => {
            await updateTicketStatus(ticketId, status)
        })
    }

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-[#EFEFEF] bg-white p-4">
            <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-wide text-black/40">STATUS</span>

                <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-1">
                        {STATUS_OPTIONS.map((opt) => {
                            const active = currentStatus === opt.value
                            const disallowed = isDisabledOption(currentStatus, wasReopened, opt.value)
 
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    disabled={isPending || disallowed}
                                    onClick={() => handleSetStatus(opt.value)}
                                    className={`h-fit rounded-md border-[0.5px] px-3 py-1.5 text-left text-xs font-medium transition-colors disabled:opacity-50 ${
                                        active
                                            ? `border-current ${opt.bg} ${opt.text}`
                                            : "border-[#D1D1D1] text-black/50 hover:bg-[#FAFAFA]"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            )
                        })}
                    </div>

                    <CloseViaQRDialog 
                        ticketId={ticketId} 
                        mode={currentStatus === "resolved" || currentStatus === "closed" ? "reopen" : "close"}
                    />
                </div>
            </div>
        </div>
    )
}