ALTER TABLE public.conference_rooms
  ADD COLUMN amenities text[] NOT NULL DEFAULT '{}';