'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import {
  addDays, addMonths, addWeeks, endOfWeek,
  format, startOfDay, startOfMonth, startOfWeek, subDays, subMonths, subWeeks,
} from 'date-fns';
import { useCalendarEvents } from '@/hooks/use-calendar-events';
import { useCalendarFilters } from '@/hooks/use-calendar-filters';
import { useUpcomingEvents } from '@/hooks/use-upcoming-events';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarDayView } from './CalendarDayView';
import { CalendarFilters } from './CalendarFilters';
import { EventForm } from './EventForm';
import { EventDetail } from './EventDetails';
import { UpcomingEvents } from './UpcomingEvents';
import { ICON_BTN, PRIMARY_BTN, segmentButton } from '@/lib/calendar-styles';
import type { Database } from '@/lib/supabase/types';
import type { getEvents } from '@/lib/actions/calendar-actions';

type CalendarEvent = Awaited<ReturnType<typeof getEvents>>[number];
type ViewMode = 'month' | 'week' | 'day';
type ComposerState =
  | { mode: 'closed' }
  | { mode: 'create'; prefillDate?: Date }
  | { mode: 'edit'; event: CalendarEvent };

interface Props {
  currentUserId: string;
  currentUserRole: Database['public']['Enums']['roles'];
  owners: { id: string; full_name: string; department: string | null }[];
}

function getRange(view: ViewMode, anchor: Date) {
  if (view === 'month') return { from: startOfMonth(anchor), to: startOfMonth(addMonths(anchor, 1)) };
  if (view === 'week') return { from: startOfWeek(anchor), to: addWeeks(startOfWeek(anchor), 1) };
  return { from: startOfDay(anchor), to: addDays(startOfDay(anchor), 1) };
}

function navigate(view: ViewMode, anchor: Date, direction: 1 | -1) {
  if (view === 'month') return direction === 1 ? addMonths(anchor, 1) : subMonths(anchor, 1);
  if (view === 'week') return direction === 1 ? addWeeks(anchor, 1) : subWeeks(anchor, 1);
  return direction === 1 ? addDays(anchor, 1) : subDays(anchor, 1);
}

function headerLabel(view: ViewMode, anchor: Date) {
  if (view === 'month') return format(anchor, 'MMMM yyyy');
  if (view === 'week') {
    return `${format(startOfWeek(anchor), 'MMM d')} – ${format(endOfWeek(anchor), 'MMM d, yyyy')}`;
  }
  return format(anchor, 'MMMM d, yyyy');
}

export function CalendarShell({ currentUserId, currentUserRole, owners }: Props) {
  const [view, setView] = useState<ViewMode>('month');
  const [anchor, setAnchor] = useState(() => new Date());
  const [composer, setComposer] = useState<ComposerState>({ mode: 'closed' });
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
  const { eventTypes, ownerId, setFilters } = useCalendarFilters();

  const { from, to } = getRange(view, anchor);
  const { events, isLoading, error, refresh } = useCalendarEvents({
    from: from.toISOString(),
    to: to.toISOString(),
    eventTypes,
    ownerId,
  });

  const { events: upcomingEvents, isLoading: isLoadingUpcoming } = useUpcomingEvents({
    eventTypes,
    ownerId,
    limit: 5,
  });

  function handleSlotClick(dateTime: Date) {
    setComposer({ mode: 'create', prefillDate: dateTime });
  }

  function handleEventClick(event: CalendarEvent) {
    setDetailEvent(event);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button onClick={() => setAnchor((a) => navigate(view, a, -1))} aria-label="Previous" className={ICON_BTN}>
            <ChevronLeft size={14} />
          </button>
          <h2 className="min-w-40 text-center text-[15px] font-bold text-slate-900">{headerLabel(view, anchor)}</h2>
          <button onClick={() => setAnchor((a) => navigate(view, a, 1))} aria-label="Next" className={ICON_BTN}>
            <ChevronRight size={14} />
          </button>
          <button onClick={() => setAnchor(new Date())} className="ml-1 text-xs font-semibold text-indigo-600 hover:underline">
            Today
          </button>
        </div>

        <div className="flex gap-1">
          {(['month', 'week', 'day'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={segmentButton(view === v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        <button onClick={() => setComposer({ mode: 'create' })} className={`${PRIMARY_BTN} ml-auto`}>
          <Plus size={13} /> Add Event
        </button>
      </div>

      <CalendarFilters
        selectedTypes={eventTypes}
        selectedOwnerId={ownerId}
        owners={owners}
        onChange={setFilters}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {view === 'month' && (
        <CalendarMonthView month={anchor} events={events} onDayClick={handleSlotClick} onEventClick={handleEventClick} />
      )}
      {view === 'week' && (
        <CalendarWeekView weekOf={anchor} events={events} onSlotClick={handleSlotClick} onEventClick={handleEventClick} />
      )}
      {view === 'day' && (
        <CalendarDayView day={anchor} events={events} onSlotClick={handleSlotClick} onEventClick={handleEventClick} />
      )}

      {isLoading && <p className="text-xs text-slate-400">Refreshing…</p>}

      <UpcomingEvents events={upcomingEvents} isLoading={isLoadingUpcoming} onEventClick={handleEventClick} />

      {composer.mode !== 'closed' && (
        <EventForm
          mode={composer.mode}
          initialDate={composer.mode === 'create' ? composer.prefillDate : undefined}
          event={composer.mode === 'edit' ? composer.event : undefined}
          onClose={() => setComposer({ mode: 'closed' })}
          onSaved={() => { setComposer({ mode: 'closed' }); refresh(); }}
        />
      )}

      {detailEvent && (
        <EventDetail
          event={detailEvent}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onClose={() => setDetailEvent(null)}
          onEdit={() => { setComposer({ mode: 'edit', event: detailEvent }); setDetailEvent(null); }}
          onDeleted={() => { setDetailEvent(null); refresh(); }}
        />
      )}
    </div>
  );
}