import type { ActivityLogRow } from "@/lib/types/activity"
import type { AuditLogEntry } from "@/components/tickets/detail/AuditLogPanel"
import { auditLabelFor, getAuditValues } from "@/lib/activity-format"

type StaffMember = { id: string; full_name: string }

function resolveAgentName(id: unknown, staffById: Map<string, string>): string {
  if (typeof id !== "string") return "Unassigned"
  return staffById.get(id) ?? "Former agent"
}

export function mapAuditRowsToEntries(
  rows: ActivityLogRow[],
  staff: StaffMember[] = []
): AuditLogEntry[] {
  const staffById = new Map(staff.map((s) => [s.id, s.full_name]))

  // getTicketAuditTrail returns newest-first (shares the cursor-pagination
  // contract of the general activity feed); the timeline reads top-to-bottom
  // as oldest-first, so reverse once here rather than re-ordering in SQL.
  return [...rows]
    .reverse()
    .map((row) => {
      const metadata = (row.metadata ?? {}) as Record<string, unknown>
      const { from_value, to_value } = getAuditValues(row.action, metadata)

      // Both sides of ticket.assigned now come pre-named via snapshots
      // (from_name / to_name) written in assign_ticket() as of
      // 20260812071139_snapshot_assignee_name.sql and
      // 20260812120000_snapshot_previous_assignee_name.sql. The staff-list
      // lookup only kicks in for rows written before the relevant
      // migration, where the snapshot field is absent — falling back to
      // the raw `from`/`to` UUIDs.
      const resolvedFrom =
        row.action === 'ticket.assigned' && !from_value
          ? resolveAgentName(metadata.from, staffById)
          : from_value
      const resolvedTo =
        row.action === 'ticket.assigned' && !to_value
          ? resolveAgentName(metadata.to, staffById)
          : to_value

      return {
        id: row.id,
        actor: { full_name: row.actorName ?? "System" },
        action: auditLabelFor(row.action),
        created_at: row.createdAt,
        from_value: resolvedFrom,
        to_value: resolvedTo,
      }
    })
}