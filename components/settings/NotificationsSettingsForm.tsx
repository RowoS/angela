'use client'

import { useState, useTransition } from 'react'
import { updateNotificationSetting } from '@/lib/actions/notification-actions'
import {
  NOTIFICATION_EVENT_LABELS,
  type NotificationSettingRow,
  type NotificationEvent,
} from '@/lib/utils/notification-utils'

interface NotificationSettingsFormProps {
  initialSettings: NotificationSettingRow[]
}

export function NotificationSettingsForm({ initialSettings }: NotificationSettingsFormProps) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e8ecf2', padding: 28 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 0, marginBottom: 4 }}>Notification Settings</h3>
      <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 0, marginBottom: 24 }}>
        Choose which activity triggers an in-app alert for system users (Agents, Admins, Managers). Email notifications are not used in this system.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderRadius: 10, border: '1px solid #e8ecf2', overflow: 'hidden' }}>
        {initialSettings.map((setting, i) => (
          <NotificationRow
            key={setting.event_type}
            setting={setting}
            isLast={i === initialSettings.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

function NotificationRow({ setting, isLast }: { setting: NotificationSettingRow; isLast: boolean }) {
  // Optimistic locally, reverted on failure — each toggle saves itself
  // immediately rather than batching behind a page-level Save button,
  // since a single boolean per row doesn't warrant one.
  const [inApp, setInApp] = useState(setting.in_app)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleToggle = (event_type: NotificationEvent, next: boolean) => {
    setInApp(next)
    setError(null)
    startTransition(async () => {
      try {
        await updateNotificationSetting(event_type, next)
      } catch (err) {
        setInApp(!next)
        const errorMessage = err instanceof Error? err.message : String(err);
        setError(errorMessage || 'Failed to save.')
      }
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: isLast ? 'none' : '1px solid #f1f5f9', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{NOTIFICATION_EVENT_LABELS[setting.event_type]}</span>
        {error && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{error}</div>}
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: isPending ? 'default' : 'pointer' }}>
        <input
          type="checkbox"
          checked={inApp}
          disabled={isPending}
          onChange={(e) => handleToggle(setting.event_type, e.target.checked)}
          style={{ width: 14, height: 14, accentColor: '#4f46e5', cursor: isPending ? 'default' : 'pointer' }}
        />
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>In-App</span>
      </label>
    </div>
  )
}