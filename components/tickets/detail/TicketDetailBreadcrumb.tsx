import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { TicketDetailData } from "@/lib/types/tickets"


export default function TicketDetailBreadcrumb ({ ticket }: { ticket: TicketDetailData }) {
    return (
        <div className="flex items-center gap-2 text-sm text-[#8A8A8A]">
            <Link href="/tickets/queue" className="flex items-center gap-1 text-[#008AAC] hover:underline font-medium">
                <ArrowLeft className="size-4" />
                Queue
            </Link>
            <ChevronRight className="size-4 stroke-[#D1D1D1]" />
            <span className="font-jetbrmono font-normal text-black/40">{ticket.ticket_number}</span>
        </div>
    )
}