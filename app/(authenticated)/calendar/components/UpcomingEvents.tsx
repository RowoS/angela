'use client';

import { format } from 'date-fns';
import { eventTypeStyle, PANEL } from '@/lib/calendar-styles';
import type { getUpcomingEvents } from '@/lib/actions/calendar-actions';

type UpcomingEvent = Awaited<ReturnType<typeof getUpcomingEvents>>[number];

interface Props {
  events: UpcomingEvent[];
  isLoading: boolean;
  onEventClick: (event: UpcomingEvent) => void;
}

export function UpcomingEvents({ events, isLoading, onEventClick }: Props) {
  return (
    <div className={`${PANEL} p-5`}>
      <div className="mb-3 text-sm font-bold text-slate-900">Upcoming Events</div>

      {isLoading && <p className="text-xs text-slate-400">Loading…</p>}
      {!isLoading && events.length === 0 && <p className="text-xs text-slate-400">Nothing scheduled.</p>}

      <div className="flex flex-col gap-2.5">
        {events.map((event) => {
          const style = eventTypeStyle(event.event_type);
          return (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className="flex items-start gap-3 rounded-md p-1 text-left hover:bg-slate-50"
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900">{event.title}</div>
                <div className="mt-0.5 truncate text-xs text-slate-400">
                  {format(new Date(event.starts_at), 'MMM d')} ·{' '}
                  {format(new Date(event.starts_at), 'h:mm a')} – {format(new Date(event.ends_at), 'h:mm a')} ·{' '}
                  {event.owner.full_name}
                </div>
              </div>
              <span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${style.bg} ${style.text}`}>
                {style.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}