'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { RoomAvailabilityGrid } from './RoomAvailabilityGrid';
import { RoomReservationModal } from './RoomReservationModal';
import { MyReservationsTable } from './MyReservationList';
import { PRIMARY_BTN } from '@/lib/calendar-styles';
import { useRouter } from 'next/navigation';
import type { ConferenceRoom, RoomReservationWithRoom } from '@/lib/actions/room-actions';

type Props = {
  rooms: ConferenceRoom[];
  myReservations: RoomReservationWithRoom[];
  myReservationsError: string | null;
  todaysReservations: RoomReservationWithRoom[];
  todaysReservationsError: string | null;
  nowIso: string;
};

export function RoomsPageClient({
  rooms,
  myReservations,
  myReservationsError,
  todaysReservations,
  todaysReservationsError,
  nowIso,
}: Props) {
  const router = useRouter();
  const [reserveRoomId, setReserveRoomId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function openModal(roomId?: string) {
    setReserveRoomId(roomId ?? null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setReserveRoomId(null);
  }

  function handleReserved() {
    router.refresh(); // re-fetch server data — new booking, updated availability
  }

  return (
    <>
      <div className="flex justify-end">
        <button onClick={() => openModal()} className={PRIMARY_BTN}>
          <Plus size={13} /> Reserve a Room
        </button>
      </div>

      {todaysReservationsError && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Today&apos;s bookings unavailable: {todaysReservationsError}
        </p>
      )}

      <RoomAvailabilityGrid
        rooms={rooms}
        todaysReservations={todaysReservations}
        nowIso={nowIso}
        onReserveRoom={(roomId) => openModal(roomId)}
      />

      <div>
        <h2 className="mb-3 text-sm font-bold text-slate-900">My Reservations</h2>
        {myReservationsError ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{myReservationsError}</p>
        ) : (
          <MyReservationsTable reservations={myReservations} rooms={rooms} />
        )}
      </div>

      {modalOpen && (
        <RoomReservationModal
          rooms={rooms}
          initialRoomId={reserveRoomId ?? undefined}
          onClose={closeModal}
          onReserved={handleReserved}
        />
      )}
    </>
  );
}