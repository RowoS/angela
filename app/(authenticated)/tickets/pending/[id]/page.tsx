import { notFound, redirect } from 'next/navigation'
import { getTicketDetail, getTicketAttachments } from '@/lib/actions/ticket-actions'
import { PendingTicketClientView } from '@/app/(authenticated)/tickets/components/PendingTicketClientView'

export default async function PendingTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ticket = await getTicketDetail(id)

  if (!ticket) notFound()
  if (ticket.status === 'cancelled') redirect('/tickets/queue')
  if (ticket.status !== 'pending_confirmation') redirect(`/tickets/${id}`)

  const attachments = await getTicketAttachments(id)

  return (
    <div className="flex flex-col w-full">
      
      {/* Hand off the rendering to the Client Component */}
      <PendingTicketClientView ticket={ticket} attachments={attachments} />
    </div>
  )
}