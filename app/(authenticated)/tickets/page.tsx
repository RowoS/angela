import { getTicketQueue } from '@/lib/actions/ticket-actions'
import { TicketQueue } from './components/TicketQueue'
import DashboardHeader from '@/components/DashboardHeader'

export default async function TicketsPage() {
  const tickets = await getTicketQueue()


  return (
    <>
        <div className="flex flex-col w-full">
        <DashboardHeader menuItem="Tickets" />
        <TicketQueue tickets={tickets} />
        </div>
    </>
  )
}