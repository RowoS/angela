export type ConferenceRoom = {
  id: string;
  name: string;
  location: string | null;
  capacity: number;
  is_active: boolean;
  amenities: string[];
};

export type RoomReservation = {
  id: string;
  room_id: string;
  organizer_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  attendee_note: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  created_at: string;
  updated_at: string;
};

export type RoomReservationWithRoom = RoomReservation & {
  conference_rooms: Pick<ConferenceRoom, 'id' | 'name' | 'location' | 'capacity' | 'amenities'>;
  room_reservation_attendees: { employee_id: string }[];
  organizer: { id: string; full_name: string | null } | null;
};

export type AttachableEvent = {
  id: string;
  title: string;
  event_type: string;
  starts_at: string;
  ends_at: string;
};

