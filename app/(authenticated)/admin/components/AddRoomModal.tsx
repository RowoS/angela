'use client';

import { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { createConferenceRoom } from '@/lib/actions/room-admin-actions';
import { ALL_AMENITIES } from '@/components/rooms/AmenityPill';
import { MODAL_OVERLAY, MODAL_CARD, FIELD_LABEL, FIELD_INPUT, PRIMARY_BTN, SECONDARY_BTN } from '@/lib/calendar-styles';

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export function AddRoomModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('10');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleAmenity(a: string) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedCapacity = Number(capacity);
    if (!name.trim() || !parsedCapacity || parsedCapacity <= 0) {
      setError('Give the room a name and a capacity greater than zero.');
      return;
    }

    startTransition(async () => {
      const { error: createError } = await createConferenceRoom({
        name: name.trim(),
        location: location.trim() || undefined,
        capacity: parsedCapacity,
        amenities,
      });
      if (createError) {
        setError(createError);
        return;
      }
      onCreated();
    });
  }

  return (
    <div className={MODAL_OVERLAY} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`${MODAL_CARD} max-w-lg`}>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Add New Room</h3>
            <p className="mt-1 text-xs text-slate-400">The room will be set to Active and immediately available for booking.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="shrink-0 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="room_name" className={FIELD_LABEL}>
              Room Name <span className="text-red-600">*</span>
            </label>
            <input id="room_name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Huddle C" className={FIELD_INPUT} />
          </div>

          <div>
            <label htmlFor="room_location" className={FIELD_LABEL}>Location</label>
            <input id="room_location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Floor 3 — West Wing" className={FIELD_INPUT} />
          </div>

          <div>
            <label htmlFor="room_capacity" className={FIELD_LABEL}>Capacity (seats)</label>
            <input id="room_capacity" type="number" min={1} max={200} value={capacity} onChange={(e) => setCapacity(e.target.value)} className={FIELD_INPUT} />
          </div>

          <div>
            <p className={`${FIELD_LABEL} mb-1.5`}>Amenities</p>
            <div className="flex flex-wrap gap-2">
              {ALL_AMENITIES.map((a) => {
                const active = amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                      active
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className={SECONDARY_BTN} disabled={isPending}>
              Cancel
            </button>
            <button type="submit" disabled={isPending} className={`${PRIMARY_BTN} disabled:opacity-50`}>
              {isPending ? 'Adding…' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}