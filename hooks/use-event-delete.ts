import { useState } from 'react';
import { deleteEvent } from '@/lib/actions/calendar-actions';

export function useEventDeletion(eventId: string, onDeleted: () => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteEvent(eventId);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event.');
      setIsDeleting(false);
    }
  }

  return { isDeleting, confirmingDelete, setConfirmingDelete, error, handleDelete };
}