'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReservationDetailModal } from '@/app/(authenticated)/rooms/components/ReservationDetailModal';
import { PANEL, TABLE_HEADER_CELL, TABLE_ROW, TABLE_CELL } from '@/lib/calendar-styles';
import type { ConferenceRoom, RoomReservationWithRoom } from '@/lib/actions/room-actions';

type Props = {
  reservations: RoomReservationWithRoom[];
  rooms: ConferenceRoom[];
};

export function AllReservationsTable({ reservations, rooms }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<RoomReservationWithRoom | null>(null);

  if (reservations.length === 0) {
    return <p className="text-sm text-slate-400">No upcoming reservations.</p>;
  }

  return (
    <>
      <div className={`${PANEL} overflow-hidden`}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {['Room', 'Purpose', 'Organizer', 'Date & Time', 'Attendees'].map((h) => (
                <th key={h} className={TABLE_HEADER_CELL}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr
                key={r.id}
                onClick={() => setSelected(r)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelected(r); }}
                className={`${TABLE_ROW} cursor-pointer hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500`}
              >
                <td className={TABLE_CELL}>
                  <div className="font-semibold">{r.conference_rooms.name}</div>
                  {r.conference_rooms.location && <div className="text-xs text-slate-400">{r.conference_rooms.location}</div>}
                </td>
                <td className={TABLE_CELL}>{r.title}</td>
                <td className={`${TABLE_CELL} text-slate-500`}>{r.organizer?.full_name ?? 'Unknown'}</td>
                <td className={`${TABLE_CELL} whitespace-nowrap text-slate-500`}>
                  {new Date(r.starts_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} ·{' '}
                  {new Date(r.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {' – '}
                  {new Date(r.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className={`${TABLE_CELL} text-slate-400`}>{r.attendee_note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <ReservationDetailModal
          reservation={selected}
          rooms={rooms}
          onClose={() => setSelected(null)}
          onChanged={() => { setSelected(null); router.refresh(); }}
        />
      )}
    </>
  );
}