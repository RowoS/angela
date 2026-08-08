const PRIORITY_OPTIONS = [
  { val: 'low', label: 'Low', active: 'border-green-600 bg-green-50 text-green-700' },
  { val: 'medium', label: 'Medium', active: 'border-amber-600 bg-amber-50 text-amber-700' },
  { val: 'high', label: 'High', active: 'border-orange-600 bg-orange-50 text-orange-700' },
  { val: 'critical', label: 'Critical', active: 'border-red-600 bg-red-50 text-red-700' },
] as const

interface TicketPriorityProps {
  priority: string;
  onPriorityChange: (val: string) => void;
}

export function TicketPriority({ priority, onPriorityChange }: TicketPriorityProps) {
  return (
    <div className="border-t border-slate-100 pt-5">
      <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700">Priority</label>
      <p className="mb-2 text-xs text-slate-400">Defaults from the selected category. Override only if necessary.</p>
      <div className="flex gap-2">
        {PRIORITY_OPTIONS.map((p) => (
          <button
            key={p.val}
            type="button"
            onClick={() => onPriorityChange(p.val)}
            className={`flex-1 rounded-lg border py-1.5 text-xs font-bold transition-colors ${
              priority === p.val ? p.active : 'border-slate-200 text-slate-400 hover:bg-slate-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <input type="hidden" name="priority" value={priority} />
    </div>
  )
}