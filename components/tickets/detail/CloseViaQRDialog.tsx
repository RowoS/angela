"use client"

import { useEffect, useState, useTransition } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, CheckCircle2, AlertCircle, ScanLine, Loader2 } from "lucide-react"
import { useQrScanner, type QrScannerError } from "@/hooks/useQRScanner" // ADJUST if path/casing differs from the real file
import { closeTicketViaQr, updateTicketStatus } from "@/lib/actions/ticket-actions" // ADJUST if this differs from the real export path

type Mode = "close" | "reopen"

type Stage = "idle" | "scanning" | "verifying" | "success" | "error"

const CAMERA_ERROR_MESSAGES: Record<QrScannerError, string> = {
    "insecure-context": "Camera access requires HTTPS — this won't work over plain HTTP.",
    "no-camera-support": "This browser doesn't support camera access.",
    "permission-denied": "Camera permission was denied. Allow camera access in your browser settings and try again.",
    "no-camera-found": "No camera was found on this device.",
    "camera-in-use": "The camera is already in use by another application.",
    unknown: "Couldn't access the camera.",
}

export function CloseViaQRDialog({ ticketId, mode = "close" }: { ticketId: string; mode?: Mode }) {
    const [open, setOpen] = useState(false)
    const [stage, setStage] = useState<Stage>("idle")
    const [completedMode, setCompletedMode] = useState<Mode | null>(null)
    const [errorMessage, setErrorMessage] = useState("")
    const [manualId, setManualId] = useState("")
    const [isPending, startTransition] = useTransition()

    const submitAction = (employeeNo: string) => {
        // Captured NOW, not read again after the await — `mode` is a
        // prop, and revalidatePath (inside closeTicketViaQr/
        // updateTicketStatus) can cause the parent to re-render with a
        // NEW mode value while this async action is still in flight.
        // Without capturing it here, the success message below would
        // reflect "what mode is it now" instead of "what did this
        // specific action actually do."
        const actionMode = mode
        stop()
        setStage("verifying")
        setErrorMessage("")
        startTransition(async () => {
            try {
                if (actionMode === "close") {
                    // Real server-side verification — close_ticket_via_qr
                    // actually checks employeeNo matches the ticket's
                    // requester before allowing the close.
                    await closeTicketViaQr(ticketId, employeeNo)
                } else {
                    // NOTE: there's no reopen_ticket_via_qr RPC — reopening
                    // is just a plain status update, already valid per
                    // VALID_STATUSES. The scan/manual-entry step here is
                    // captured for the UX/audit trail (you can see WHICH
                    // employee number was entered in whatever calls this),
                    // but unlike the close flow, it is NOT verified
                    // server-side against the actual requester. If that
                    // verification matters for reopening too, this needs
                    // a real reopen_ticket_via_qr RPC mirroring
                    // close_ticket_via_qr, not just a relabeled dialog.
                    await updateTicketStatus(ticketId, "reopened")
                }
                setCompletedMode(actionMode)
                setStage("success")
            } catch (err) {
                setErrorMessage(err instanceof Error ? err.message : "Failed to update ticket")
                setStage("error")
            }
        })
    }

    // NOTE: assumes the QR payload IS the employee number itself. If your
    // actual codes encode something else (a URL, JSON, etc.), extract the
    // real employee_no from `value` here before passing it on.
    const { videoRef, error: cameraError, start, stop, reset } = useQrScanner({
        onDecode: (value) => submitAction(value),
    })

    const handleStartScan = async () => {
        setStage("scanning")
        setErrorMessage("")
        await start()
    }

    const handleManualLookup = () => {
        if (!manualId.trim()) return
        submitAction(manualId.trim())
    }

    const handleRetry = () => {
        stop()
        reset()
        setErrorMessage("")
        setManualId("")
        setCompletedMode(null)
        setStage("idle")
    }

    // The ONE function that should ever close this dialog. Both the
    // Dialog's own close paths (clicking outside, Escape) AND our own
    // "Done" button need to go through this — otherwise whichever path
    // skips it leaves stale stage/completedMode sitting in state for
    // next time the dialog opens. That was the actual bug: "Done"
    // called setOpen(false) directly, which bypasses onOpenChange
    // entirely (onOpenChange only fires for closes the Dialog component
    // itself initiates, not our own manual state calls) — so the reset
    // in handleRetry() never ran, and reopening showed the stale
    // success card from the previous action instead of a fresh idle
    // scanner.
    const closeDialog = () => {
        handleRetry()
        setOpen(false)
    }

    // Derived, not synced via effect — cameraError is already React state
    // (from the hook), so mirroring it into stage/errorMessage with a
    // useEffect + setState is exactly the "derived state via Effect"
    // anti-pattern React's docs warn about. Computing it here means it's
    // correct on the very same render, with no extra render pass.
    //
    // Only overrides while actively "scanning" (not "idle") on purpose:
    // the hook has no way to clear a stale error short of calling
    // start() again, so if this also applied during "idle", clicking
    // "Try Again" -> back to idle would immediately flash the OLD error
    // again before the user's even attempted a new scan.
    const effectiveStage: Stage = cameraError && stage === "scanning" ? "error" : stage
    const effectiveErrorMessage = cameraError ? CAMERA_ERROR_MESSAGES[cameraError] : errorMessage

    // Stop the camera whenever the dialog closes (or this unmounts) so
    // the browser's camera-in-use indicator doesn't stay lit after the
    // dialog is gone.
    useEffect(() => {
        if (!open) stop()
    }, [open, stop])

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (next) {
                    setOpen(true)
                } else {
                    closeDialog()
                }
            }}
        >
            {/* No asChild — same reasoning as everywhere else in this
                project: style the trigger directly rather than wrap
                another element inside it. */}
            <Button
                onClick={() => setOpen(true)}
                variant="outline"
                className={`flex flex-row h-fit items-center justify-center px-3 py-1.5 w-full font-medium gap-1.5 rounded-sm text-[13px] ${
                    mode === "close"
                        ? "border-[#008AAC] text-[#008AAC] hover:opacity-50 hover:text-[#008AAC]"
                        : "bg-[#008AAC] text-white hover:opacity-50 hover:text-white hover:bg-[#008AAC]/60"
                }`}
            >
                <QrCode className="size-4" />
                {mode === "close" ? "Close via Employee QR Scan" : "Reopen via Employee QR Scan"}
            </Button>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{mode === "close" ? "Close ticket via QR scan" : "Reopen ticket via QR scan"}</DialogTitle>
                    <DialogDescription>
                        {mode === "close"
                            ? "Scan the employee's badge to confirm and close this ticket."
                            : "Scan the employee's badge to confirm and reopen this ticket."}
                    </DialogDescription>
                </DialogHeader>

                {/* Scanner viewport */}
                <div
                    className={`relative flex h-56 items-center justify-center overflow-hidden rounded-xl bg-[#0D1117] transition-colors ${
                        effectiveStage === "success"
                            ? completedMode === "close"
                                ? "ring-2 ring-[#22C55E]"
                                : "ring-2 ring-[#D97706]"
                            : effectiveStage === "error"
                              ? "ring-2 ring-[#EF4444]"
                              : "ring-2 ring-[#1E2736]"
                    }`}
                >
                    {/* Faint grid backdrop, matches idle/scanning states only */}
                    {(effectiveStage === "idle" || effectiveStage === "scanning") && (
                        <div
                            className="absolute inset-0 opacity-40"
                            style={{
                                backgroundImage:
                                    "linear-gradient(rgba(113,190,209,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(113,190,209,0.15) 1px, transparent 1px)",
                                backgroundSize: "20px 20px",
                            }}
                        />
                    )}

                    {/* Live camera feed while scanning */}
                    {effectiveStage === "scanning" && (
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="absolute inset-0 size-full object-cover"
                        />
                    )}

                    {/* Scan frame corners + laser line, overlaid on top of the video */}
                    {effectiveStage === "scanning" && (
                        <div className="relative flex size-36 items-center justify-center">
                            <span className="absolute left-0 top-0 size-6 rounded-tl-lg border-l-[3px] border-t-[3px] border-[#71BED1]" />
                            <span className="absolute right-0 top-0 size-6 rounded-tr-lg border-r-[3px] border-t-[3px] border-[#71BED1]" />
                            <span className="absolute bottom-0 left-0 size-6 rounded-bl-lg border-b-[3px] border-l-[3px] border-[#71BED1]" />
                            <span className="absolute bottom-0 right-0 size-6 rounded-br-lg border-b-[3px] border-r-[3px] border-[#71BED1]" />
                            <ScanLine className="size-8 animate-pulse text-[#71BED1]" />
                        </div>
                    )}

                    {/* Idle */}
                    {effectiveStage === "idle" && (
                        <div className="relative flex flex-col items-center gap-2 text-center">
                            <QrCode className="size-10 text-[#475569]" />
                            <span className="text-xs text-[#64748B]">Start scanning to begin</span>
                        </div>
                    )}

                    {/* Verifying */}
                    {effectiveStage === "verifying" && (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="size-9 animate-spin text-[#71BED1]" />
                            <span className="text-xs text-[#94A3B8]">Verifying…</span>
                        </div>
                    )}

                    {/* Success */}
                    {effectiveStage === "success" && (
                        <div className="flex flex-col items-center gap-2 text-center">
                            <CheckCircle2 className="size-10 text-[#22C55E]" />
                            <span className="text-sm font-semibold text-white">
                                {completedMode === "close" ? "Ticket Resolved" : "Ticket Reopened"}
                            </span>
                        </div>
                    )}

                    {/* Error */}
                    {effectiveStage === "error" && (
                        <div className="flex flex-col items-center gap-2 px-6 text-center">
                            <AlertCircle className="size-10 text-[#EF4444]" />
                            <span className="text-sm font-semibold text-[#FCA5A5]">Scan Failed</span>
                            <span className="text-xs leading-relaxed text-[#94A3B8]">{effectiveErrorMessage}</span>
                        </div>
                    )}
                </div>

                {/* Actions per stage */}
                {effectiveStage === "idle" && (
                    <Button
                        onClick={handleStartScan}
                        className="gap-2 rounded-md bg-linear-to-r from-[#008AAC] to-[#71BED1] hover:opacity-90"
                    >
                        <ScanLine className="size-4" />
                        Start Scanning
                    </Button>
                )}

                {effectiveStage === "scanning" && (
                    <Button variant="outline" onClick={handleRetry} className="rounded-md">
                        Cancel
                    </Button>
                )}

                {effectiveStage === "success" && (
                    <Button
                        onClick={closeDialog}
                        className="rounded-md bg-linear-to-r from-[#008AAC] to-[#71BED1] hover:opacity-90"
                    >
                        Done
                    </Button>
                )}

                {effectiveStage === "error" && (
                    <Button variant="outline" onClick={handleRetry} className="rounded-md">
                        Try Again
                    </Button>
                )}

                {/* Manual fallback — available whenever we're not mid-request
                    or already done, same as the mock. */}
                {(effectiveStage === "idle" || effectiveStage === "scanning") && (
                    <div className="flex flex-col gap-2 border-t border-[#EFEFEF] pt-3">
                        <span className="text-center text-[11px] text-[#94A3B8]">
                            or enter Employee ID manually
                        </span>
                        <div className="flex gap-2">
                            <Input
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value)}
                                placeholder="EMP-0042"
                                className="font-mono"
                                disabled={isPending}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleManualLookup()
                                }}
                            />
                            <Button
                                variant="outline"
                                onClick={handleManualLookup}
                                disabled={isPending || !manualId.trim()}
                                className="shrink-0 rounded-md"
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

