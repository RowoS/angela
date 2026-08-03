"use client"

import { QrCode } from "lucide-react"
import { PriorityBadge, StatusBadge } from "@/components/Badges"
import { Employee, Ticket, Profile, Priority, Status } from "@/lib/types/dashboard"
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

export const EMPLOYEES: Employee[] = [
  { employee_id: "EMP-0042", full_name: "Priya Anand",    department: "Finance",     email: "p.anand@company.com" },
  { employee_id: "EMP-0091", full_name: "Jordan Clarke",  department: "Marketing",   email: "j.clarke@company.com" },
  { employee_id: "EMP-0117", full_name: "Leo Fontaine",   department: "Engineering", email: "l.fontaine@company.com" },
  { employee_id: "EMP-0203", full_name: "Yuki Tanaka",    department: "HR",          email: "y.tanaka@company.com" },
  { employee_id: "EMP-0058", full_name: "Carlos Mendez",  department: "Sales",       email: "c.mendez@company.com" },
  { employee_id: "EMP-0076", full_name: "Amara Osei",     department: "Legal",       email: "a.osei@company.com" },
];

export const PROFILES: Profile[] = [
  { id: "u1", full_name: "Marcus Webb",    role: "admin",   department: "IT",         avatar: "MW" },
  { id: "u2", full_name: "Sofia Reyes",    role: "agent",   department: "IT",         avatar: "SR" },
  { id: "u3", full_name: "Dmitri Volkov",  role: "agent",   department: "IT",         avatar: "DV" },
  { id: "u6", full_name: "Nia Thompson",   role: "manager", department: "Operations", avatar: "NT" },
  { id: "u8", full_name: "Hana Mori",      role: "agent",   department: "IT",         avatar: "HM" },
];

