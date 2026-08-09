import { metaFor, describeActivity } from '@/lib/activity-format'
import { getInitials, ROLE_COLORS } from '@/lib/utils/activity-utils'
import type { ActivityLogRow } from '@/lib/types/activity'

export function ActivityLogItem({ entry, isLast }: { entry: ActivityLogRow, isLast: boolean }) {
  const meta = metaFor(entry.action)
  const roleColor = entry.actorRole ? ROLE_COLORS[entry.actorRole] : '#94a3b8'

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 20px', borderBottom: isLast ? 'none' : '1px solid #f8fafc' }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
        {meta.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: meta.bg, color: meta.color, borderRadius: 10, padding: '2px 8px', whiteSpace: 'nowrap' }}>
            {meta.label}
          </span>
          {entry.subject && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', fontFamily: 'var(--font-mono)' }}>{entry.subject}</span>
          )}
        </div>
        <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{describeActivity(entry)}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: roleColor + '22', border: `1.5px solid ${roleColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: roleColor }}>{entry.actorName ? getInitials(entry.actorName) : '⚙'}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{entry.actorName ?? 'System'}</span>
        </div>
        <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
          {new Date(entry.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}