import { Activity } from "lucide-react"
import { describeActivity, metaFor } from "@/lib/activity-format"
import type { ActivityLogRow } from "@/lib/types/activity"

interface ActivityLogCardProps {
  items: ActivityLogRow[]
  onViewAll: () => void
}

export function ActivityLogCard({ items, onViewAll }: ActivityLogCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-[#e8ecf2] bg-white p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <Activity size={14} className="text-indigo-600" />
          <span>Activity</span>
        </div>
        <button onClick={onViewAll} className="text-xs font-semibold text-indigo-600 hover:underline">
          View all
        </button>
      </div>

      <div className="flex flex-col gap-3 overflow-hidden">
        {items.length === 0 && <p className="text-xs text-slate-400">No recent activity.</p>}
        {items.map((entry) => {
          const meta = metaFor(entry.action)
          return (
            <div key={entry.id} className="flex items-start gap-2.5">
              <div
                className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-md text-xs"
                style={{ backgroundColor: meta.bg }}
              >
                {meta.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-xs leading-snug text-slate-600">
                  {describeActivity(entry)}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-slate-400">
                  {new Date(entry.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {entry.actorName ?? "System"}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}