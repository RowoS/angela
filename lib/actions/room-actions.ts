'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ConferenceRoom, RoomReservation, RoomReservationWithRoom, AttachableEvent  } from '../types/rooms';

type ActionResult<T> = { data: T; error: null } | { data: null; error: string } | { data: T; error: string };

const RESERVATION_SELECT =
  'id, room_id, organizer_id, title, starts_at, ends_at, attendee_note, cancelled_at, cancelled_by, created_at, updated_at, ' +
  'conference_rooms(id, name, location, capacity), room_reservation_attendees(employee_id), organizer:profiles!organizer_id(id, full_name)';

const EXCLUSION_VIOLATION = '23P01';

function friendlyReservationError(error: { code?: string; message: string }): string {
  if (error.code === EXCLUSION_VIOLATION) {
    return 'That room is already booked for part of this time range. Pick a different time or room.';
  }
  return error.message;
}

export async function listConferenceRooms(): Promise<ActionResult<ConferenceRoom[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('conference_rooms')
    .select('id, name, location, capacity, is_active, amenities')
    .eq('is_active', true)
    .order('name');

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function listRoomReservations(
  roomId: string,
  windowStart: string,
  windowEnd: string,
): Promise<ActionResult<RoomReservationWithRoom[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('room_reservations')
    .select(RESERVATION_SELECT)
    .eq('room_id', roomId)
    .is('cancelled_at', null)
    .lt('starts_at', windowEnd)
    .gt('ends_at', windowStart)
    .order('starts_at');

  if (error) return { data: null, error: error.message };
  return { data: data as unknown as RoomReservationWithRoom[], error: null };
}

/**
 * Same shape as listRoomReservations but across every room — backs the
 * availability grid's "today's bookings" preview and the admin
 * all-reservations table. RLS (room_reservations_select_all) already
 * permits any authenticated user to read every reservation, so the
 * meaningful gate for the admin table is at the page level, not here.
 */
export async function listReservationsForWindow(
  windowStart: string,
  windowEnd: string,
): Promise<ActionResult<RoomReservationWithRoom[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('room_reservations')
    .select(RESERVATION_SELECT)
    .is('cancelled_at', null)
    .lt('starts_at', windowEnd)
    .gt('ends_at', windowStart)
    .order('starts_at');

  if (error) return { data: null, error: error.message };
  return { data: data as unknown as RoomReservationWithRoom[], error: null };
}

export async function listMyReservations(): Promise<ActionResult<RoomReservationWithRoom[]>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Not signed in.' };

  const { data, error } = await supabase
    .from('room_reservations')
    .select(RESERVATION_SELECT)
    .eq('organizer_id', user.id)
    .is('cancelled_at', null)
    .order('starts_at');

  if (error) return { data: null, error: error.message };
  return { data: data as unknown as RoomReservationWithRoom[], error: null };
}

export async function listAttachableEvents(): Promise<ActionResult<AttachableEvent[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('id, title, event_type, starts_at, ends_at')
    .is('room_reservation_id', null)
    .gte('ends_at', new Date().toISOString())
    .order('starts_at');

  if (error) return { data: null, error: error.message };
  return { data: data as AttachableEvent[], error: null };
}

export type CreateReservationInput = {
  roomId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  attendeeEmployeeIds?: string[];
  attendeeNote?: string;
  attachToEventId?: string;
};

export async function createReservation(
  input: CreateReservationInput,
): Promise<ActionResult<RoomReservation>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Not signed in.' };

  if (new Date(input.endsAt) <= new Date(input.startsAt)) {
    return { data: null, error: 'End time must be after the start time.' };
  }

  const { data, error } = await supabase
    .rpc('create_room_reservation', {
      p_room_id: input.roomId,
      p_title: input.title,
      p_starts_at: input.startsAt,
      p_ends_at: input.endsAt,
      p_event_id: input.attachToEventId ?? null,
      p_attendee_note: input.attendeeNote?.trim() || null,
    })
    .single();

  if (error) return { data: null, error: friendlyReservationError(error) };

  const reservation = data as unknown as RoomReservation;

  if (input.attendeeEmployeeIds?.length) {
    const { error: attendeeError } = await supabase.from('room_reservation_attendees').insert(
      input.attendeeEmployeeIds.map((employeeId) => ({
        reservation_id: reservation.id,
        employee_id: employeeId,
      })),
    );

    if (attendeeError) {
      revalidatePath('/rooms');
      revalidatePath('/calendar');
      return { data: reservation, error: `Reservation created, but attendees could not be saved: ${attendeeError.message}` };
    }
  }

  revalidatePath('/rooms');
  revalidatePath('/calendar');
  return { data: reservation, error: null };
}

export type UpdateReservationInput = {
  reservationId: string;
  title?: string;
  roomId?: string;
  startsAt?: string;
  endsAt?: string;
  attendeeNote?: string;
};

export async function updateReservation(
  input: UpdateReservationInput,
): Promise<ActionResult<RoomReservation>> {
  const supabase = await createClient();

  const patch: Record<string, string | null> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.roomId !== undefined) patch.room_id = input.roomId;
  if (input.startsAt !== undefined) patch.starts_at = input.startsAt;
  if (input.endsAt !== undefined) patch.ends_at = input.endsAt;
  if (input.attendeeNote !== undefined) patch.attendee_note = input.attendeeNote.trim() || null;

  const { data, error } = await supabase
    .from('room_reservations')
    .update(patch)
    .eq('id', input.reservationId)
    .select()
    .single();

  // RLS silently returns 0 rows rather than a permission error — same
  // caveat as calendar-actions.ts's updateEvent.
  if (error) return { data: null, error: friendlyReservationError(error) };
  if (!data) return { data: null, error: 'Reservation not found or you do not have permission to edit it.' };

  revalidatePath('/rooms');
  revalidatePath('/admin/rooms');
  revalidatePath('/calendar');
  return { data, error: null };
}

export async function cancelReservation(reservationId: string): Promise<ActionResult<true>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: 'Not signed in.' };

  const { error } = await supabase
    .from('room_reservations')
    .update({ cancelled_at: new Date().toISOString(), cancelled_by: user.id })
    .eq('id', reservationId);

  if (error) return { data: null, error: error.message };

  revalidatePath('/rooms');
  revalidatePath('/calendar');
  return { data: true, error: null };
}