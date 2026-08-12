export interface AuditLogEntry {
    id: string
    actor: { full_name: string }
    action: string
    from_value?: string | null
    to_value?: string | null
    created_at: string
}

function formatTimestamp(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

// NOTE: no getTicketAuditLog action exists in the actions file yet, and
// nothing writes to an audit_log table on status/assignment changes
// despite the requirements doc calling for it. This component is built
// and ready — it just needs real `entries` passed in from wherever that
// action ends up living. Until then, pass entries={[]} (or omit it) and
// it'll show the empty state below rather than fabricating fake rows.
//
// To visually test it, pass SAMPLE_AUDIT_LOG (defined below) in from
// the CALLER — e.g. <AuditLogPanel entries={SAMPLE_AUDIT_LOG} /> in
// page.tsx/TicketTabs — rather than hardcoding it into this component.
// Hardcoding it here would mean the entries prop does nothing, so real
// data passed in later would be silently ignored in favor of the fake
// set forever.
export function AuditLogPanel({ entries = [] }: { entries?: AuditLogEntry[] }) {
    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <p className="text-sm text-[#8A8A8A]">No audit history yet.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col pt-5">
            {entries.map((entry, i) => (
                <div key={entry.id} className="relative flex gap-3">
                    {/* Dot + connecting line */}
                    <div className="flex w-7 shrink-0 flex-col items-center">
                        <span
                            className={`mt-1.5 size-2 shrink-0 rounded-full ${
                                entry.action.toLowerCase().includes("qr") ? "bg-[#008AAC]" : "bg-[#71BED1]"
                            }`}
                        />
                        {i < entries.length - 1 && <span className="mt-0.5 w-px flex-1 bg-[#E2E2E2]" />}
                    </div>

                    <div className={i < entries.length - 1 ? "pb-5" : ""}>
                        <div className="text-sm text-[#26242A]">
                            <span className="font-semibold">{entry.actor.full_name}</span>{" "}
                            <span className="text-[#5B5B5B]">{entry.action}</span>
                            {entry.from_value && entry.to_value && (
                                <span className="text-[#8A8A8A]">
                                    : <span className="line-through">{entry.from_value}</span> →{" "}
                                    <span className="font-semibold text-[#008AAC]">{entry.to_value}</span>
                                </span>
                            )}
                            {!entry.from_value && entry.to_value && (
                                <span className="text-[#008AAC]"> — {entry.to_value}</span>
                            )}
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-[#8A8A8A]">
                            {formatTimestamp(entry.created_at)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// TEST DATA ONLY — matches the mockup screenshot exactly. Pass this IN
// from the caller (see NOTE above), don't reference it inside this file.
export const SAMPLE_AUDIT_LOG: AuditLogEntry[] = [
    {
        id: "1",
        actor: { full_name: "Sofia Reyes" },
        action: "created ticket",
        created_at: "2026-07-20T16:14:00",
    },
    {
        id: "2",
        actor: { full_name: "Sofia Reyes" },
        action: "employee QR confirmed (creation)",
        to_value: "EMP-0042 — Priya Anand",
        created_at: "2026-07-20T16:15:00",
    },
    {
        id: "3",
        actor: { full_name: "Sofia Reyes" },
        action: "status changed",
        from_value: "open",
        to_value: "in_progress",
        created_at: "2026-07-20T16:44:00",
    },
    {
        id: "4",
        actor: { full_name: "Sofia Reyes" },
        action: "assigned ticket",
        from_value: "Unassigned",
        to_value: "Sofia Reyes",
        created_at: "2026-07-20T16:44:00",
    },
    {
        id: "5",
        actor: { full_name: "Marcus Webb" },
        action: "priority changed",
        from_value: "medium",
        to_value: "high",
        created_at: "2026-07-21T17:00:00",
    },
]