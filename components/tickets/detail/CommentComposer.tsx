"use client"

import { useState, useTransition } from "react"
import { Send, LockOpen, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { postComment } from "@/lib/actions/ticket-actions" // ADJUST if this differs from the real export path

export function CommentComposer({ ticketId }: { ticketId: string }) {
    const [mode, setMode] = useState<"public" | "internal">("public")
    const [body, setBody] = useState("")
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleSend = () => {
        if (!body.trim()) return
        setError(null)
        startTransition(async () => {
            try {
                await postComment(ticketId, body.trim(), mode === "internal")
                setBody("")
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to post comment")
            }
        })
    }

    return (
        <div className="flex flex-col gap-3.5 border-t-[0.5px] border-t-black/10 pt-4">
            <div className="flex flex-col items-start gap-2.5">
                <div className="flex flex-row gap-2">
                    <button
                        type="button"
                        onClick={() => setMode("public")}
                        className={`border-[0.5px] border-[#D1D1D1]/70 items-center gap-1 flex flex-row rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                            mode === "public"
                                ? "text-[#1949CF] bg-[#1949CF]/20"
                                : "text-black/60 hover:bg-[#F2F2F2]"
                        }`}
                    >
                        <LockOpen className="size-3" />
                        Public Reply
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("internal")}
                        className={`border-[0.5px] border-[#D1D1D1]/70 items-center gap-1 flex flex-row rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                            mode === "internal"
                                ? "bg-[#E6F7FA] text-[#0D90B0]"
                                : "bg-white text-[#8A8A8A] hover:bg-[#F2F2F2]"
                        }`}
                    >
                        <Lock className="size-3" />
                        Internal Note
                    </button>
                </div>

                <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={
                        mode === "public"
                            ? "Write a reply to be shared with everyone..."
                            : "Write an internal note — only visible to Agents/Admins..."
                    }
                    className={`text-[#26343A] placeholder:text-xs placeholder:font-light text-sm placeholder:text-black/50 min-h-24 resize-y rounded-lg border-[0.5px] ${
                        mode === "public"
                            ? "border-[#D1D1D1] focus-visible:ring-2"
                            : "border-[#008AAC] bg-[#008AAC]/10 active:ring-[#008AAC] focus-visible:ring-[#008AAC]/40 focus-visible:ring-2 focus-visible:border-[#008AAC]"
                    }`}
                />

                {error && <p className="text-xs text-[#D92D20]">{error}</p>}
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleSend}
                    disabled={isPending || !body.trim()}
                    className={`w-fit h-fit gap-1 rounded-sm text-white font-semibold text-sm px-3 py-2 ${
                        mode === "public"
                            ? "bg-[#3B64D7] hover:opacity-70 hover:bg-[#3B64D7]"
                            : "bg-[#008AAC] hover:opacity-70 hover:bg-[#008AAC]"
                    }`}
                >
                    <Send className="size-4" />
                    {isPending 
                        ? "Sending..." 
                        : ( mode === "public" ) ? "Send Reply" : "Post Note"
                    }
                </Button>
            </div>
        </div>
    )
}