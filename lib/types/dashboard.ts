export type Priority = 
  | "low" 
  | "medium" 
  | "high" 
  | "critical";

export type Status =
  | "pending_confirmation"
  | "open"
  | "in_progress"
  | "on_hold"
  | "resolved"
  | "closed"
  | "reopened"
  | "cancelled";

export type Role = 
  | "admin" 
  | "agent" 
  | "manager";

export const ROLE: readonly Role[] =  [
  "admin",
  "agent",
  "manager"
]

export type ActivityActionType =
  | "ticket_created"
  | "ticket_closed"
  | "ticket_status_changed"
  | "ticket_assigned"
  | "ticket_reassigned"
  | "ticket_commented"
  | "ticket_qr_confirmed"
  | "ticket_qr_closed"
  | "room_reserved"
  | "room_cancelled"
  | "event_created"
  | "kb_article_created"
  | "user_invited"
  | "sla_breached"
  | "sla_warning";

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  department: string;
  avatar: string;
}

export interface Employee {
  employee_id: string;    
  full_name: string;
  department: string;
  email: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  employee: Employee;      
  created_by: Profile;      
  assigned_to: Profile | null;
  category: string;
  subcategory: string;
  priority: Priority;
  status: Status;
  created_at: string;
  updated_at: string;
  due_at: string;
  sla_breached: boolean;
  sla_warning: boolean;
  comment_count: number;
  attachment_count: number;
  creation_confirmed_by_qr: boolean;
  closed_confirmed_by_qr: boolean;
}

const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"]
const STATUSES: Status[] = ["open", "in_progress", "on_hold", "resolved", "closed", "reopened"]

function getRandomItem<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

export function getRandomPriority(): Priority {
  return getRandomItem(PRIORITIES)
}

export function getRandomStatus(): Status {
  return getRandomItem(STATUSES)
}
