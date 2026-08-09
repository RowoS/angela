import { useState, useTransition, useRef, useEffect, useMemo } from 'react'
import { getActivityLog, type GetActivityLogFilters } from '@/lib/actions/activity-actions'
import { entityTypesFor, actionsFor } from '@/lib/activity-format'
import type { ActivityLogRow, StaffRole } from '@/lib/types/activity'

const PAGE_SIZE = 25
const SEARCH_DEBOUNCE_MS = 300

export function useActivityLogs(role: StaffRole, initialLogs: ActivityLogRow[]) {
  const [logs, setLogs] = useState(initialLogs)
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [actorFilter, setActorFilter] = useState('')
  const [search, setSearch] = useState('')
  const [hasMore, setHasMore] = useState(initialLogs.length === PAGE_SIZE)
  const [error, setError] = useState<string | null>(null)
  
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const availableEntityTypes = useMemo(() => entityTypesFor(role), [role])
  const availableActions = useMemo(() => actionsFor(entityTypeFilter, role), [entityTypeFilter, role])

  const currentFilters = (): GetActivityLogFilters => ({
    entityType: entityTypeFilter || undefined,
    action: actionFilter || undefined,
    actorId: actorFilter || undefined,
    search: search || undefined,
  })

  const fetchLogs = (filters: GetActivityLogFilters) => {
    setError(null)
    startTransition(async () => {
      try {
        const data = await getActivityLog({ ...filters, limit: PAGE_SIZE })
        setLogs(data)
        setHasMore(data.length === PAGE_SIZE)
      } catch {
        setError("Couldn't load activity for that filter.")
      }
    })
  }

  const applyEntityType = (entityType: string) => {
    setEntityTypeFilter(entityType)
    const nextAction = actionsFor(entityType, role).some((a) => a.value === actionFilter) ? actionFilter : ''
    setActionFilter(nextAction)
    fetchLogs({ ...currentFilters(), entityType: entityType || undefined, action: nextAction || undefined })
  }

  const applyAction = (action: string) => {
    setActionFilter(action)
    fetchLogs({ ...currentFilters(), action: action || undefined })
  }

  const applyActor = (actorId: string) => {
    setActorFilter(actorId)
    fetchLogs({ ...currentFilters(), actorId: actorId || undefined })
  }

  const applySearch = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchLogs({ ...currentFilters(), search: value || undefined })
    }, SEARCH_DEBOUNCE_MS)
  }

  const loadMore = () => {
    const last = logs.at(-1)
    if (!last) return
    setError(null)
    startTransition(async () => {
      try {
        const data = await getActivityLog({ ...currentFilters(), limit: PAGE_SIZE, before: last.createdAt })
        setLogs((prev) => [...prev, ...data])
        setHasMore(data.length === PAGE_SIZE)
      } catch {
        setError("Couldn't load more activity.")
      }
    })
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  return {
    logs, error, isPending, hasMore,
    filters: { search, entityTypeFilter, actionFilter, actorFilter },
    options: { availableEntityTypes, availableActions },
    actions: { applySearch, applyEntityType, applyAction, applyActor, loadMore }
  }
}