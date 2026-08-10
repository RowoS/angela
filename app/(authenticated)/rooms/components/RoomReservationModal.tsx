'use client';

import { MODAL_OVERLAY, MODAL_CARD } from '@/lib/calendar-styles';
import { RoomReservationForm } from './RoomReservationForm';
import type { ConferenceRoom } from '@/lib/types/rooms';

type Props = {
  rooms: ConferenceRoom[];
  initialRoomId?: string;
  onClose: () => void;
  onReserved: () => void;
};

export function RoomReservationModal({ rooms, initialRoomId, onClose, onReserved }: Props) {
  return (
    <div className={MODAL_OVERLAY} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`${MODAL_CARD} max-w-lg`}>
        <h3 className="mb-4 text-base font-bold text-slate-900">Reserve a Room</h3>
        {rooms.length === 0 ? (
          <p className="text-sm text-slate-400">No active rooms available. Contact an admin.</p>
        ) : (
          <RoomReservationForm key={initialRoomId} rooms={rooms} initialRoomId={initialRoomId} onClose={onClose} onReserved={onReserved} />
        )}
      </div>
    </div>
  );
}