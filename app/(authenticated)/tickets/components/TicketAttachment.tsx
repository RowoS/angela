'use client'

import { useAttachments } from '@/hooks/use-attachments'
import type { ValidStatus } from '@/hooks/use-ticket-controls'
import type { AttachmentRow } from '@/lib/types/tickets'

interface TicketAttachmentsProps {
  ticketId: string
  ticketStatus: ValidStatus | 'pending_confirmation'
  attachments: AttachmentRow[]
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function truncateFilename(filename: string, maxLength = 30) {
  if (filename.length <= maxLength) return filename

  const extensionIndex = filename.lastIndexOf('.')
  
  if (extensionIndex === -1 || extensionIndex === 0) {
    return filename.substring(0, maxLength) + '...'
  }

  const extension = filename.substring(extensionIndex)
  const name = filename.substring(0, extensionIndex)
  

  const allowedNameLength = maxLength - extension.length - 3

  return name.substring(0, allowedNameLength) + '...' + extension
}

export function TicketAttachments({ ticketId, ticketStatus, attachments }: TicketAttachmentsProps) {
  const { isUploading, isDeleting, isDownloading, error, handleUpload, handleDelete, handleDownload } =
    useAttachments(ticketId)

  const canDelete = ticketStatus === 'pending_confirmation'

  return (
    <div className="flex flex-col space-y-4">
      {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>}

      <div className="flex flex-col space-y-3">
        {attachments.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No attachments found.</p>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-md">
            {attachments.map((file) => (
              <li key={file.id} className="p-3 flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 truncate max-w-xs md:max-w-md" title={file.original_filename}>
                    {truncateFilename(file.original_filename, 35)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatBytes(file.size_bytes)} • Uploaded by {file.uploaded_by?.full_name || 'Unknown'}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleDownload(file.id)}
                    disabled={isDownloading === file.id}
                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50 font-medium text-xs transition-colors"
                  >
                    {isDownloading === file.id ? 'Preparing...' : 'Download'}
                  </button>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(file.id, file.storage_path)}
                      disabled={isDeleting === file.id || isUploading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 font-medium text-xs transition-colors"
                    >
                      {isDeleting === file.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-2">
        <label className="inline-block px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 cursor-pointer transition-colors disabled:opacity-50">
          {isUploading ? 'Uploading...' : '+ Add File'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
        </label>
      </div>
    </div>
  )
}