import { Paperclip } from "lucide-react"
import type { TicketDetailData } from "@/lib/types/tickets"
import { PriorityBadge } from "@/components/tickets/PriorityBadge"
import { StatusBadge } from "@/components/tickets/StatusBadge"
import { SLABadge } from "@/components/tickets/SLABadge" // matches QueueRow's casing — confirm this is the real filename
import { QRConfirmedBadge } from "./QRConfirmedBadge"
import { getSlaState } from "@/lib/utils/sla-utils"
import type { AttachmentRow } from "@/lib/types/tickets"

export function TicketDetailHeader({ ticket, attachments }: { ticket: TicketDetailData; attachments: AttachmentRow[] }) {
    const slaState = getSlaState(ticket)

    return (
        <div className="flex flex-row gap-4 h-fit w-full px-[18px] py-5 items-center justify-center rounded-lg bg-white">
            <div className="flex flex-col gap-3.5 w-full h-fit">
                <div className="flex flex-row flex-wrap items-center gap-2">
                    <span className="font-jetbrmono text-xs font-medium text-[#008AAC]">{ticket.ticket_number}</span>
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                    <SLABadge state={slaState} />
                    <QRConfirmedBadge status={ticket.status} />
                </div>

                <div className="flex flex-col gap-4">
                    <h1 className="text-lg font-bold text-[#26343A]">{ticket.title}</h1>
                    <p className="text-sm text-[#000000]/75 font-normal">{ticket.description}</p>
                </div>
                
                {attachments.length > 0 && (
                    <div className="flex flex-row flex-wrap gap-1.5">
                        {attachments.map((a) => (
                            <span
                                key={a.id}
                                className="flex items-center gap-1.5 rounded-sm border-[0.5px] border-[#D2CECE] px-2.5 py-1.5 text-xs text-[#625757]"
                            >
                                <Paperclip className="size-3.5 stroke-[#6366F1]" />
                                {a.original_filename}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}