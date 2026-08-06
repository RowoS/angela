import { useState } from 'react'
import { uploadAttachment, deleteAttachment, getAttachmentDownloadUrl } from '@/lib/actions/ticket-actions'

export function useAttachments(ticketId: string) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      await uploadAttachment(ticketId, formData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Failed to upload attachment.')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (attachmentId: string, storagePath: string) => {
    setIsDeleting(attachmentId)
    setError(null)

    try {
      await deleteAttachment(ticketId, attachmentId, storagePath)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Failed to delete attachment.')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleDownload = async (attachmentId: string) => {
    setIsDownloading(attachmentId)
    setError(null)

    try {
      const url = await getAttachmentDownloadUrl(ticketId, attachmentId)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Failed to download attachment.')
    } finally {
      setIsDownloading(null)
    }
  }

  return {
    isUploading,
    isDeleting,
    isDownloading,
    error,
    handleUpload,
    handleDelete,
    handleDownload,
  }
}