'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import { getEvents } from '@/lib/actions/calendar-actions';
import { canEditEvent } from '@/lib/calendar-permissions';
import {
  eventTypeStyle,
  MODAL_OVERLAY, MODAL_CARD, FIELD_LABEL,
  SECONDARY_BTN, DANGER_BTN, DANGER_SOLID_BTN, PRIMARY_BTN,
} from '@/lib/calendar-styles';
import type { Database } from '@/lib/supabase/types';
import { useEventDeletion } from '@/hooks/use-event-delete';

type CalendarEvent = Awaited<ReturnType<typeof getEvents>>[number];
type Role = Database['public']['Enums']['roles'];

interface Props {
  event: CalendarEvent;
  currentUserId: string;
  currentUserRole: Role;
  onClose: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}

export function EventDetail({
  event,
  currentUserId,
  currentUserRole,
  onClose,
  onEdit,
  onDeleted,
}: Props) {
  const { 
    isDeleting, 
    confirmingDelete, 
    setConfirmingDelete, 
    error, 
    handleDelete 
  } = useEventDeletion(event.id, onDeleted);

  const style = eventTypeStyle(event.event_type);
  const canEdit = canEditEvent(
    { id: currentUserId, role: currentUserRole},
    { owner_id: event.owner_id}
  );

  return (
    <div className={MODAL_OVERLAY} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`${MODAL_CARD} max-w-md`}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900">{event.title}</h3>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${style.bg} ${style.text}`}>
              {style.label}
            </span>
          </div>
          <button onClick={onClose} aria-label="Close" className="shrink-0 text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <dl className="mb-5 space-y-3 text-sm">
          <div>
            <dt className={FIELD_LABEL}>When</dt>
            <dd className="font-medium text-slate-900">
              {format(new Date(event.starts_at), 'MMM d, h:mm a')} – {format(new Date(event.ends_at), 'MMM d, h:mm a')}
            </dd>
          </div>
          <div>
            <dt className={FIELD_LABEL}>Owner</dt>
            <dd className="font-medium text-slate-900">
              {event.owner.full_name}{event.owner.department ? ` · ${event.owner.department}` : ''}
            </dd>
          </div>
          {event.ticket && (
            <div>
              <dt className={FIELD_LABEL}>Linked ticket</dt>
              <dd>
                <Link href={`/tickets/${event.ticket.id}`} className="font-medium text-indigo-600 hover:underline">
                  {event.ticket.ticket_number}
                </Link>
              </dd>
            </div>
          )}
          {event.description && (
            <div>
              <dt className={FIELD_LABEL}>Description</dt>
              <dd className="whitespace-pre-wrap text-slate-700">{event.description}</dd>
            </div>
          )}
        </dl>

        {canEdit && (
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            {confirmingDelete ? (
              <>
                <span className="mr-auto self-center text-xs font-medium text-red-600">Delete this event?</span>
                <button onClick={() => setConfirmingDelete(false)} className={SECONDARY_BTN} disabled={isDeleting}>
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={isDeleting} className={DANGER_SOLID_BTN}>
                  {isDeleting ? 'Deleting…' : 'Confirm'}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setConfirmingDelete(true)} className={DANGER_BTN}>
                  Delete
                </button>
                <button onClick={onEdit} className={PRIMARY_BTN}>
                  Edit
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}