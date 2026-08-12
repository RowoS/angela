"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { assignTicket } from "@/lib/actions/ticket-actions" // ADJUST if this differs from the real export path

interface AssignableStaff {
    id: string
    full_name: string | null
    role: string
}

export function AssignPanel({
    ticketId,
    currentAssigneeId,
    staff,
}: {
    ticketId: string
    currentAssigneeId: string | null
    staff: AssignableStaff[]
}) {
    const [selectedId, setSelectedId] = useState<string | null>(currentAssigneeId)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const selectedStaffName = staff.find((s) => s.id === selectedId)?.full_name ?? "Select staff"

    const handleReassign = () => {
        setError(null)
        startTransition(async () => {
            try {
                await assignTicket(ticketId, selectedId)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to reassign")
            }
        })
    }

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-[#EFEFEF] bg-white p-4">
            <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-wide text-black/40">ASSIGN TO</span>

                <div className="flex flex-col gap-2.5">
                    <Select value={selectedId ?? ""} onValueChange={(v) => setSelectedId(v || null)}>
                        <SelectTrigger className="w-full min-w-0 rounded-md border-[#D1D1D1] text-[#26343A]">
                            <SelectValue className="text-[13px]">
                                {(value: string | null) =>
                                    !value ? "Unassigned" : staff.find((s) => s.id === value)?.full_name ?? "Unknown"
                                }
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="w-max min-w-(--anchor-width)">
                            {staff.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                    {s.full_name ?? "Unnamed"} — {s.role}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {error && <p className="text-xs text-[#D92D20]">{error}</p>}

                    <Button
                        onClick={handleReassign}
                        disabled={isPending || selectedId === currentAssigneeId}
                        className="w-full h-fit px-3 py-2 rounded-sm text-[13px] bg-[#008AAC] hover:bg-[#008AAC] text-white hover:text-white hover:opacity-50"
                    >
                        {isPending ? "Reassigning..." : "Reassign"}
                    </Button>
                </div>
            </div>
        </div>
    )
}