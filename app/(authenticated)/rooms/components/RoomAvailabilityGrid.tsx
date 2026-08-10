'use client';

import { Users, MapPin } from 'lucide-react';
import { STATUS_BADGE, PANEL } from '@/lib/calendar-styles';
import { AmenityPill } from '@/components/rooms/AmenityPill';
import type { ConferenceRoom, RoomReservationWithRoom } from '@/lib/types/rooms';

type Props = {
  rooms: ConferenceRoom[];
  todaysReservations: RoomReservationWithRoom[];
  nowIso: string;
  onReserveRoom: (roomId: string) => void;
};

export function RoomAvailabilityGrid({ rooms, todaysReservations, nowIso, onReserveRoom }: Props) {
  const now = new Date(nowIso);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => {
        const roomReservations = todaysReservations.filter((r) => r.room_id === room.id);
        const isBookedNow = roomReservations.some(
          (r) => new Date(r.starts_at) <= now && new Date(r.ends_at) >= now,
        );
        const status: 'available' | 'booked' | 'inactive' = !room.is_active
          ? 'inactive'
          : isBookedNow
            ? 'booked'
            : 'available';
        const statusLabel = { available: 'Available', booked: 'Booked', inactive: 'Inactive' }[status];

        return (
          <div key={room.id} className={`${PANEL} flex flex-col gap-3.5 p-5 ${!room.is_active ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-[15px] font-bold text-slate-900">{room.name}</div>
                {room.location && (
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                    <MapPin size={11} /> {room.location}
                  </div>
                )}
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_BADGE[status]}`}>
                {statusLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Users size={13} className="text-slate-400" /> Capacity: <strong className="text-slate-900">{room.capacity}</strong>
            </div>

            {room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {room.amenities.map((a) => <AmenityPill key={a} label={a} />)}
              </div>
            )}

            {roomReservations.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Today&apos;s bookings</div>
                {roomReservations.map((r) => (
                  <div key={r.id} className="rounded-md border-l-[3px] border-indigo-500 bg-slate-50 px-2.5 py-2">
                    <div className="text-xs font-semibold text-slate-900">{r.title}</div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      {new Date(r.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {new Date(r.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' · '}{r.organizer?.full_name ?? 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => onReserveRoom(room.id)}
              disabled={!room.is_active}
              className="mt-auto rounded-md border border-slate-200 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent disabled:hover:border-slate-200"
            >
              Reserve This Room
            </button>
          </div>
        );
      })}
    </div>
  );
}