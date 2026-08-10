import { redirect } from 'next/navigation';
import { addDays } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { listReservationsForWindow } from '@/lib/actions/room-actions';
import { AdminRoomsClient } from '../components/AdminRoomsClient';
import { PANEL } from '@/lib/calendar-styles';
import type { ConferenceRoom } from '@/lib/types/rooms';

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
    .select('id, name, location, capacity, is_active, amenities')
    .order('name')
    .returns<ConferenceRoom[]>();

  const now = new Date();
  const { data: upcomingReservations, error: reservationsError } = await listReservationsForWindow(
    now.toISOString(),
    addDays(now, 90).toISOString(), // 90-day horizon — a global table with no end date grows unbounded
  );

  return (
  <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6 md:p-8">
    {error ? (
      <p className={`${PANEL} px-3 py-2 text-sm text-red-600`}>Could not load rooms: {error.message}</p>
    ) : (
      <AdminRoomsClient rooms={rooms ?? []} reservations={upcomingReservations ?? []} reservationsError={reservationsError} />
    )}
  </div>
  );
}