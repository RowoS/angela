'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { type CreateEventInput, getEvents } from '@/lib/actions/calendar-actions';
import {
  EVENT_TYPE_ORDER, EVENT_TYPE_STYLES,
  MODAL_OVERLAY, MODAL_CARD, FIELD_LABEL, FIELD_INPUT,
  SECONDARY_BTN, PRIMARY_BTN,
} from '@/lib/calendar-styles';
import type { Database } from '@/lib/supabase/types';
import { TicketSelector } from '@/components/TicketSelector';
import type { TicketOption } from '@/hooks/use-ticket-search';
import { useEventSubmission } from '@/hooks/use-event-submission';

type EventType = Database['public']['Enums']['event_type'];
type CalendarEvent = Awaited<ReturnType<typeof getEvents>>[number];

interface Props {
  mode: 'create' | 'edit';
  initialDate?: Date;
  event?: CalendarEvent;
  onClose: () => void;
  onSaved: () => void;
}

function toLocalInputValue(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function EventForm({ mode, initialDate, event, onClose, onSaved }: Props) {
  const baseDate = event ? new Date(event.starts_at) : (initialDate ?? new Date());
  const baseEnd = event ? new Date(event.ends_at) : new Date(baseDate.getTime() + 60 * 60 * 1000);

  // --- Form State ---
  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [eventType, setEventType] = useState<EventType>(event?.event_type ?? 'other');
  const [startsAt, setStartsAt] = useState(toLocalInputValue(baseDate));
  const [endsAt, setEndsAt] = useState(toLocalInputValue(baseEnd));
  
  const [selectedTicket, setSelectedTicket] = useState<TicketOption | null>(
    event?.ticket ? { id: event.ticket.id, ticket_number: event.ticket.ticket_number, title: event.ticket.title } : null
  );

  // --- Submission Hook ---
  const { submitEvent, isSubmitting, error, setError } = useEventSubmission(
    mode, 
    event?.id, 
    onSaved
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const payload: CreateEventInput = {
      title,
      description,
      eventType,
      ticketId: selectedTicket?.id ?? null,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
    };

    await submitEvent(payload);
  }

  return (
    <div className={MODAL_OVERLAY} onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className={`${MODAL_CARD} max-w-lg`}>
        <h3 className="mb-4 text-base font-bold text-slate-900">{mode === 'edit' ? 'Edit Event' : 'New Event'}</h3>

        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <label className="mb-3 block">
          <span className={FIELD_LABEL}>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD_INPUT} required />
        </label>

        <div className="mb-3">
          <span className={FIELD_LABEL}>Type</span>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Event type">
            {EVENT_TYPE_ORDER.map((type) => {
              const style = EVENT_TYPE_STYLES[type];
              const active = eventType === type;
              return (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setEventType(type)}
                  className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-white' : style.dot}`} />
                  {style.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-4">
          <label className="block">
            <span className={FIELD_LABEL}>Starts</span>
            <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={FIELD_INPUT} required />
          </label>
          <label className="block">
            <span className={FIELD_LABEL}>Ends</span>
            <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={FIELD_INPUT} required />
          </label>
        </div>

        <div className="mb-3">
          <span className={FIELD_LABEL}>Linked ticket (optional)</span>
          <TicketSelector 
            selectedTicket={selectedTicket} 
            onSelectTicket={setSelectedTicket} 
            onClearTicket={() => setSelectedTicket(null)} 
          />
        </div>

        <label className="mb-4 block">
          <span className={FIELD_LABEL}>Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={FIELD_INPUT} rows={2} />
        </label>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className={SECONDARY_BTN}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className={`${PRIMARY_BTN} disabled:opacity-50`}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}