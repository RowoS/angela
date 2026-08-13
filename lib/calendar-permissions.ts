import type { Database } from '@/lib/supabase/types';

type Profile = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'role' | 'department'>;
type EventRow = { owner_id: string };


export function canEditEvent(caller: Profile, event: EventRow): boolean {
  if (caller.role === 'admin') return true;
  return caller.id === event.owner_id;
}