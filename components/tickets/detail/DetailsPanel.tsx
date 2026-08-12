"use client"

import { UserCircle, Tag, Calendar, Clock } from "lucide-react"
import type { TicketDetailData } from "@/lib/types/tickets"
import { useTicketCategories } from "@/hooks/use-ticket-categories" // ADJUST if path/casing differs from the real file

function formatDate(iso: string | null) {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function DetailsPanel({ ticket }: { ticket: TicketDetailData }) {
    const { categories } = useTicketCategories()

    const matched = categories.find((c) => c.id === ticket.category?.id)
    const parent = matched?.parent_id ? categories.find((c) => c.id === matched.parent_id) : null

    const categoryLabel = parent?.name ?? matched?.name ?? ticket.category?.name ?? "Uncategorized"
    const subcategoryLabel = parent ? matched?.name : null

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-[#EFEFEF] bg-white p-4">
            <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-wide text-black/40">DETAILS</span>

                <div className="flex items-start gap-2">
                    <UserCircle className="mt-0.5 size-4 shrink-0 text-[#008AAC]" />
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold tracking-wide text-black/35">CREATED BY</span>
                        <span className="text-xs font-medium text-[#26343A]">
                            {ticket.requester?.full_name ?? "Unknown"}
                        </span>
                        {ticket.requester?.department && (
                            <span className="text-[#008AAC] font-jetbrmono text-[10px]">
                                {ticket.requester?.department}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <UserCircle className="mt-0.5 size-4 shrink-0 text-[#008AAC]" />
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold tracking-wide text-black/35">ASSIGNED TO</span>
                        <span className="text-xs font-medium text-[#26343A]">
                            {ticket.assigned_to?.full_name ?? "Unassigned"}
                        </span>
                        {ticket.assigned_to?.role && (
                            <span className="capitalize text-[#008AAC] font-jetbrmono text-[10px]">{ticket.assigned_to.role}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <Tag className="mt-0.5 size-4 shrink-0 text-[#008AAC]" />
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold tracking-wide text-black/35">CATEGORY</span>
                        <span className="text-xs font-medium text-[#26343A]">
                            {categoryLabel}
                        </span>
                        {subcategoryLabel && (
                            <span className="text-[#008AAC] font-jetbrmono text-[10px]">
                                {subcategoryLabel}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 size-4 shrink-0 text-[#008AAC]" />
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold tracking-wide text-black/35">CREATED</span>
                        <span className="text-xs font-medium text-[#26343A]">{formatDate(ticket.created_at)}</span>
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 size-4 shrink-0 text-[#008AAC]" />
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold tracking-wide text-black/35">DUE</span>
                        <span className="text-xs font-medium text-[#26343A]">{formatDate(ticket.due_at)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}