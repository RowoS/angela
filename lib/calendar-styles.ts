// lib/calendar-styles.ts
import type { Database } from '@/lib/supabase/types';

type EventType = Database['public']['Enums']['event_type'];

export interface EventTypeStyle {
  bg: string;
  text: string;
  dot: string;
  border: string;
  label: string;
}

export const EVENT_TYPE_STYLES: Record<EventType, EventTypeStyle> = {
  maintenance:        { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500', border: 'border-indigo-500', label: 'Maintenance' },
  outage:             { bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-500',    border: 'border-red-500',    label: 'Outage' },
  site_visit:         { bg: 'bg-green-50',  text: 'text-green-600',  dot: 'bg-green-500',  border: 'border-green-500',  label: 'Site Visit' },
  staff_availability: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500', border: 'border-orange-500', label: 'Staff Availability' },
  other:              { bg: 'bg-slate-50',  text: 'text-slate-500',  dot: 'bg-slate-400',  border: 'border-slate-400',  label: 'Other' },
  room_reservation: {bg: 'bg-blue-50', text: 'bg-blue-500', dot: 'bg-blue-400', border: 'border-blue-400', label: 'Room Reservation'}
};

export const EVENT_TYPE_ORDER: EventType[] = ['maintenance', 'outage', 'site_visit', 'staff_availability', 'other', 'room_reservation'];

export function eventTypeStyle(type: string): EventTypeStyle {
  return EVENT_TYPE_STYLES[type as EventType] ?? EVENT_TYPE_STYLES.other;
}

// Shared primitives so month/week/day/filters/panels pull one palette
// instead of five copies of the same hex map.
export const PANEL = 'rounded-xl border border-slate-200 bg-white';

export function segmentButton(active: boolean) {
  return `rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
    active
      ? 'border-indigo-600 bg-indigo-600 text-white'
      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
  }`;
}

export const ICON_BTN =
  'flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50';

export const PRIMARY_BTN =
  'flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700';

export const MODAL_OVERLAY = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4';
export const MODAL_CARD = 'w-full rounded-xl bg-white p-6 shadow-xl';

export const FIELD_LABEL = 'mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-400';
export const FIELD_INPUT =
  'w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export const SECONDARY_BTN = 'rounded-md px-3.5 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50';
export const DANGER_BTN = 'rounded-md px-3.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50';
export const DANGER_SOLID_BTN = 'rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50';