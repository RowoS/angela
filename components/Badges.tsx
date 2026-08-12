import { Priority, Status, Role } from "@/lib/types/dashboard"
import { SlaState} from "@/lib/utils/sla-utils"

const PRIORITY_STYLES: Record<Priority, { bgColor: string; textColor: string; dot: string }> = {
    critical: { bgColor: "#fef2f2", textColor: "#dc2626", dot: "#dc2626" },
    high:     { bgColor: "#fff7ed", textColor: "#ea580c", dot: "#ea580c" },
    medium:   { bgColor: "#fefce8", textColor: "#ca8a04", dot: "#ca8a04" },
    low:      { bgColor: "#f0fdf4", textColor: "#16a34a", dot: "#16a34a" },
}

const STATUS_STYLES: Record<Status, { bgColor: string; textColor: string }> = {
    pending_confirmation: {bgColor: "#c5c6d0", textColor: "#000000"},
    open:        { bgColor: "#eff6ff", textColor: "#2563eb" },
    in_progress: { bgColor: "#f5f3ff", textColor: "#7c3aed" },
    on_hold:     { bgColor: "#fffbeb", textColor: "#d97706" },
    resolved:    { bgColor: "#f0fdf4", textColor: "#16a34a" },
    closed:      { bgColor: "#f1f5f9", textColor: "#64748b" },
    reopened:    { bgColor: "#fef2f2", textColor: "#dc2626" },
    cancelled:   {bgColor: "#e9e4d4", textColor: "#a52a2a"},
}

const ROLE_STYLES: Record<Role, { bgColor: string; textColor: string }> = {
    admin:  { bgColor: "#fef2f2", textColor: "#dc2626" },
    agent:  { bgColor: "#eff6ff", textColor: "#2563eb" },
    manager:   { bgColor: "#f0fdf4", textColor: "#16a34a" },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
    const s = PRIORITY_STYLES[priority]
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                letterSpacing: "0.02em",
                backgroundColor: s.bgColor,
                color: s.textColor,
                padding: "0.125rem 0.5rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                borderRadius: "1.5rem",
                textTransform: "uppercase",
            }}
        >
            <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: s.dot, flexShrink: 0 }} />
                {priority}
        </span>
    )
}

export function StatusBadge({ status }: { status: Status }) {
    const s = STATUS_STYLES[status]
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "2px 9px", borderRadius: 20,
            backgroundColor: s.bgColor, color: s.textColor,
            fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.02em", textTransform: "capitalize",
        }}>
            {status.replace("_", " ")}
        </span>
  )
}

export function RoleBadge({ role }: { role: Role }) {
    const s = ROLE_STYLES[role]
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "2px 9px", borderRadius: 20,
            backgroundColor: s.bgColor, color: s.textColor,
            fontSize: 11, fontWeight: 700, textTransform: "capitalize",
        }}>
            {role}
    </span>
  );
}

const SLA_STYLES: Record<Exclude<SlaState, 'none'>, string> = {
  ok: 'bg-slate-50 text-slate-500 border-slate-200',
  warning: 'bg-orange-50 text-orange-700 border-orange-200',
  breached: 'bg-red-50 text-red-700 border-red-200',
}

const SLA_LABELS: Record<Exclude<SlaState, 'none'>, string> = {
  ok: 'On Track',
  warning: 'SLA Warning',
  breached: 'SLA Breached',
}

export function SLABadge({ state }: { state: SlaState }) {
  if (state === 'none') return null
  return (
    <span
      className={`inline-flex 
        items-center 
        rounded-full 
        border px-2 py-0.5 
        text-[11px] 
        font-semibold ${SLA_STYLES[state]}`}
    >
      {SLA_LABELS[state]}
    </span>
  )
}

