'use client';

import { useEffect, useRef } from 'react';
import { format, isToday } from 'date-fns';
import { HOUR_HEIGHT, GRID_START_HOUR, GRID_END_HOUR, layoutDayEvents } from '@/lib/calendar-time-grid';
import { eventTypeStyle, PANEL } from '@/lib/calendar-styles';
import type { getEvents } from '@/lib/actions/calendar-actions';

type CalendarEvent = Awaited<ReturnType<typeof getEvents>>[number];

interface Props {
  day: Date;
  events: CalendarEvent[];
  onSlotClick: (dateTime: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, i) => GRID_START_HOUR + i);

export function CalendarDayView({ day, events, onSlotClick, onEventClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const positioned = layoutDayEvents(events, day);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 7 * HOUR_HEIGHT });
  }, [day]);

  return (
    <div className={`${PANEL} flex flex-col`}>
      <div className="border-b border-slate-100 py-2.5 text-center">
        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{format(day, 'EEEE')}</div>
        <div className={`text-sm font-bold ${isToday(day) ? 'text-indigo-600' : 'text-slate-900'}`}>{format(day, 'MMMM d, yyyy')}</div>
      </div>

      <div ref={scrollRef} className="max-h-150 overflow-y-auto">
        <div className="grid grid-cols-[60px_1fr]">
          <div className="relative" style={{ height: HOUR_HEIGHT * HOURS.length }}>
            {HOURS.map((hour) => (
              <div key={hour} className="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-slate-400" style={{ top: hour * HOUR_HEIGHT }}>
                {format(new Date(2000, 0, 1, hour), 'h a')}
              </div>
            ))}
          </div>

          <div className="relative border-l border-slate-100" style={{ height: HOUR_HEIGHT * HOURS.length }}>
            {HOURS.map((hour) => (
              <button
                key={hour}
                onClick={() => { const slot = new Date(day); slot.setHours(hour, 0, 0, 0); onSlotClick(slot); }}
                className="absolute inset-x-0 border-t border-slate-100 hover:bg-indigo-50/50"
                style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                aria-label={`Create event at ${format(new Date(2000, 0, 1, hour), 'h a')}`}
              />
            ))}

            {positioned.map(({ event, top, height, lane, laneCount }) => {
              const style = eventTypeStyle(event.event_type);
              return (
                <div
                  key={event.id}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                  className={`absolute overflow-hidden rounded border-l-[3px] px-2 py-1 text-xs leading-tight ${style.bg} ${style.text} ${style.border}`}
                  style={{ top, height, left: `${(lane / laneCount) * 100}%`, width: `${100 / laneCount}%` }}
                >
                  <div className="truncate font-semibold">{event.title}</div>
                  <div className="truncate text-[11px] opacity-75">
                    {format(new Date(event.starts_at), 'h:mm a')} – {format(new Date(event.ends_at), 'h:mm a')} · {event.owner.full_name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}