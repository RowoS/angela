import { redirect } from 'next/navigation';
import { addDays } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { listReservationsForWindow } from '@/lib/actions/room-actions';
import { ManageRoomsForm } from '../components/ManageRoomsForm';
import { AllReservationsTable } from '../components/AllReservationsTable';
import { PANEL } from '@/lib/calendar-styles';
import type { ConferenceRoom } from '@/lib/actions/room-actions';

export const metadata = {
  title: 'Manage Rooms',
};

export default async function AdminRoomsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin') redirect('/unauthorized');

  const { data: rooms, error } = await supabase
    .from('conference_rooms')
    .select('id, name, location, capacity, is_active')
    .order('name')
    .returns<ConferenceRoom[]>();

  const now = new Date();
  const { data: upcomingReservations, error: reservationsError } = await listReservationsForWindow(
    now.toISOString(),
    addDays(now, 90).toISOString(), // 90-day horizon — a global table with no end date grows unbounded
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6 md:p-8">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Manage Conference Rooms</h1>
        <p className="mt-1 text-sm text-slate-500">Add rooms and set their capacity, or retire ones no longer available.</p>
      </div>

      {error ? (
        <p className={`${PANEL} px-3 py-2 text-sm text-red-600`}>Could not load rooms: {error.message}</p>
      ) : (
        <ManageRoomsForm rooms={rooms ?? []} />
      )}

      <div>
        <h2 className="mb-3 text-sm font-bold text-slate-900">All Upcoming Reservations</h2>
        {reservationsError ? (
          <p className={`${PANEL} px-3 py-2 text-sm text-red-600`}>{reservationsError}</p>
        ) : (
          <AllReservationsTable reservations={upcomingReservations ?? []} rooms={rooms ?? []} />
        )}
      </div>
    </div>
  );
}