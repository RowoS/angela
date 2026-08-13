import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getEventOwners } from '@/lib/actions/calendar-actions';
import { CalendarShell } from './components/CalendarShell';

export const metadata = {
  title: 'Calendar',
};

export default async function CalendarPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, department')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return (
      <div className="mx-auto w-full max-w-6xl p-6 md:p-8">
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          Couldn&apos;t load your profile. Try refreshing, or contact an admin if this keeps happening.
        </p>
      </div>
    );
  }

  let owners: Awaited<ReturnType<typeof getEventOwners>> = [];
  let ownersError: string | null = null;

  try {
    owners = await getEventOwners();
  } catch (err) {
    ownersError = err instanceof Error ? err.message : 'Failed to load owners.';
  }

  return (
    <>
      <div className='flex flex-col w-full'>
        <div className="mx-auto w-full max-w-6xl p-6 md:p-8">
          <div className="mb-6">
            <p className="mt-1 text-sm text-slate-500">
              Track maintenance windows, outages, site visits, and staff availability.
            </p>
          </div>

          {ownersError && (
            <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Owner filter unavailable: {ownersError}
            </p>
          )}

          <CalendarShell
            currentUserId={user.id}
            currentUserRole={profile.role}
            owners={owners}
          />
        </div>
      </div>
    </>
  );
}