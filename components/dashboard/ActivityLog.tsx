// components/dashboard/ActivityLogCard.tsx
import { Activity } from "lucide-react"
import type { ActivityActionType, Profile } from "@/lib/types/dashboard"

export interface ActivityLogItem {
  id: string
  action_type: ActivityActionType
  description: string
  timestamp: string
  actor: {
    full_name: string
  }
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  actor: Profile;
  action_type: ActivityActionType;
  description: string;
  subject: string;        
  subject_type: "ticket" | "room" | "event" | "article" | "user" | "system";
}

interface ActivityLogCardProps {
  items: ActivityLogItem[]
  onViewAll: () => void
}

const ACTION_ICONS: Partial<Record<ActivityActionType, string>> = {
  ticket_created: "🎫",
  ticket_closed: "✅",
  ticket_status_changed: "🔄",
  ticket_assigned: "👤",
  ticket_qr_confirmed: "📲",
  ticket_qr_closed: "📲",
  room_reserved: "🚪",
  sla_breached: "⚠️",
  sla_warning: "⏱",
}

const ACTION_COLOR: Partial<Record<ActivityActionType, string>> = {
  ticket_qr_confirmed: "#4f46e5",
  ticket_qr_closed: "#16a34a",
  sla_breached: "#dc2626",
  sla_warning: "#d97706",
  ticket_created: "#2563eb",
  ticket_closed: "#16a34a",
  room_reserved: "#d97706",
}

export function ActivityLogCard({ items, onViewAll }: ActivityLogCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-[#e8ecf2] bg-white p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <Activity size={14} className="text-indigo-600" />
          <span>Activity</span>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          View all
        </button>
      </div>

      <div className="flex flex-col gap-3 overflow-hidden">
        {items.map((entry) => {
          const icon = ACTION_ICONS[entry.action_type] ?? "•"
          const color = ACTION_COLOR[entry.action_type] ?? "#64748b"
          return (
            <div key={entry.id} className="flex items-start gap-2.5">
              <div
                className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-md text-xs"
                style={{ backgroundColor: `${color}15` }}
              >
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-xs leading-snug text-slate-600">
                  {entry.description}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-slate-400">
                  {new Date(entry.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {entry.actor.full_name}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}