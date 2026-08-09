import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { QueueTicket } from "@/lib/types/tickets"
import { QueueRow } from "./QueueRow"
import { QueueCard } from "./QueueCard"

const COLUMNS = ["TICKET #", "TITLE / EMPLOYEE", "CATEGORY", "PRIORITY", "STATUS", "ASSIGNED TO", "DUE", "SLA"]

export function QueueTable({ tickets }: { tickets: QueueTicket[] }) {
    if (tickets.length === 0) {
        return (
            <div className="rounded-xl border border-[#EFEFEF] bg-white py-16 text-center text-sm text-[#8A8A8A]">
                No tickets match the current filters.
            </div>
        )
    }

    return (
        <>
            <div className="hidden overflow-hidden rounded-xl border border-[#EFEFEF] bg-white md:flex">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            {COLUMNS.map((col) => (
                                <TableHead
                                    key={col}
                                    className="bg-[#3B9AB4] px-3 py-3.5 text-xs font-bold tracking-wide text-white first:rounded-tl-xl last:rounded-tr-xl"
                                >
                                    {col}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.map((ticket) => (
                            <QueueRow key={ticket.id} ticket={ticket} />
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
                {tickets.map((ticket) => (
                    <QueueCard key={ticket.id} ticket={ticket} />
                ))}
            </div>
        </>
    )
}