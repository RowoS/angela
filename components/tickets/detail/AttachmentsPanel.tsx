"use client"

import { useRef, useState, useTransition } from "react"
import { Download, Upload, Trash2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AttachmentRow } from "@/app/(authenticated)/tickets/components/TicketAttachment"
import {
    getAttachmentDownloadUrl,
    uploadAttachment,
    deleteAttachment,
} from "@/lib/actions/ticket-actions" // ADJUST if this differs from the real export path

function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B"
    const units = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

export function AttachmentsPanel({
    ticketId,
    attachments,
}: {
    ticketId: string
    attachments: AttachmentRow[]
}) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDownload = (attachmentId: string) => {
        startTransition(async () => {
            try {
                const url = await getAttachmentDownloadUrl(ticketId, attachmentId)
                window.open(url, "_blank", "noopener,noreferrer")
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to generate download link")
            }
        })
    }

    const handleDelete = (attachmentId: string, storagePath: string) => {
        startTransition(async () => {
            try {
                await deleteAttachment(ticketId, attachmentId, storagePath)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to delete attachment")
            }
        })
    }

    const handleUpload = (file: File) => {
        setError(null)
        const formData = new FormData()
        formData.set("file", file)
        startTransition(async () => {
            try {
                await uploadAttachment(ticketId, formData)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed")
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = ""
            }
        })
    }

    return (
        <div className="flex flex-col gap-2 pt-5">
            {attachments.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#8A8A8A]">No attachments.</p>
            ) : (
                attachments.map((a) => (
                    <div
                        key={a.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[#EFEFEF] p-3"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <FileText className="size-5 shrink-0 text-[#8A8A8A]" />
                            <div className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-medium text-[#26242A]">
                                    {a.original_filename}
                                </span>
                                <span className="text-xs text-[#8A8A8A]">
                                    {formatBytes(a.size_bytes)} · 
                                    <span className="text-[#008AAC]">{" "}{a.uploaded_by?.full_name ?? "Unknown"}</span>
                                </span>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isPending}
                                onClick={() => handleDownload(a.id)}
                                aria-label="Download"
                            >
                                <Download className="size-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isPending}
                                onClick={() => handleDelete(a.id, a.storage_path)}
                                aria-label="Delete"
                            >
                                <Trash2 className="size-4 text-[#D92D20]" />
                            </Button>
                        </div>
                    </div>
                ))
            )}

            {error && <p className="text-xs text-[#D92D20]">{error}</p>}

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(file)
                }}
            />
            <Button
                variant="outline"
                disabled={isPending}
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 bg-[#008AAC] text-white hover:opacity-50 hover:text-white hover:bg-[#008AAC]/60 flex flex-row h-fit items-center justify-center px-3 py-2 w-full font-medium rounded-sm"
            >
                <Upload className="size-4" />
                {isPending ? "Uploading..." : "Add attachment"}
            </Button>
        </div>
    )
}