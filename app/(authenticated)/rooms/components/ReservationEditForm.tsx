'use client';

import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { updateReservation, listRoomReservations, type ConferenceRoom, type RoomReservationWithRoom } from '@/lib/actions/room-actions';
import { FIELD_LABEL, FIELD_INPUT, PRIMARY_BTN, SECONDARY_BTN } from '@/lib/calendar-styles';

type Props = {
  reservation: RoomReservationWithRoom;
  rooms: ConferenceRoom[];
  onCancel: () => void;
  onSaved: () => void;
};

function toLocalInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function ReservationEditForm({ reservation, rooms, onCancel, onSaved }: Props) {
  const [roomId, setRoomId] = useState(reservation.room_id);
  const [title, setTitle] = useState(reservation.title);
  const [startsAt, setStartsAt] = useState(toLocalInputValue(new Date(reservation.starts_at)));
  const [endsAt, setEndsAt] = useState(toLocalInputValue(new Date(reservation.ends_at)));
  const [attendeeNote, setAttendeeNote] = useState(reservation.attendee_note ?? '');
  const [existing, setExisting] = useState<RoomReservationWithRoom[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    refreshAvailability(roomId, startsAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshAvailability(nextRoomId: string, nextStartsAt: string) {
    if (!nextRoomId || !nextStartsAt) {
      setExisting([]);
      return;
    }
    const day = new Date(nextStartsAt);
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).toISOString();
    const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).toISOString();

    const { data } = await listRoomReservations(nextRoomId, dayStart, dayEnd);
    setExisting((data ?? []).filter((r) => r.id !== reservation.id));
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!roomId || !title || !startsAt || !endsAt) {
      setError('Fill in a room, title, and start/end time.');
      return;
    }

    setIsSubmitting(true);
    const { error: submitError } = await updateReservation({
      reservationId: reservation.id,
      title,
      roomId,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      attendeeNote,
    });
    setIsSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }
    onSaved();
  }

  const conflictWarning = overlapsExisting();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div>
        <label htmlFor="edit_room" className={FIELD_LABEL}>Room</label>
        <select
          id="edit_room"
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
      </div>

      <div>
        <label htmlFor="edit_title" className={FIELD_LABEL}>Title / purpose</label>
        <input id="edit_title" value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD_INPUT} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="edit_starts_at" className={FIELD_LABEL}>Start</label>
          <input
            id="edit_starts_at"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => {
              setStartsAt(e.target.value);
              refreshAvailability(roomId, e.target.value);
            }}
            className={FIELD_INPUT}
          />
        </div>
        <div>
          <label htmlFor="edit_ends_at" className={FIELD_LABEL}>End</label>
          <input id="edit_ends_at" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={FIELD_INPUT} />
        </div>
      </div>

      <div>
        <label htmlFor="edit_attendee_note" className={FIELD_LABEL}>Attendees (optional)</label>
        <input
          id="edit_attendee_note"
          value={attendeeNote}
          onChange={(e) => setAttendeeNote(e.target.value)}
          className={FIELD_INPUT}
        />
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

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={onCancel} className={SECONDARY_BTN} disabled={isSubmitting}>
          Back
        </button>
        <button type="submit" disabled={isSubmitting} className={`${PRIMARY_BTN} disabled:opacity-50`}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}