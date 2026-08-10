import { Suspense } from "react"
import { getTicketQueue } from "@/lib/actions/ticket-actions" // ADJUST if your actual actions file lives elsewhere
import { filterTickets, QueueFilters } from "@/lib/types/tickets"
import type { TicketStatus, TicketPriority } from "@/lib/types/tickets"
import { QueueToolbar } from "@/components/tickets/QueueToolbar"
import { QueueTable } from "@/components/tickets/QueueTable"

interface QueuePageProps {
    searchParams: Promise<{
        status?: string
        priority?: string
        category?: string
        search?: string
    }>
}

export default async function QueuePage({ searchParams }: QueuePageProps) {
    const params = await searchParams

    const allTickets = await getTicketQueue({ assignedToSelf: false })

    const filters: QueueFilters = {
        status: (params.status as TicketStatus | "all") ?? "all",
        priority: (params.priority as TicketPriority | "all") ?? "all",
        category: params.category ?? "all",
        search: params.search ?? "",
    }

    const tickets = filterTickets(allTickets, filters)

    const categories = Array.from(
        new Set(allTickets.map((t) => t.category?.name).filter((name): name is string => !!name))
    ).sort()

    return (
        <div className="flex flex-col gap-4">
            <Suspense fallback={null}>
                <QueueToolbar categories={categories} />
            </Suspense>

            <QueueTable tickets={tickets} />
        </div>
    )
}