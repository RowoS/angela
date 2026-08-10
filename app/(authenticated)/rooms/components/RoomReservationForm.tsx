'use client';

import { format } from 'date-fns';
import { useEffect, useState, useTransition, useCallback } from 'react';
import {
  createReservation,
  listAttachableEvents,
  listRoomReservations
} from '@/lib/actions/room-actions';
import type { ConferenceRoom, RoomReservationWithRoom, AttachableEvent } from '@/lib/types/rooms';
import { FIELD_LABEL, FIELD_INPUT, PRIMARY_BTN, SECONDARY_BTN } from '@/lib/calendar-styles';
import { AmenityPill } from '@/components/rooms/AmenityPill';
type Props = {
  rooms: ConferenceRoom[];
  initialRoomId?: string;
  onClose: () => void;
  onReserved: () => void;
};

function toLocalInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function RoomReservationForm({ rooms, initialRoomId, onClose, onReserved }: Props) {
  const [roomId, setRoomId] = useState(initialRoomId ?? rooms[0]?.id ?? '');
  const [prevInitialRoomId, setPrevInitialRoomId] = useState(initialRoomId);
  
  if (initialRoomId !== prevInitialRoomId) {
    setPrevInitialRoomId(initialRoomId);
    setRoomId(initialRoomId ?? rooms[0]?.id ?? '');
  }
  
  const [title, setTitle] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [attendeeNote, setAttendeeNote] = useState('');
  const [existing, setExisting] = useState<RoomReservationWithRoom[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [attachableEvents, setAttachableEvents] = useState<AttachableEvent[]>([]);
  const [attachToEventId, setAttachToEventId] = useState<string>('');

  useEffect(() => {
    listAttachableEvents().then(({ data }) => {
      if (data) setAttachableEvents(data);
    });
  }, []);


  function handleAttachSelection(eventId: string) {
    setAttachToEventId(eventId);
    if (!eventId) return;

    const event = attachableEvents.find((e) => e.id === eventId);
    if (!event) return;

    setTitle(event.title);
    setStartsAt(toLocalInputValue(new Date(event.starts_at)));
    setEndsAt(toLocalInputValue(new Date(event.ends_at)));
    refreshAvailability(roomId, toLocalInputValue(new Date(event.starts_at)));
  }

  const refreshAvailability = useCallback(async (nextRoomId: string, nextStartsAt: string) => {
    if (!nextRoomId || !nextStartsAt) {
      setExisting([]);
      return;
    }
    const day = new Date(nextStartsAt);
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).toISOString();
    const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).toISOString();

    const { data } = await listRoomReservations(nextRoomId, dayStart, dayEnd);
    setExisting(data ?? []);
  }, []);

  function overlapsExisting(): boolean {
    if (!startsAt || !endsAt) return false;
    const start = new Date(startsAt).getTime();
    const end = new Date(endsAt).getTime();
    return existing.some((r) => {
      const rStart = new Date(r.starts_at).getTime();
      const rEnd = new Date(r.ends_at).getTime();
      return start < rEnd && end > rStart;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!roomId || !title || !startsAt || !endsAt) {
      setError('Fill in a room, title, and start/end time.');
      return;
    }

    startTransition(async () => {
      const { data, error: submitError } = await createReservation({
        roomId,
        title,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        attendeeNote: attendeeNote.trim() || undefined,
        attachToEventId: attachToEventId || undefined,
      });

      if (submitError) {
        setError(submitError);
        return;
      }

      setSuccess(
        attachToEventId
          ? `Reserved. The room has been attached to "${data?.title}" on the calendar.`
          : `Reserved. "${data?.title}" has been added to the calendar.`,
      );
      onReserved();
    });
  }

  const conflictWarning = overlapsExisting();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {attachableEvents.length > 0 && (
        <div>
          <label htmlFor="attach_event" className={FIELD_LABEL}>
            Attach to an existing event (optional)
          </label>
          <select
            id="attach_event"
            className={FIELD_INPUT}
            value={attachToEventId}
            onChange={(e) => handleAttachSelection(e.target.value)}
          >
            <option value="">Create a new calendar event</option>
            {attachableEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} — {new Date(event.starts_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </option>
            ))}
          </select>
          {attachToEventId && (
            <p className="mt-1 text-xs text-slate-400">
              This reservation will attach to that event instead of creating a new calendar entry.
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="room" className={FIELD_LABEL}>
          Room
        </label>
        <select
          id="room"
          className={FIELD_INPUT}
          value={roomId}
          onChange={(e) => {
            setRoomId(e.target.value);
            refreshAvailability(e.target.value, startsAt);
          }}
        >
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} {room.location ? `— ${room.location}` : ''} (seats {room.capacity})
            </option>
          ))}
        </select>
        

        {roomId && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {rooms.find((r) => r.id === roomId)?.amenities.map((a) => (
              <AmenityPill key={a} label={a} />
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="title" className={FIELD_LABEL}>
          Title / purpose
        </label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Weekly sync" className={FIELD_INPUT} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="starts_at" className={FIELD_LABEL}>
            Start
          </label>
          <input
            id="starts_at"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => {
              setStartsAt(e.target.value);
              refreshAvailability(roomId, e.target.value);
            }}
            min={toLocalInputValue(new Date())}
            className={FIELD_INPUT}
          />
        </div>
        <div>
          <label htmlFor="ends_at" className={FIELD_LABEL}>
            End
          </label>
          <input id="ends_at" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={FIELD_INPUT} />
        </div>
      </div>

      <div>
        <label htmlFor="attendee_note" className={FIELD_LABEL}>
          Attendees (optional)
        </label>
        <input
          id="attendee_note"
          value={attendeeNote}
          onChange={(e) => setAttendeeNote(e.target.value)}
          placeholder="e.g. Finance team, 8 people"
          className={FIELD_INPUT}
        />
        <p className="mt-1 text-xs text-slate-400">Free-text note — not linked to specific employee records.</p>
      </div>

      {existing.length > 0 && (
        <div className="rounded-md bg-slate-50 p-3 text-sm">
          <p className="font-semibold text-slate-900">Already booked that day:</p>
          <ul className="mt-1 list-inside list-disc text-slate-600">
            {existing.map((r) => (
              <li key={r.id}>
                {new Date(r.starts_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                {' – '}
                {new Date(r.ends_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}: {r.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {conflictWarning && (
        <p className="text-sm text-amber-600">
          Heads up — that overlaps an existing reservation. You can still try to submit, but it will be rejected.
        </p>
      )}

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {success && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-600">{success}</p>}

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={onClose} className={SECONDARY_BTN}>
          {success ? 'Close' : 'Cancel'}
        </button>
        {!success && (
          <button type="submit" disabled={isPending} className={`${PRIMARY_BTN} disabled:opacity-50`}>
            {isPending ? 'Reserving…' : 'Reserve room'}
          </button>
        )}
      </div>
    </form>
  );
}