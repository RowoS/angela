'use client'

import { useMemo } from 'react'
import type { ActivityLogRow, StaffRole } from '@/lib/types/activity'
import { useActivityLogs } from '@/hooks/use-activity-log'
import { toCsv, groupLogsByDate } from '@/lib/utils/activity-utils'
import { ActivityLogFilters } from './ActivityLogFilters'
import { ActivityLogItem } from './ActivityLogItem'

export function ActivityLogPage({
  role,
  initialLogs,
  actors,
}: {
  role: StaffRole
  initialLogs: ActivityLogRow[]
  actors: { id: string; fullName: string }[]
}) {
  const { logs, error, isPending, hasMore, filters, options, actions } = useActivityLogs(role, initialLogs)
  
  const groupedLogs = useMemo(() => groupLogsByDate(logs), [logs])

  const handleExport = () => {
    const blob = new Blob([toCsv(logs)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <ActivityLogFilters 
        filters={filters} 
        options={options} 
        actions={actions} 
        actors={actors} 
        onExport={handleExport} 
        hasData={logs.length > 0} 
      />

      {error && <p style={{ fontSize: 13, color: '#dc2626' }}>{error}</p>}

      <div style={{ fontSize: 12, color: '#94a3b8' }}>
        <strong style={{ color: '#64748b' }}>{logs.length}</strong> {logs.length === 1 ? 'entry' : 'entries'} loaded
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {Object.entries(groupedLogs).map(([date, entries]) => (
          <div key={date}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              {date}
              <div style={{ flex: 1, height: 1, backgroundColor: '#f1f5f9' }} />
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e8ecf2', overflow: 'hidden' }}>
              {entries.map((entry, i) => (
                <ActivityLogItem key={entry.id} entry={entry} isLast={i === entries.length - 1} />
              ))}
            </div>
          </div>
        ))}

        {logs.length === 0 && !isPending && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: 13 }}>No activity entries match the current filters.</div>
        )}
      </div>

      {hasMore && (
        <button onClick={actions.loadMore} disabled={isPending} style={{ alignSelf: 'center', fontSize: 13, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', opacity: isPending ? 0.5 : 1 }}>
          {isPending ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  )
}