import { notFound } from "next/navigation"
import {
    getTicketDetail,
    getTicketComments,
    getTicketAttachments,
    getAssignableStaff,
    getWasReopened
} from "@/lib/actions/ticket-actions"
import { getTicketAuditTrail } from "@/lib/actions/activity-actions"
import { mapAuditRowsToEntries } from "@/lib/audit-log-adapters"
import { TicketDetailHeader } from "@/components/tickets/detail/TicketDetailHeader"
import { TicketTabs } from "@/components/tickets/detail/TicketTabs"
import { CommentsPanel } from "@/components/tickets/detail/CommentsPanel"
import { AuditLogPanel } from "@/components/tickets/detail/AuditLogPanel"
import { AttachmentsPanel } from "@/components/tickets/detail/AttachmentsPanel"
import { EmployeeCard } from "@/components/tickets/detail/EmployeeCard"
import { StatusPanel } from "@/components/tickets/detail/StatusPanel"
import { DetailsPanel } from "@/components/tickets/detail/DetailsPanel"
import { AssignPanel } from "@/components/tickets/detail/AssignPanel"
import { CloseTicketCard } from "@/components/tickets/detail/CloseTicketCard"
import TicketDetailBreadcrumb from "@/components/tickets/detail/TicketDetailBreadcrumb"

interface TicketDetailPageProps {
    params: Promise<{ id: string }>
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
    const { id } = await params

    // Fetched in parallel — these are independent queries, no reason to
    // wait on one before starting the next.
    const [ticket, comments, attachments, staff, wasReopened, auditTrail] = await Promise.all([
        getTicketDetail(id),
        getTicketComments(id),
        getTicketAttachments(id),
        getAssignableStaff(),
        getWasReopened(id),
        getTicketAuditTrail(id),
    ])

    if (!ticket) notFound()

    const auditEntries = mapAuditRowsToEntries(auditTrail, staff)

    return (
        <div className="flex flex-col w-full gap-5">
            {/* Breadcrumb */}
            <TicketDetailBreadcrumb ticket={ticket} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[7fr_3fr] lg:grid-rows-[auto_1fr]">
                <div className="order-1 flex w-full flex-col gap-3 lg:col-start-1 lg:row-start-1">
                    <TicketDetailHeader ticket={ticket} attachments={attachments} />
                </div>

                <div className="order-2 flex w-full flex-col gap-3 lg:col-start-2 lg:row-start-1 lg:row-span-2">
                    <EmployeeCard requester={ticket.requester} status={ticket.status} />
                    <StatusPanel
                        ticketId={ticket.id}
                        currentStatus={ticket.status}
                        wasReopened={wasReopened}
                    />
                    <CloseTicketCard ticketId={ticket.id} currentStatus={ticket.status} />
                    <DetailsPanel ticket={ticket} />
                    <AssignPanel
                        ticketId={ticket.id}
                        currentAssigneeId={ticket.assigned_to?.id ?? null}
                        staff={staff}
                    />
                </div>

                <div className="order-3 w-full lg:col-start-1 lg:row-start-2">
                    <TicketTabs
                        commentCount={comments.length}
                        attachmentCount={attachments.length}
                        commentsPanel={<CommentsPanel ticketId={ticket.id} comments={comments} />}
                        auditPanel={<AuditLogPanel entries={auditEntries} />}
                        attachmentsPanel={<AttachmentsPanel ticketId={ticket.id} attachments={attachments} />}
                    />
                </div>
            </div>
        </div>
    )
}