export const TICKETS: Ticket[] = [
  {
    id: "t1",
    ticket_number: "IT-2026-00041",
    title: "Laptop won't boot after Windows update",
    description: "Laptop displays a blue screen (IRQL_NOT_LESS_OR_EQUAL) after the KB5040442 patch. Cannot access any work files. Model: Dell Latitude 5540.",
    employee: EMPLOYEES[0],
    created_by: PROFILES[1],
    assigned_to: PROFILES[1],
    category: "Hardware",
    subcategory: "Corrective Maintenance",
    priority: "high",
    status: "in_progress",
    created_at: "2026-07-20T08:14:00Z",
    updated_at: "2026-07-21T10:00:00Z",
    due_at: "2026-07-22T08:14:00Z",
    sla_breached: false,
    sla_warning: true,
    comment_count: 4,
    attachment_count: 2,
    creation_confirmed_by_qr: true,
    closed_confirmed_by_qr: false,
  },
  {
    id: "t2",
    ticket_number: "IT-2026-00042",
    title: "Unable to connect to VPN from home",
    description: "Getting 'Authentication failed' when trying to connect via Cisco AnyConnect. Issue started Monday. Tried restarting and reinstalling the client.",
    employee: EMPLOYEES[1],
    created_by: PROFILES[2],
    assigned_to: PROFILES[2],
    category: "Network",
    subcategory: "VPN/Remote Access",
    priority: "high",
    status: "open",
    created_at: "2026-07-21T09:30:00Z",
    updated_at: "2026-07-21T09:30:00Z",
    due_at: "2026-07-22T09:30:00Z",
    sla_breached: false,
    sla_warning: true,
    comment_count: 1,
    attachment_count: 0,
    creation_confirmed_by_qr: true,
    closed_confirmed_by_qr: false,
  },
  {
    id: "t3",
    ticket_number: "IT-2026-00043",
    title: "Request new Adobe Creative Cloud license",
    description: "The design team needs an additional CC license for the new contractor starting August 1st. Please provision before their start date.",
    employee: EMPLOYEES[1],
    created_by: PROFILES[0],
    assigned_to: null,
    category: "Software",
    subcategory: "License Request",
    priority: "medium",
    status: "open",
    created_at: "2026-07-21T11:00:00Z",
    updated_at: "2026-07-21T11:00:00Z",
    due_at: "2026-07-24T11:00:00Z",
    sla_breached: false,
    sla_warning: false,
    comment_count: 0,
    attachment_count: 0,
    creation_confirmed_by_qr: true,
    closed_confirmed_by_qr: false,
  },
  {
    id: "t4",
    ticket_number: "IT-2026-00038",
    title: "Email server outage — Finance department",
    description: "All Finance team members cannot send or receive email since 6:00 AM. Outlook shows 'Cannot connect to server'. Affects 12 users.",
    employee: EMPLOYEES[0],
    created_by: PROFILES[0],
    assigned_to: PROFILES[0],
    category: "Network",
    subcategory: "Connectivity Issue",
    priority: "critical",
    status: "closed",
    created_at: "2026-07-18T06:05:00Z",
    updated_at: "2026-07-18T11:30:00Z",
    due_at: "2026-07-18T10:05:00Z",
    sla_breached: true,
    sla_warning: false,
    comment_count: 8,
    attachment_count: 1,
    creation_confirmed_by_qr: true,
    closed_confirmed_by_qr: true,
  },
  {
    id: "t5",
    ticket_number: "IT-2026-00039",
    title: "Set up workstation for new hire — Eng dept.",
    description: "New engineer starts July 28. Need MacBook Pro M3 provisioned with dev tools: Xcode, VS Code, Docker, 1Password. Use standard engineering image.",
    employee: EMPLOYEES[2],
    created_by: PROFILES[4],
    assigned_to: PROFILES[4],
    category: "Hardware",
    subcategory: "Equipment Replacement/Upgrade",
    priority: "medium",
    status: "in_progress",
    created_at: "2026-07-19T14:00:00Z",
    updated_at: "2026-07-21T09:00:00Z",
    due_at: "2026-07-26T14:00:00Z",
    sla_breached: false,
    sla_warning: false,
    comment_count: 2,
    attachment_count: 0,
    creation_confirmed_by_qr: true,
    closed_confirmed_by_qr: false,
  },
  {
    id: "t6",
    ticket_number: "IT-2026-00040",
    title: "Printer on Floor 3 paper jam — persistent",
    description: "The HP LaserJet on Floor 3 keeps jamming even after clearing. Started after last week's maintenance. Asset tag: PR-0023.",
    employee: EMPLOYEES[5],
    created_by: PROFILES[2],
    assigned_to: PROFILES[2],
    category: "Hardware",
    subcategory: "Corrective Maintenance",
    priority: "low",
    status: "on_hold",
    created_at: "2026-07-17T10:00:00Z",
    updated_at: "2026-07-20T14:00:00Z",
    due_at: "2026-07-31T10:00:00Z",
    sla_breached: false,
    sla_warning: false,
    comment_count: 3,
    attachment_count: 1,
    creation_confirmed_by_qr: true,
    closed_confirmed_by_qr: false,
  },
  {
    id: "t7",
    ticket_number: "IT-2026-00035",
    title: "Password reset — Priya Anand",
    description: "Locked out of domain account after too many failed attempts. Need immediate reset.",
    employee: EMPLOYEES[0],
    created_by: PROFILES[1],
    assigned_to: PROFILES[1],
    category: "Access/Accounts",
    subcategory: "Password Reset",
    priority: "high",
    status: "closed",
    created_at: "2026-07-15T09:00:00Z",
    updated_at: "2026-07-15T09:45:00Z",
    due_at: "2026-07-15T11:00:00Z",
    sla_breached: false,
    sla_warning: false,
    comment_count: 2,
    attachment_count: 0,
    creation_confirmed_by_qr: true,
    closed_confirmed_by_qr: true,
  },
  {
    id: "t8",
    ticket_number: "IT-2026-00044",
    title: "Conference room A/V not working — Boardroom",
    description: "The HDMI input on the boardroom TV is not detecting any signal. Presentation scheduled for 3 PM today. Urgent.",
    employee: EMPLOYEES[5],
    created_by: PROFILES[0],
    assigned_to: null,
    category: "Facilities/IT Infrastructure",
    subcategory: "Conference Room/A.V. Equipment Issue",
    priority: "critical",
    status: "open",
    created_at: "2026-07-22T07:45:00Z",
    updated_at: "2026-07-22T07:45:00Z",
    due_at: "2026-07-22T11:45:00Z",
    sla_breached: false,
    sla_warning: true,
    comment_count: 0,
    attachment_count: 0,
    creation_confirmed_by_qr: true,
    closed_confirmed_by_qr: false,
  },
];

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
                    {t.employee.full_name}
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