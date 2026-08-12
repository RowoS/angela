'use client'

import { useState } from 'react'
import { SlaSettingsForm } from '@/components/settings/SLASettingsForm'
import { CategorySettingsForm } from '@/components/settings/CategorySettingsForm'
import { UserSettingsForm } from '@/components/settings/UserSettingsForm'
import { NotificationSettingsForm } from '@/components/settings/NotificationsSettingsForm'
import type { SlaRow } from '@/lib/utils/sla-utils'
import type { CategoryWithChildren } from '@/lib/utils/category-utils'
import type { UserRow } from '@/lib/utils/user-utils'
import type { NotificationSettingRow } from '@/lib/utils/notification-utils'

type SettingsTab = 'categories' | 'slas' | 'users' | 'notifications'

const TABS: { key: SettingsTab; label: string }[] = [
  { key: 'categories', label: 'Categories & Subcategories' },
  { key: 'slas', label: 'SLA Policies' },
  { key: 'users', label: 'Users & Roles' },
  { key: 'notifications', label: 'Notifications' },
]

interface SettingsShellProps {
  slas: SlaRow[]
  categories: CategoryWithChildren[]
  users: UserRow[]
  notificationSettings: NotificationSettingRow[]
}

export function SettingsShell({ slas, categories, users, notificationSettings }: SettingsShellProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('categories')

  const tabStyle = (tab: SettingsTab): React.CSSProperties => ({
    padding: '8px 14px', borderRadius: 7,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: 'none', fontFamily: 'inherit',
    backgroundColor: activeTab === tab ? '#eef2ff' : 'transparent',
    color: activeTab === tab ? '#4f46e5' : '#64748b',
    textAlign: 'left', transition: 'all 0.1s', width: '100%',
  })

  return (
    <div style={{ padding: 28, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* Tab sidebar */}
      <div style={{ width: 200, flexShrink: 0, backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e8ecf2', padding: 10 }}>
        {TABS.map((t) => (
          <button key={t.key} style={tabStyle(t.key)} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {activeTab === 'categories' && (
          <CategorySettingsForm initialCategories={categories} slas={slas} />
        )}

        {activeTab === 'slas' && (
          <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e8ecf2', padding: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 0, marginBottom: 4 }}>SLA Policies</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 0, marginBottom: 20 }}>Define response and resolution time targets by priority</p>
            <SlaSettingsForm initialSlas={slas} />
          </div>
        )}

        {activeTab === 'users' && (
          <UserSettingsForm initialUsers={users} />
        )}

        {activeTab === 'notifications' && (
          <NotificationSettingsForm initialSettings={notificationSettings} />
        )}
      </div>
    </div>
  )
}