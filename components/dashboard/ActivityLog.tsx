// components/dashboard/ActivityLogCard.tsx
import { Activity } from "lucide-react"
import type { ActivityActionType, Profile } from "@/lib/types/dashboard"
import { PROFILES } from "@/components/dashboard/RecentTicket"

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

export const ACTIVITY_LOG: ActivityEntry[] = [
  {
    id: "act1",
    timestamp: "2026-07-22T07:45:00Z",
    actor: PROFILES[0],
    action_type: "ticket_created",
    description: "Created ticket IT-2026-00044 for employee Amara Osei (EMP-0076) — Conference room A/V issue",
    subject: "IT-2026-00044",
    subject_type: "ticket",
  },
  {
    id: "act2",
    timestamp: "2026-07-22T07:46:00Z",
    actor: PROFILES[0],
    action_type: "ticket_qr_confirmed",
    description: "Employee Amara Osei scanned QR code (EMP-0076) — ticket creation confirmed",
    subject: "IT-2026-00044",
    subject_type: "ticket",
  },
  {
    id: "act3",
    timestamp: "2026-07-21T13:00:00Z",
    actor: PROFILES[3],
    action_type: "room_reserved",
    description: "Reserved Huddle A for 'Campaign Review' (13:00–14:00)",
    subject: "Huddle A",
    subject_type: "room",
  },
  {
    id: "act4",
    timestamp: "2026-07-21T11:00:00Z",
    actor: PROFILES[0],
    action_type: "ticket_created",
    description: "Created ticket IT-2026-00043 for employee Jordan Clarke (EMP-0091) — Adobe CC license request",
    subject: "IT-2026-00043",
    subject_type: "ticket",
  },
  {
    id: "act5",
    timestamp: "2026-07-21T11:01:00Z",
    actor: PROFILES[0],
    action_type: "ticket_qr_confirmed",
    description: "Employee Jordan Clarke scanned QR code (EMP-0091) — ticket creation confirmed",
    subject: "IT-2026-00043",
    subject_type: "ticket",
  },
  {
    id: "act6",
    timestamp: "2026-07-21T10:00:00Z",
    actor: PROFILES[0],
    action_type: "ticket_commented",
    description: "Added internal note on IT-2026-00041 — WSUS block for KB5040442 pushed",
    subject: "IT-2026-00041",
    subject_type: "ticket",
  },
  {
    id: "act7",
    timestamp: "2026-07-21T09:30:00Z",
    actor: PROFILES[2],
    action_type: "ticket_created",
    description: "Created ticket IT-2026-00042 for employee Jordan Clarke (EMP-0091) — VPN authentication failure",
    subject: "IT-2026-00042",
    subject_type: "ticket",
  },
  {
    id: "act8",
    timestamp: "2026-07-21T09:31:00Z",
    actor: PROFILES[2],
    action_type: "ticket_qr_confirmed",
    description: "Employee Jordan Clarke scanned QR code (EMP-0091) — ticket creation confirmed",
    subject: "IT-2026-00042",
    subject_type: "ticket",
  },
  {
    id: "act9",
    timestamp: "2026-07-20T08:44:00Z",
    actor: PROFILES[1],
    action_type: "ticket_assigned",
    description: "Assigned IT-2026-00041 to Sofia Reyes",
    subject: "IT-2026-00041",
    subject_type: "ticket",
  },
  {
    id: "act10",
    timestamp: "2026-07-20T08:15:00Z",
    actor: PROFILES[1],
    action_type: "ticket_qr_confirmed",
    description: "Employee Priya Anand scanned QR code (EMP-0042) — ticket creation confirmed",
    subject: "IT-2026-00041",
    subject_type: "ticket",
  },
  {
    id: "act11",
    timestamp: "2026-07-20T08:14:00Z",
    actor: PROFILES[1],
    action_type: "ticket_created",
    description: "Created ticket IT-2026-00041 for employee Priya Anand (EMP-0042) — laptop boot failure",
    subject: "IT-2026-00041",
    subject_type: "ticket",
  },
  {
    id: "act12",
    timestamp: "2026-07-19T14:00:00Z",
    actor: PROFILES[4],
    action_type: "ticket_created",
    description: "Created ticket IT-2026-00039 for employee Leo Fontaine (EMP-0117) — new hire workstation setup",
    subject: "IT-2026-00039",
    subject_type: "ticket",
  },
  {
    id: "act13",
    timestamp: "2026-07-18T11:30:00Z",
    actor: PROFILES[0],
    action_type: "ticket_qr_closed",
    description: "Employee Priya Anand scanned QR code (EMP-0042) — confirmed resolution of IT-2026-00038",
    subject: "IT-2026-00038",
    subject_type: "ticket",
  },
  {
    id: "act14",
    timestamp: "2026-07-18T11:28:00Z",
    actor: PROFILES[0],
    action_type: "ticket_closed",
    description: "Ticket IT-2026-00038 marked resolved — email server outage remediated",
    subject: "IT-2026-00038",
    subject_type: "ticket",
  },
  {
    id: "act15",
    timestamp: "2026-07-18T06:10:00Z",
    actor: PROFILES[0],
    action_type: "sla_breached",
    description: "SLA breach detected on IT-2026-00038 (Critical — exceeded 4h resolution target)",
    subject: "IT-2026-00038",
    subject_type: "ticket",
  },
  {
    id: "act16",
    timestamp: "2026-07-17T10:02:00Z",
    actor: PROFILES[2],
    action_type: "ticket_created",
    description: "Created ticket IT-2026-00040 for employee Amara Osei (EMP-0076) — persistent printer jam",
    subject: "IT-2026-00040",
    subject_type: "ticket",
  },
  {
    id: "act17",
    timestamp: "2026-07-15T09:46:00Z",
    actor: PROFILES[1],
    action_type: "ticket_qr_closed",
    description: "Employee Priya Anand scanned QR code (EMP-0042) — confirmed resolution of IT-2026-00035",
    subject: "IT-2026-00035",
    subject_type: "ticket",
  },
  {
    id: "act18",
    timestamp: "2026-07-15T09:00:00Z",
    actor: PROFILES[1],
    action_type: "ticket_created",
    description: "Created ticket IT-2026-00035 for employee Priya Anand (EMP-0042) — domain account locked out",
    subject: "IT-2026-00035",
    subject_type: "ticket",
  },
];

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