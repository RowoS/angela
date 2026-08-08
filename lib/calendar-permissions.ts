import type { Database } from '@/lib/supabase/types';

type Profile = Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'role' | 'department'>;
type EventRow = { owner_id: string; owner: { department: string | null } };

export function canEditEvent(caller: Profile, event: EventRow): boolean {
  if (caller.role === 'admin') return true;
  if (caller.role === 'manager') return caller.department === event.owner.department;
  if (caller.role === 'agent') return caller.id === event.owner_id;
  return false;
}