import { useState } from 'react';
import { createEvent, updateEvent, type CreateEventInput } from '@/lib/actions/calendar-actions';

export function useEventSubmission(
  mode: 'create' | 'edit',
  eventId?: string,
  onSaved?: () => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitEvent(payload: CreateEventInput) {
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'edit' && eventId) {
        await updateEvent(eventId, payload);
      } else {
        await createEvent(payload);
      }
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submitEvent, isSubmitting, error, setError };
}