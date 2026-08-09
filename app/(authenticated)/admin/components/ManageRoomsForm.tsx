'use client';

import { useState, useTransition } from 'react';
import { createConferenceRoom, deactivateConferenceRoom, updateConferenceRoom } from '@/lib/actions/room-admin-actions';
import type { ConferenceRoom } from '@/lib/actions/room-actions';
import { PANEL, FIELD_INPUT, PRIMARY_BTN, OUTLINE_BTN } from '@/lib/calendar-styles';

type Props = {
  rooms: ConferenceRoom[];
};

export function ManageRoomsForm({ rooms }: Props) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedCapacity = Number(capacity);
    if (!name || !parsedCapacity || parsedCapacity <= 0) {
      setError('Give the room a name and a capacity greater than zero.');
      return;
    }

    startTransition(async () => {
      const { error: createError } = await createConferenceRoom({
        name,
        location: location || undefined,
        capacity: parsedCapacity,
      });
      if (createError) {
        setError(createError);
        return;
      }
      setName('');
      setLocation('');
      setCapacity('');
    });
  }

  function handleToggleActive(room: ConferenceRoom) {
    startTransition(async () => {
      if (room.is_active) {
        await deactivateConferenceRoom(room.id);
      } else {
        await updateConferenceRoom(room.id, { is_active: true });
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleAdd} className={`${PANEL} flex flex-col gap-3 p-4`}>
        <p className="text-sm font-bold text-slate-900">Add a room</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            placeholder="Name (e.g. Redwood)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={FIELD_INPUT}
          />
          <input
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={FIELD_INPUT}
          />
          <input
            placeholder="Capacity"
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className={FIELD_INPUT}
          />
        </div>
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={isPending} className={`${PRIMARY_BTN} self-start disabled:opacity-50`}>
          {isPending ? 'Saving…' : 'Add room'}
        </button>
      </form>

      <div className={`${PANEL} flex flex-col divide-y divide-slate-100`}>
        {rooms.length === 0 && <p className="p-4 text-sm text-slate-400">No rooms yet.</p>}
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center justify-between p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {room.name} {!room.is_active && <span className="font-normal text-slate-400">(inactive)</span>}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {room.location ? `${room.location} · ` : ''}Seats {room.capacity}
              </p>
            </div>
            <button disabled={isPending} onClick={() => handleToggleActive(room)} className={`${OUTLINE_BTN} shrink-0`}>
              {room.is_active ? 'Deactivate' : 'Reactivate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}