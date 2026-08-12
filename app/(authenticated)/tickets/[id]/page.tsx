import { notFound } from "next/navigation"
import {
    getTicketDetail,
    getTicketComments,
    getTicketAttachments,
    getAssignableStaff,
} from "@/lib/actions/ticket-actions" // ADJUST if this differs from the real export path
import { TicketDetailHeader } from "@/components/tickets/detail/TicketDetailHeader"
import { TicketTabs } from "@/components/tickets/detail/TicketTabs"
import { CommentsPanel } from "@/components/tickets/detail/CommentsPanel"
import { AuditLogPanel } from "@/components/tickets/detail/AuditLogPanel"
import { AttachmentsPanel } from "@/components/tickets/detail/AttachmentsPanel"
import { EmployeeCard } from "@/components/tickets/detail/EmployeeCard"
import { StatusPanel } from "@/components/tickets/detail/StatusPanel"
import { DetailsPanel } from "@/components/tickets/detail/DetailsPanel"
import { AssignPanel } from "@/components/tickets/detail/AssignPanel"
import TicketDetailBreadcrumb from "@/components/tickets/detail/TicketDetailBreadcrumb"

interface TicketDetailPageProps {
    params: Promise<{ id: string }>
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
    const { id } = await params

    // Fetched in parallel — these are 4 independent queries, no reason to
    // wait on one before starting the next.
    const [ticket, comments, attachments, staff] = await Promise.all([
        getTicketDetail(id),
        getTicketComments(id),
        getTicketAttachments(id),
        getAssignableStaff(),
    ])

    if (!ticket) notFound()

    return (
        <div className="flex flex-col w-full gap-5">
            {/* Breadcrumb */}
            <TicketDetailBreadcrumb ticket={ticket} />

            <div className="grid grid-cols-[7fr_3fr] gap-4">
                {/* Main Column */}
                <div className="flex flex-col gap-3 w-full">
                    <TicketDetailHeader ticket={ticket} attachments={attachments} />

                    <TicketTabs
                        commentCount={comments.length}
                        attachmentCount={attachments.length}
                        commentsPanel={<CommentsPanel ticketId={ticket.id} comments={comments} />}
                        auditPanel={<AuditLogPanel />}
                        attachmentsPanel={<AttachmentsPanel ticketId={ticket.id} attachments={attachments} />}
                    />
                </div>

                {/* Sidebar Column */}
                <div className="flex flex-col gap-3 w-full">
                    <EmployeeCard requester={ticket.requester} status={ticket.status} />
                    <StatusPanel ticketId={ticket.id} currentStatus={ticket.status} />
                    <DetailsPanel ticket={ticket} />
                    <AssignPanel
                        ticketId={ticket.id}
                        currentAssigneeId={ticket.assigned_to?.id ?? null}
                        staff={staff}
                    />
                </div>
            </div>
            {/* Main column 
            <div className="flex flex-col gap-4 lg:col-span-2">
                // TO DELETE TICKETS HERE 
                <TicketDetailHeader ticket={ticket} attachments={attachments} />

                <TicketTabs
                    commentCount={comments.length}
                    attachmentCount={attachments.length}
                    commentsPanel={<CommentsPanel ticketId={ticket.id} comments={comments} />}
                    auditPanel={<AuditLogPanel />}
                    attachmentsPanel={<AttachmentsPanel ticketId={ticket.id} attachments={attachments} />}
                />
            </div>

             Sidebar column 
            <div className="flex flex-col gap-4">
                <EmployeeCard requester={ticket.requester} status={ticket.status} />
                <StatusPanel ticketId={ticket.id} currentStatus={ticket.status} />
                <DetailsPanel ticket={ticket} />
                <AssignPanel
                    ticketId={ticket.id}
                    currentAssigneeId={ticket.assigned_to?.id ?? null}
                    staff={staff}
                />
            </div> */}
        </div>
    )
}