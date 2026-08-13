import { requireAdmin } from '@/lib/auth/require-admin'
import { getSlas } from '@/lib/actions/sla-actions'
import { getCategories } from '@/lib/actions/category-actions'
import { listUsers } from '@/lib/actions/user-actions'
import { getNotificationSettings } from '@/lib/actions/notification-actions'
import { SettingsShell } from './components/SettingsShell'

export default async function SettingsPage() {
  // Gates the whole page — redirects non-admins before any of the
  // queries below run. Each individual action re-checks on its own
  // (RLS, or requireRole for the service-role user actions), so this
  // is a UX short-circuit, not the only line of defense.
  const user = await requireAdmin()

  const [slas, categories, users, notificationSettings] = await Promise.all([
    getSlas(),
    getCategories(),
    listUsers(),
    getNotificationSettings(),
  ])

  return (
    <SettingsShell
      slas={slas}
      categories={categories}
      users={users}
      notificationSettings={notificationSettings}
      currentUserId={user.id}
    />
  )
}