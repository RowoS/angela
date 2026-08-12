import { QrCode } from "lucide-react"

// Derived, not stored: TicketDetailData has no explicit "confirmed" flag,
// so this infers it from status — a ticket past pending_confirmation has,
// by definition, been confirmed (that's the only way out of that state
// per confirmTicketCreation). Flag if there's a real confirmed_at column
// this should read from instead.
export function QRConfirmedBadge({ status }: { status: string }) {
    if (status === "pending_confirmation") return null

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#4F46E5]/10 px-2 py-1 text-[10px] font-medium text-[#4F46E5]">
            <QrCode className="size-3" />
            QR Confirmed
        </span>
    )
}