import type { CommentRow } from "@/lib/types/tickets"
import { CommentItem } from "./CommentItem"
import { CommentComposer } from "./CommentComposer"

export function CommentsPanel({ ticketId, comments }: { ticketId: string; comments: CommentRow[] }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 pt-3">
                {comments.length === 0 ? (
                    <p className="py-6 text-center text-sm text-[#8A8A8A]">No comments yet.</p>
                ) : (
                    comments.map((c) => <CommentItem key={c.id} comment={c} />)
                )}
            </div>
            <CommentComposer ticketId={ticketId} />
        </div>
    )
}