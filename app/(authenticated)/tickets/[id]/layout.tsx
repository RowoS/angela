import { requireRole } from "@/lib/auth/require-role"

export default async function TicketDetailLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["agent", "admin", "manager"])
  return (
    <div className="flex flex-col w-full">
      {children}
    </div>
  )
}