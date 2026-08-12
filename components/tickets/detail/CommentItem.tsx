import type { CommentRow } from "@/lib/types/tickets"
import { Lock } from "lucide-react"

function getInitials(name: string | null): string {
    if (!name) return "?"
    const parts = name.trim().split(/\s+/)
    return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?"
}

function formatTimestamp(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    })
}

export function CommentItem({ comment }: { comment: CommentRow }) {
    const authorName = comment.user?.full_name ?? "Unknown"

    return (
        <div
            className={`flex gap-2.5 rounded-lg ${
                comment.is_internal ? "border-[0.5px] border-[#008AAC] bg-[#008AAC]/10 h-fit py-4 px-3" : "py-2.5"
            }`}
        >
            <span 
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    comment.is_internal ? "bg-[#008AAC]/20 text-[#008AAC]" : "bg-[#1949CF]/20 text-[#1949CF]"
                }`}
            >
                {getInitials(authorName)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#26242A]">{authorName}</span>
                        {comment.is_internal && (
                            <div className="flex flex-row gap-0.5 px-1.5 py-0.5 text-[8px] font-medium text-[#008AAC] bg-[#008AAC]/20 rounded-full items-center">
                                <Lock className="size-2"/>
                                Internal
                            </div>
                        )}
                    </div>
                    <span className="shrink-0 text-[10px] text-black/60">{formatTimestamp(comment.created_at)}</span>
                </div>
                <p className="text-xs/[20px] text-[#5B5B5B]">{comment.body}</p>
            </div>
        </div>
    )
}