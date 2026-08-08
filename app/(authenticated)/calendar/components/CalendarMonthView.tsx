'use client';

import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import { eventTypeStyle, PANEL } from '@/lib/calendar-styles';
import type { getEvents } from '@/lib/actions/calendar-actions';

type CalendarEvent = Awaited<ReturnType<typeof getEvents>>[number];

interface Props {
  month: Date;
  events: CalendarEvent[];
  onDayClick: (day: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarMonthView({ month, events, onDayClick, onEventClick }: Props) {
  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className={`${PANEL} overflow-hidden`}>
      <div className="grid grid-cols-7 border-b border-slate-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
          <div key={label} className="py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.starts_at), day));
          const inMonth = isSameMonth(day, month);
          const isWeekendCol = i % 7 === 0 || i % 7 === 6;
          const today = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`min-h-[100px] border-b border-slate-100 p-2 text-left align-top hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${
                (i + 1) % 7 !== 0 ? 'border-r border-slate-100' : ''
              } ${!inMonth || isWeekendCol ? 'bg-slate-50/60' : 'bg-white'}`}
            >
              <span
                className={`mb-1 flex h-[22px] w-[22px] items-center justify-center rounded-full text-xs ${
                  today ? 'bg-indigo-600 font-bold text-white' : inMonth ? 'font-medium text-slate-900' : 'font-medium text-slate-300'
                }`}
              >
                {format(day, 'd')}
              </span>
              <div className="flex flex-col gap-0.5">
                {dayEvents.slice(0, 3).map((event) => {
                  const style = eventTypeStyle(event.event_type);
                  return (
                    <div
                      key={event.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className={`truncate rounded border-l-[3px] px-1.5 py-0.5 text-[10px] font-semibold ${style.bg} ${style.text} ${style.border}`}
                    >
                      {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <span className="block text-[10px] font-medium text-slate-400">+{dayEvents.length - 3} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}