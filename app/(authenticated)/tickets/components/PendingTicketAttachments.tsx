'use client'

import { useState, type RefObject } from 'react'
import { Paperclip, X } from 'lucide-react'

interface TicketAttachmentsProps {
  stagedFiles: File[]
  addFiles: (files: FileList | File[]) => void
  removeStagedFile: (index: number) => void
  createdTicketId: string | null
  uploadQueueIndex: number
  isUploadingAttachment: boolean
  uploadPaused: boolean
  hiddenUploadInputRef: RefObject<HTMLInputElement | null> 
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function PendingTicketAttachments({
  stagedFiles,
  addFiles,
  removeStagedFile,
  createdTicketId,
  uploadQueueIndex,
  isUploadingAttachment,
  uploadPaused,
  hiddenUploadInputRef,
  handleUpload,
}: TicketAttachmentsProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  return (
    <div className="border-t border-slate-100 pt-5">
      <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700">
        Attachments
      </label>

      {/* Drag & Drop Zone */}
      <label
        onDragOver={(e) => {
          e.preventDefault()
          if (!createdTicketId) setIsDraggingOver(true)
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDraggingOver(false)
          if (!createdTicketId && e.dataTransfer.files.length) {
            addFiles(e.dataTransfer.files)
          }
        }}
        className={`flex flex-col items-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors ${
          createdTicketId
            ? 'pointer-events-none border-slate-200 opacity-60'
            : isDraggingOver
              ? 'cursor-pointer border-indigo-400 bg-indigo-50/50'
              : 'cursor-pointer border-slate-200 hover:border-indigo-300'
        }`}
      >
        <Paperclip size={20} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-600">
          Drop files here or click to upload
        </span>
        <span className="text-xs text-slate-400">
          Screenshots, logs, documents — max 20 MB per file
        </span>
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files)
            e.target.value = '' // reset so the same file can be selected again if removed
          }}
        />
      </label>

      {/* Staged Files List */}
      {stagedFiles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {stagedFiles.map((file, i) => {
            const isCurrentlyUploading = createdTicketId !== null && uploadQueueIndex === i && isUploadingAttachment
            const isFailed = createdTicketId !== null && uploadPaused && uploadQueueIndex === i
            const isUploaded = createdTicketId !== null && i < uploadQueueIndex

            return (
              <div
                key={`${file.name}-${file.size}-${i}`}
                className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
                  isFailed
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : isUploaded
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-slate-200 text-slate-600'
                }`}
              >
                {isCurrentlyUploading ? `Uploading ${file.name}...` : file.name}
                {!createdTicketId && (
                  <button
                    type="button"
                    onClick={() => removeStagedFile(i)}
                    className="flex text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Hidden input used programmatically by the orchestrator hook for uploading to the server */}
      <input 
        ref={hiddenUploadInputRef} 
        type="file" 
        className="hidden" 
        onChange={handleUpload} 
      />
    </div>
  )
}