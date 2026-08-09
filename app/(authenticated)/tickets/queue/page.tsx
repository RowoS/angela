import { getTicketQueue } from '@/lib/actions/ticket-actions'
import { TicketQueue } from '../components/TicketQueue'

export default async function TicketsPage() {
  const tickets = await getTicketQueue()


  return (
    <>
        <div className="flex flex-col w-full">
        <TicketQueue tickets={tickets} />
        </div>
    </>
  )
}