'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Power, PowerOff, MapPin, Users } from 'lucide-react';
import { deactivateConferenceRoom, updateConferenceRoom } from '@/lib/actions/room-admin-actions';
import { AmenityPill } from '@/components/rooms/AmenityPill';
import { PANEL, TABLE_HEADER_CELL, TABLE_ROW, TABLE_CELL } from '@/lib/calendar-styles';
import type { ConferenceRoom } from '@/lib/types/rooms';

type Props = {
  rooms: ConferenceRoom[];
};

export function ManageRoomsForm({ rooms }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggleActive(room: ConferenceRoom) {
    startTransition(async () => {
      if (room.is_active) {
        await deactivateConferenceRoom(room.id);
      } else {
        await updateConferenceRoom(room.id, { is_active: true });
      }
      router.refresh();
    });
  }


  return (
    <div className="flex flex-col gap-4">
     <div className={`${PANEL} overflow-hidden`}>
        {rooms.length === 0 ? (
          <p className="p-4 text-sm text-slate-400">No rooms yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {['Room', 'Location', 'Capacity', 'Amenities', 'Status', 'Actions'].map((h) => (
                  <th key={h} className={TABLE_HEADER_CELL}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className={`${TABLE_ROW} ${!room.is_active ? 'opacity-60' : ''}`}>
                  <td className={TABLE_CELL}>
                    <div className="font-semibold text-slate-900">{room.name}</div>
                  </td>
                  <td className={TABLE_CELL}>
                    {room.location ? (
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin size={12} className="text-slate-400" /> {room.location}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className={TABLE_CELL}>
                    <span className="flex items-center gap-1 font-medium text-slate-900">
                      <Users size={13} className="text-slate-400" /> {room.capacity}
                    </span>
                  </td>
                  <td className={TABLE_CELL}>
                    {room.amenities.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.map((a) => <AmenityPill key={a} label={a} />)}
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className={TABLE_CELL}>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        room.is_active ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {room.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className={TABLE_CELL}>
                    <button
                      disabled={isPending}
                      onClick={() => handleToggleActive(room)}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
                        room.is_active
                          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                          : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {room.is_active ? <><PowerOff size={12} /> Deactivate</> : <><Power size={12} /> Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}