import { notFound, redirect } from 'next/navigation'
import {
  getTicketDetail,
  getAssignableStaff,
  getTicketComments,
  getTicketAttachments,
  getCurrentProfile,
} from '@/lib/actions/ticket-actions'
import { getActivityLog } from '@/lib/actions/activity-actions'
import { TicketDetailView } from '@/app/(authenticated)/tickets/components/TicketDetailView'

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const ticket = await getTicketDetail(id)
  if (!ticket) notFound()
  if (ticket.status === 'pending_confirmation') redirect(`/tickets/pending/${id}`)

  const [staff, comments, attachments, activity, profile] = await Promise.all([
    getAssignableStaff(),
    getTicketComments(id),
    getTicketAttachments(id),
    getActivityLog({ entityType: 'ticket', entityId: id, limit: 50 }),
    getCurrentProfile(),
  ])

    // Free derivation off the audit trail already fetched above — no
    // separate query for "who filed this," see ticket.draft_created.
    const createdByEntry = activity.find((a) => a.action === 'ticket.draft_created')
    let createdByName: string | null = null
    if (createdByEntry?.actorId) {
        const staffMatch = staff.find((s) => s.id === createdByEntry.actorId)
        createdByName = staffMatch?.full_name ?? null
    }
  
    return (
        <div className="flex flex-col w-full">
        <TicketDetailView
            ticket={ticket}
            staff={staff}
            comments={comments}
            attachments={attachments}
            activity={activity}
            createdByName={createdByName}
            isReadOnly={profile.role === 'manager'}
        />
        </div>
    )
}