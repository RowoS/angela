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