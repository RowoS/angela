'use client';

import { useEffect, useRef } from 'react';
import { eachDayOfInterval, endOfWeek, format, isToday, startOfWeek, startOfDay, endOfDay } from 'date-fns';
import { HOUR_HEIGHT, GRID_START_HOUR, GRID_END_HOUR, layoutDayEvents } from '@/lib/calendar-time-grid';
import { eventTypeStyle, PANEL } from '@/lib/calendar-styles';
import type { getEvents } from '@/lib/actions/calendar-actions';

type CalendarEvent = Awaited<ReturnType<typeof getEvents>>[number];

interface Props {
  weekOf: Date;
  events: CalendarEvent[];
  onSlotClick: (dateTime: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, i) => GRID_START_HOUR + i);

export function CalendarWeekView({ weekOf, events, onSlotClick, onEventClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const days = eachDayOfInterval({ start: startOfWeek(weekOf), end: endOfWeek(weekOf) });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 7 * HOUR_HEIGHT });
  }, []);

  return (
    <div className={`${PANEL} flex flex-col`}>
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-100">
        <div />
        {days.map((day) => (
          <div key={day.toISOString()} className="border-l border-slate-100 py-2.5 text-center">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{format(day, 'EEE')}</div>
            <div className={`text-sm font-bold ${isToday(day) ? 'text-indigo-600' : 'text-slate-900'}`}>{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      <div ref={scrollRef} className="max-h-150 overflow-y-auto">
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          <div className="relative" style={{ height: HOUR_HEIGHT * HOURS.length }}>
            {HOURS.map((hour) => (
              <div key={hour} className="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-slate-400" style={{ top: hour * HOUR_HEIGHT }}>
                {format(new Date(2000, 0, 1, hour), 'h a')}
              </div>
            ))}
          </div>

            {days.map((day) => {
              
            const positioned = layoutDayEvents(
              events.filter((e) => {
                const start = startOfDay(new Date(e.starts_at));
                const end = endOfDay(new Date(e.ends_at));
                return day >= start && day <= end;
              }),
              day
            );

            return (
              <div key={day.toISOString()} className="relative border-l border-slate-100" style={{ height: HOUR_HEIGHT * HOURS.length }}>
                {HOURS.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => { const slot = new Date(day); slot.setHours(hour, 0, 0, 0); onSlotClick(slot); }}
                    className="absolute inset-x-0 border-t border-slate-100 hover:bg-indigo-50/50"
                    style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    aria-label={`Create event ${format(day, 'MMM d')} at ${format(new Date(2000, 0, 1, hour), 'h a')}`}
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
                      className={`absolute overflow-hidden rounded border-l-[3px] px-1.5 py-0.5 text-[11px] leading-tight ${style.bg} ${style.text} ${style.border}`}
                      style={{ top, height, left: `${(lane / laneCount) * 100}%`, width: `${100 / laneCount}%` }}
                    >
                      <div className="truncate font-semibold">{event.title}</div>
                      <div className="truncate text-[10px] opacity-75">{format(new Date(event.starts_at), 'h:mm a')}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}