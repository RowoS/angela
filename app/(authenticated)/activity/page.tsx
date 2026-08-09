import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActivityLog, getActivityActors } from '@/lib/actions/activity-actions'
import { ActivityLogPage } from './components/ActivityLogPage'

export default async function ActivityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role

  if (role !== 'admin' && role !== 'agent') redirect('/unauthorized')

  const [initialLogs, actors] = await Promise.all([
    getActivityLog({ limit: 25 }),
    getActivityActors(),
  ])

  return <ActivityLogPage role={role} initialLogs={initialLogs} actors={actors} />
}