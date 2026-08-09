'use client';

import { useState } from 'react';
import { cancelReservation, type ConferenceRoom, type RoomReservationWithRoom } from '@/lib/actions/room-actions';
import { ReservationEditForm } from './ReservationEditForm';
import {
  MODAL_OVERLAY, MODAL_CARD, FIELD_LABEL,
  SECONDARY_BTN, DANGER_BTN, DANGER_SOLID_BTN, PRIMARY_BTN,
} from '@/lib/calendar-styles';

type Props = {
  reservation: RoomReservationWithRoom;
  rooms: ConferenceRoom[];
  onClose: () => void;
  onChanged: () => void; // covers both edit and cancel — caller re-fetches either way
};

export function ReservationDetailModal({ reservation, rooms, onClose, onChanged }: Props) {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setIsCancelling(true);
    setError(null);
    const { error: cancelError } = await cancelReservation(reservation.id);
    if (cancelError) {
      setError(cancelError);
      setIsCancelling(false);
      return;
    }
    onChanged();
  }

  if (mode === 'edit') {
    return (
      <div className={MODAL_OVERLAY} onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} className={`${MODAL_CARD} max-w-lg`}>
          <h3 className="mb-4 text-base font-bold text-slate-900">Edit Reservation</h3>
          <ReservationEditForm
            reservation={reservation}
            rooms={rooms}
            onCancel={() => setMode('view')}
            onSaved={onChanged}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={MODAL_OVERLAY} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`${MODAL_CARD} max-w-md`}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-base font-bold text-slate-900">{reservation.title}</h3>
          <button onClick={onClose} aria-label="Close" className="shrink-0 text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <dl className="mb-5 space-y-3 text-sm">
          <div>
            <dt className={FIELD_LABEL}>Room</dt>
            <dd className="font-medium text-slate-900">
              {reservation.conference_rooms.name}
              {reservation.conference_rooms.location ? ` · ${reservation.conference_rooms.location}` : ''}
              {' · '}seats {reservation.conference_rooms.capacity}
            </dd>
          </div>
          <div>
            <dt className={FIELD_LABEL}>Organizer</dt>
            <dd className="font-medium text-slate-900">{reservation.organizer?.full_name ?? 'Unknown'}</dd>
          </div>
          <div>
            <dt className={FIELD_LABEL}>When</dt>
            <dd className="font-medium text-slate-900">
              {new Date(reservation.starts_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              {' – '}
              {new Date(reservation.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </dd>
          </div>
          <div>
            <dt className={FIELD_LABEL}>Attendees</dt>
            <dd className="text-slate-700">{reservation.attendee_note || '—'}</dd>
          </div>
          <div>
            <dt className={FIELD_LABEL}>Booked</dt>
            <dd className="text-slate-500">{new Date(reservation.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</dd>
          </div>
        </dl>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          {confirming ? (
            <>
              <span className="mr-auto self-center text-xs font-medium text-red-600">Cancel this reservation?</span>
              <button onClick={() => setConfirming(false)} className={SECONDARY_BTN} disabled={isCancelling}>
                Back
              </button>
              <button onClick={handleCancel} disabled={isCancelling} className={DANGER_SOLID_BTN}>
                {isCancelling ? 'Cancelling…' : 'Confirm'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setConfirming(true)} className={DANGER_BTN}>
                Cancel Reservation
              </button>
              <button onClick={() => setMode('edit')} className={PRIMARY_BTN}>
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}