"use client"

import { QrCode } from "lucide-react"
import { PriorityBadge, StatusBadge } from "@/components/Badges"
import { Priority, Status } from "@/lib/types/dashboard"
import ViewAllButton from "./ViewAllButton"

interface TicketItem {
  id: string
  ticket_number: string
  title: string
  creation_confirmed_by_qr?: boolean
  priority: Priority
  status: Status
  employee: {
    full_name: string
  }
}

interface RecentTicketCardProps {
  tickets: TicketItem[]                 
  onSelectTicket: (id: string) => void
}

export function RecentTicketCard({
  tickets,
  onSelectTicket,
}: RecentTicketCardProps) {
  return (
    <div className="w-4/7 overflow-hidden rounded-xl border border-[#e8ecf2] bg-white">
      <div className="flex items-center justify-between px-5.5 pt-4 pb-3">
        <h3 className="text-sm font-bold text-slate-900">Recent Tickets</h3>
        <ViewAllButton />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              {["Ticket", "Title", "Priority", "Status"].map((header) => (
                <th
                  key={header}
                  className="px-5.5 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <tr
                key={t.id}
                onClick={() => onSelectTicket(t.id)}
                className="cursor-pointer transition-colors hover:bg-slate-50/80"
              >
                <td className="whitespace-nowrap px-5.5 py-2.5 font-mono text-xs font-bold text-indigo-600">
                  <div>{t.ticket_number}</div>
                  {t.creation_confirmed_by_qr && (
                    <div className="mt-0.5 flex items-center gap-0.5 text-[10px] font-bold text-indigo-600">
                      <QrCode size={10} />
                      <span>QR</span>
                    </div>
                  )}
                </td>
                <td className="max-w-[180px] px-5.5 py-2.5">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {t.title}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">
                    {t.employee.full_name ?? '-'}
                  </div>
                </td>
                <td className="px-5.5 py-2.5">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="px-5.5 py-2.5">
                  <StatusBadge status={t.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}