import type { Database } from "@/lib/supabase/types"
import type { ManualStatus } from "@/lib/actions/ticket-actions"

export type TicketStatus = Database["public"]["Enums"]["ticket_status"]
export type TicketPriority = Database["public"]["Enums"]["ticket_priority"]

export interface TicketCategory {
    id: string
    name: string
    subcategory?: string
}

export interface QueueRequester {
    full_name: string
    employee_no: string
    department: string | null
}

export interface TicketRequester extends QueueRequester {
    id: string
}

export interface TicketAssignee {
    id: string
    full_name: string | null
    role?: string | null
}

export interface QueueTicket {
    id: string
    ticket_number: string
    title: string
    description: string
    status: ManualStatus
    priority: TicketPriority
    created_at: string
    due_at: string | null
    first_response_due_at: string | null
    first_response_at: string | null
    resolved_at: string | null
    category: TicketCategory | null
    requester: QueueRequester | null
    assigned_to: TicketAssignee | null
    comment_count: number
    attachment_count: number
}

export interface TicketDetailData {
    id: string
    ticket_number: string
    title: string
    description: string
    status: ManualStatus
    priority: TicketPriority
    created_at: string
    due_at: string | null
    first_response_due_at: string | null
    first_response_at: string | null
    resolved_at: string | null
    closed_at: string | null
    category: TicketCategory | null
    requester: TicketRequester | null
    assigned_to: TicketAssignee | null
}

export interface QueueFilters {
    search?: string
    status?: ManualStatus | "all"
    priority?: TicketPriority | "all"
    category?: string | "all" // category NAME, since that's what the toolbar/URL param uses
}

export function filterTickets(tickets: QueueTicket[], filters: QueueFilters): QueueTicket[] {
    return tickets.filter((ticket) => {
        if (filters.status && filters.status !== "all" && ticket.status !== filters.status) {
            return false
        }
        if (filters.priority && filters.priority !== "all" && ticket.priority !== filters.priority) {
            return false
        }
        if (filters.category && filters.category !== "all" && ticket.category?.name !== filters.category) {
            return false
        }
        if (filters.search) {
            const q = filters.search.toLowerCase()
            const matchesTitle = ticket.title.toLowerCase().includes(q)
            const matchesNumber = ticket.ticket_number.toLowerCase().includes(q)
            const matchesRequester = (ticket.requester?.full_name ?? '').toLowerCase().includes(q)
            if (!matchesTitle && !matchesNumber && !matchesRequester) return false
        }
        return true
    })
}

export type { SlaState } from "@/lib/utils/sla-utils"