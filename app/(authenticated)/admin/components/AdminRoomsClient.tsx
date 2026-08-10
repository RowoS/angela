'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar } from 'lucide-react';
import { ManageRoomsForm } from './ManageRoomsForm';
import { AllReservationsTable } from './AllReservationsTable';
import { AddRoomModal } from './AddRoomModal';
import { RoomReservationModal } from '@/app/(authenticated)/rooms/components/RoomReservationModal';
import { PANEL, PRIMARY_BTN } from '@/lib/calendar-styles';
import type { ConferenceRoom, RoomReservationWithRoom } from '@/lib/types/rooms';

type Props = {
  rooms: ConferenceRoom[];
  reservations: RoomReservationWithRoom[];
  reservationsError?: string | null;
};

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex-1 border-r border-slate-100 px-5 py-3.5 last:border-r-0">
      <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
      <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}

function getDefaultAvailableRoomId(rooms: ConferenceRoom[], reservations: RoomReservationWithRoom[]): string | undefined {
  const now = new Date();
  const bookedNowRoomIds = new Set(
    reservations
      .filter((r) => new Date(r.starts_at) <= now && new Date(r.ends_at) >= now)
      .map((r) => r.room_id),
  );

  const firstAvailable = rooms.find((r) => r.is_active && !bookedNowRoomIds.has(r.id));
  return firstAvailable?.id ?? rooms.find((r) => r.is_active)?.id;
}

export function AdminRoomsClient({ rooms, reservations, reservationsError }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<'rooms' | 'reservations'>('rooms');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showReserve, setShowReserve] = useState(false);

  const activeCount = rooms.filter((r) => r.is_active).length;
  const totalCapacity = rooms.filter((r) => r.is_active).reduce((sum, r) => sum + r.capacity, 0);

  const tabClass = (active: boolean) =>
    `rounded-md px-5 py-2 text-sm font-bold transition-colors ${
      active ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'
    }`;

  function handleRoomCreated() {
    setShowAddRoom(false);
    router.refresh();
  }

  function handleReserved() {
    setShowReserve(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Manage Conference Rooms</h1>
          <p className="mt-1 text-sm text-slate-500">Add rooms and set their capacity, or retire ones no longer available.</p>
        </div>
        {tab === 'rooms' ? (
          <button onClick={() => setShowAddRoom(true)} className={PRIMARY_BTN}>
            <Plus size={14} /> Add Room
          </button>
        ) : (
          <button onClick={() => setShowReserve(true)} className={PRIMARY_BTN}>
            <Calendar size={14} /> New Reservation
          </button>
        )}
      </div>

      <div className="flex w-fit gap-1 rounded-lg bg-slate-100 p-1">
        <button onClick={() => setTab('rooms')} className={tabClass(tab === 'rooms')}>
          Rooms ({rooms.length})
        </button>
        <button onClick={() => setTab('reservations')} className={tabClass(tab === 'reservations')}>
          Reservations ({reservations.length})
        </button>
      </div>

      {tab === 'rooms' && (
        <>
          <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
            <StatCard label="Total Rooms" value={rooms.length} color="#4f46e5" />
            <StatCard label="Active" value={activeCount} color="#16a34a" />
            <StatCard label="Inactive" value={rooms.length - activeCount} color="#dc2626" />
            <StatCard label="Total Capacity" value={`${totalCapacity} seats`} color="#0369a1" />
          </div>
          <ManageRoomsForm rooms={rooms} />
        </>
      )}

      {tab === 'reservations' && (
        reservationsError ? (
          <p className={`${PANEL} px-3 py-2 text-sm text-red-600`}>{reservationsError}</p>
        ) : (
          <AllReservationsTable reservations={reservations} rooms={rooms} />
        )
      )}

      {showAddRoom && <AddRoomModal onClose={() => setShowAddRoom(false)} onCreated={handleRoomCreated} />}
      {showReserve && (
        <RoomReservationModal rooms={rooms} initialRoomId={getDefaultAvailableRoomId(rooms, reservations)} onClose={() => setShowReserve(false)} onReserved={handleReserved} />
      )}
    </div>
  );
}