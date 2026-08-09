function getInitials(fullName: string | null): string {
    if (!fullName) return "?"
    const parts = fullName.trim().split(/\s+/)
    const first = parts[0]?.[0] ?? ""
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
    return (first + last).toUpperCase() || "?"
}

interface AssignedTo {
    id: string
    full_name: string | null
}

export function AssigneeAvatar({ assignedTo }: { assignedTo: AssignedTo | null }) {
    if (!assignedTo) {
        return <span className="text-sm text-[#8A8A8A]">Unassigned</span>
    }

    // full_name being null on an assigned ticket shouldn't really happen
    // (it'd mean a profile row without a name), but the type allows it,
    // so this falls back rather than rendering "null" in the UI.
    const displayName = assignedTo.full_name ?? "Unnamed"

    return (
        <span className="inline-flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#71BED1] text-xs font-semibold text-white">
                {getInitials(assignedTo.full_name)}
            </span>
            <span className="text-sm text-[#26242A]">{displayName}</span>
        </span>
    )
}