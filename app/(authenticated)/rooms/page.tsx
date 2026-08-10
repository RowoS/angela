import { startOfDay, addDays } from 'date-fns';
import { listConferenceRooms, listMyReservations, listReservationsForWindow } from '@/lib/actions/room-actions';
import { RoomsPageClient } from './components/RoomsPageClient';

export default async function RoomsPage() {
  const now = new Date();
  const dayStart = startOfDay(now).toISOString();
  const dayEnd = addDays(startOfDay(now), 1).toISOString();

  const [{ data: rooms, error: roomsError }, { data: myReservations, error: myError }, { data: todaysReservations, error: todaysError }] =
    await Promise.all([
      listConferenceRooms(),
      listMyReservations(),
      listReservationsForWindow(dayStart, dayEnd),
    ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-8">
      {roomsError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">Failed to load rooms: {roomsError}</p>}

      <RoomsPageClient
        rooms={rooms ?? []}
        myReservations={myReservations ?? []}
        myReservationsError={myError}
        todaysReservations={todaysReservations ?? []}
        todaysReservationsError={todaysError}
        nowIso={now.toISOString()}
      />
    </div>
  );
}