'use client';

import type { Database } from '@/lib/supabase/types';
import { EVENT_TYPE_STYLES, EVENT_TYPE_ORDER, segmentButton } from '@/lib/calendar-styles';

type EventType = Database['public']['Enums']['event_type'];
type Owner = { id: string; full_name: string; department: string | null };

interface Props {
  selectedTypes?: EventType[];
  selectedOwnerId?: string;
  owners: Owner[];
  onChange: (next: { eventTypes?: string[]; ownerId?: string }) => void;
}

export function CalendarFilters({ selectedTypes, selectedOwnerId, owners, onChange }: Props) {
  const activeTypes = selectedTypes ?? [];

  function toggleType(type: EventType) {
    const next = activeTypes.includes(type) ? activeTypes.filter((t) => t !== type) : [...activeTypes, type];
    onChange({ eventTypes: next, ownerId: selectedOwnerId });
  }

  function clearAll() {
    onChange({ eventTypes: [], ownerId: undefined });
  }

  const hasActiveFilters = activeTypes.length > 0 || !!selectedOwnerId;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Filter:</span>

      <div className="flex flex-wrap gap-1.5">
        {EVENT_TYPE_ORDER.map((type) => {
          const style = EVENT_TYPE_STYLES[type];
          const active = activeTypes.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              aria-pressed={active}
              className={`${segmentButton(active)} flex items-center gap-1.5`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </button>
          );
        })}
      </div>

      <select
        value={selectedOwnerId ?? ''}
        onChange={(e) => onChange({ eventTypes: activeTypes, ownerId: e.target.value || undefined })}
        className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-500"
      >
        <option value="">All owners</option>
        {owners.map((owner) => (
          <option key={owner.id} value={owner.id}>
            {owner.full_name}{owner.department ? ` (${owner.department})` : ''}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button type="button" onClick={clearAll} className="ml-auto text-xs font-medium text-slate-400 underline hover:text-slate-600">
          Clear filters
        </button>
      )}
    </div>
  );
}