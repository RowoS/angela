import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getDashboardCounts,
  getRecentTickets,
  getTicketsByCategory,
  getTicketsOpenedOverTime,
  getRecentActivity,
  getAgentWorkload,
  getAvgFirstResponse,
} from '@/lib/actions/dashboard-actions'
import { DashboardView } from "@/components/dashboard/DashboardView"


export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'agent', 'manager'].includes(profile.role)) {
    redirect('/login')
  }

  const isAdmin = profile.role === 'admin'

  const [countsResult, recentResult, categoryResult, openedResult, activityResult, workloadResult, avgResponseResult] =
    await Promise.allSettled([
      getDashboardCounts(),
      getRecentTickets(),
      getTicketsByCategory(),
      getTicketsOpenedOverTime('week'),
      isAdmin ? getRecentActivity() : Promise.resolve(null),
      isAdmin ? getAgentWorkload() : Promise.resolve(null),
      isAdmin ? getAvgFirstResponse() : Promise.resolve(null),
    ])

  return (
    <DashboardView
      role={profile.role as 'admin' | 'agent' | 'manager'}
      counts={countsResult.status === 'fulfilled' ? countsResult.value : null}
      recentTickets={recentResult.status === 'fulfilled' ? recentResult.value : null}
      byCategory={categoryResult.status === 'fulfilled' ? categoryResult.value : null}
      initialOpened={openedResult.status === 'fulfilled' ? openedResult.value : null}
      recentActivity={activityResult.status === 'fulfilled' ? activityResult.value : null}
      agentWorkload={workloadResult.status === 'fulfilled' ? workloadResult.value : null}
      avgFirstResponse={avgResponseResult.status === 'fulfilled' ? avgResponseResult.value : null}
    />
  )
}