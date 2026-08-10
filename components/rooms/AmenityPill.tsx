const AMENITY_COLORS: Record<string, { bg: string; fg: string }> = {
  Projector: { bg: '#eff6ff', fg: '#2563eb' },
  Whiteboard: { bg: '#f0fdf4', fg: '#16a34a' },
  'Video Conferencing': { bg: '#faf5ff', fg: '#7c3aed' },
  'TV Screen': { bg: '#fff7ed', fg: '#ea580c' },
  Microphone: { bg: '#fef9c3', fg: '#a16207' },
  Flipchart: { bg: '#f0f9ff', fg: '#0369a1' },
  'Coffee Station': { bg: '#fdf4ff', fg: '#a21caf' },
};
const FALLBACK = { bg: '#f1f5f9', fg: '#64748b' };

export function AmenityPill({ label }: { label: string }) {
  const c = AMENITY_COLORS[label] ?? FALLBACK;
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {label}
    </span>
  );
}

export const ALL_AMENITIES = [
  'Projector', 'Whiteboard', 'Video Conferencing',
  'TV Screen', 'Microphone', 'Flipchart', 'Coffee Station',
] as const;