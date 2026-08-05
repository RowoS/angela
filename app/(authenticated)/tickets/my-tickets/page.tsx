import DashboardHeader from '@/components/DashboardHeader'
import { getTicketQueue, getCurrentProfile } from '@/lib/actions/ticket-actions'
import { MyTickets } from '../components/MyTickets'

export default async function MyTicketsPage() {
  const [tickets, profile] = await Promise.all([
    getTicketQueue({ assignedToSelf: true }),
    getCurrentProfile(),
  ])

  return (
    <div className="flex flex-col w-full">
      <DashboardHeader menuItem="My Tickets" />
      <MyTickets tickets={tickets} viewerName={profile.full_name ?? 'you'} />
    </div>
  )
}