import { Filter, Download } from 'lucide-react'
import { FILTER_GROUPS } from '@/lib/activity-format'

interface ActivityLogFiltersProps {
  filters: {
    search: string
    entityTypeFilter: string
    actionFilter: string
    actorFilter: string
  }
  options: {
    availableEntityTypes: { label: string; value: string }[]
    availableActions: { label: string; value: string }[]
  }
  actions: {
    applySearch: (value: string) => void
    applyEntityType: (entityType: string) => void
    applyAction: (action: string) => void
    applyActor: (actorId: string) => void
  }
  actors: { id: string; fullName: string }[]
  onExport: () => void
  hasData: boolean
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: '5px 13px', borderRadius: 20, border: '1px solid',
    borderColor: active ? '#6366f1' : '#e2e8f0', backgroundColor: active ? '#eef2ff' : '#fff',
    color: active ? '#4f46e5' : '#64748b', fontSize: 12, fontWeight: 600, 
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.1s',
  }
}

export function ActivityLogFilters({ 
  filters, 
  options, 
  actions, 
  actors, 
  onExport, 
  hasData 
}: ActivityLogFiltersProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <div style={{ position: 'relative' }}>
        <Filter size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
        <input
          value={filters.search}
          onChange={(e) => actions.applySearch(e.target.value)}
          placeholder="Search activity…"
          style={{ paddingLeft: 30, paddingRight: 12, height: 32, borderRadius: 7, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#0f172a', width: 240 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        <button style={pillStyle(filters.entityTypeFilter === '')} onClick={() => actions.applyEntityType('')}>All</button>
        {FILTER_GROUPS.filter((g) => options.availableEntityTypes.some((t) => t.value === g.entityType)).map((g) => (
          <button key={g.entityType} style={pillStyle(filters.entityTypeFilter === g.entityType)} onClick={() => actions.applyEntityType(g.entityType)}>
            {g.label}
          </button>
        ))}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <select value={filters.actionFilter} onChange={(e) => actions.applyAction(e.target.value)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, color: '#64748b', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
          <option value="">All actions</option>
          {options.availableActions.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
        <select value={filters.actorFilter} onChange={(e) => actions.applyActor(e.target.value)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, color: '#64748b', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
          <option value="">All users</option>
          {actors.map((a) => <option key={a.id} value={a.id}>{a.fullName}</option>)}
        </select>
        <button
          onClick={onExport}
          disabled={!hasData}
          title="Exports the rows currently loaded on screen, not the full history"
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', backgroundColor: '#fff', fontSize: 12, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
        >
          <Download size={13} /> Export
        </button>
      </div>
    </div>
  )
}