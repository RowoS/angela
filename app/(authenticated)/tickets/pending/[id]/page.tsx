import { notFound } from 'next/navigation'
import DashboardHeader from '@/components/DashboardHeader'
import { getTicketDetail } from '@/lib/actions/ticket-actions'
import { ManualConfirmationFallback } from '@/app/(authenticated)/tickets/components/ManualConfirmationFallback'

export default async function PendingTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ticket = await getTicketDetail(id)
  if (!ticket) notFound()

  return (
    <div className="flex flex-col w-full">
      <DashboardHeader menuItem={ticket.ticket_number} />
      <div className="flex flex-col items-center gap-4 p-10">
        <p className="text-sm text-slate-500">
          <strong className="text-slate-900">{ticket.title}</strong> is awaiting the requester&apos;s QR
          confirmation before it enters the queue.
        </p>
        <ManualConfirmationFallback ticketId={ticket.id} />
      </div>
    </div>
  )
}