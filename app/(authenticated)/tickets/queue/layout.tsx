import { requireRole } from "@/lib/auth/require-role"

// Queue = unassigned/triage view — Requesters and Managers have no
// business here per the role table (Requester: own tickets only,
// Manager: read-only). Adjust the allowed list if that's wrong.
export default async function QueueLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["agent", "admin"])
  return (
    <div className="flex flex-col w-full">
      {children}
    </div>
  )
}