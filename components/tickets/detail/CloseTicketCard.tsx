"use client"

import { useState, useTransition } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { XCircle } from "lucide-react"
import { overrideCloseTicket } from "@/lib/actions/ticket-actions" // ADJUST if this differs from the real export path
import type { TicketStatus } from "@/lib/types/tickets"

export function CloseTicketCard({ ticketId, currentStatus }: { ticketId: string; currentStatus: TicketStatus }) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const canClose = currentStatus === "resolved"
    const alreadyClosed = currentStatus === "closed"

    const handleClose = () => {
        setError(null)
        startTransition(async () => {
            try {
                await overrideCloseTicket(ticketId, reason.trim() || undefined)
                setOpen(false)
                setReason("")
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to close ticket")
            }
        })
    }

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-[#EFEFEF] bg-white p-4">
            <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-wide text-black/40">CLOSE TICKET</span>

                <div className="flex flex-col gap-2.5">
                    <p className="text-xs text-[#8A8A8A]">
                        {alreadyClosed
                            ? "This ticket has already been closed."
                            : canClose
                            ? "This ticket has been resolved by the requester. You may close it now."
                            : "This ticket must be resolved via Employee QR Scan before it can be closed."
                        }
                    </p>

                    <AlertDialog open={open} onOpenChange={setOpen}>
                        <Button
                            onClick={() => setOpen(true)}
                            disabled={!canClose}
                            variant="outline"
                            className="bg-[#DD1515] hover:bg-[#B91C1C] w-full gap-2 rounded-md border-[#D1D1D1] text-white hover:text-white disabled:opacity-50"
                        >
                            <XCircle className="size-4" />
                            Close Ticket
                        </Button>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Close this ticket?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This closes the ticket immediately without employee confirmation. It can only be
                                    reopened afterward via &quot;Reopen via Employee QR Scan&quot;.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Reason (optional)"
                                className="min-h-20 resize-y rounded-lg border-[#E2E2E2] text-sm"
                            />

                            {error && <p className="text-sm text-[#D92D20]">{error}</p>}

                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleClose}
                                    disabled={isPending}
                                    className="bg-[#DD1515] hover:bg-[#B91C1C]"
                                >
                                    {isPending ? "Closing..." : "Close Ticket"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    )
}