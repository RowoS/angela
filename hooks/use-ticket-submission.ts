import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createDraftTicket } from '@/lib/actions/ticket-actions'
import { useAttachments } from '@/hooks/use-attachments'

const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024 // 20 MB

export function useTicketSubmission() {
  const router = useRouter()
  
  // Basic Form State
  const [resolvedEmployeeId, setResolvedEmployeeId] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [priority, setPriority] = useState('medium')
  const priorityTouched = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submitLock = useRef(false)

  // Attachment State
  const [stagedFiles, setStagedFiles] = useState<File[]>([])
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null)
  const [uploadQueueIndex, setUploadQueueIndex] = useState(0)
  const [uploadPaused, setUploadPaused] = useState(false)
  const hiddenUploadInputRef = useRef<HTMLInputElement>(null)
  
  const [prevIsUploading, setPrevIsUploading] = useState(false)
  const { handleUpload, isUploading: isUploadingAttachment, error: attachmentError } = useAttachments(createdTicketId)

  // 1. Queue Management (Render Phase)
  if (isUploadingAttachment !== prevIsUploading) {
    setPrevIsUploading(isUploadingAttachment)
    if (prevIsUploading === true && isUploadingAttachment === false) {
      if (attachmentError) {
        setUploadPaused(true)
      } else {
        setUploadQueueIndex(uploadQueueIndex + 1)
      }
    }
  }

  // 2. Queue Trigger (Effect Phase)
  useEffect(() => {
    if (!createdTicketId || uploadPaused) return
    if (uploadQueueIndex >= stagedFiles.length) {
      router.push(`/tickets/pending/${createdTicketId}`)
      return
    }
    if (!isUploadingAttachment) {
      const file = stagedFiles[uploadQueueIndex]
      const input = hiddenUploadInputRef.current
      if (file && input) {
        const transfer = new DataTransfer()
        transfer.items.add(file)
        input.files = transfer.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }
  }, [createdTicketId, uploadPaused, uploadQueueIndex, stagedFiles, isUploadingAttachment, router])

  // Handlers
  const handleSubmit = async (formData: FormData) => {
    if (submitLock.current || createdTicketId) return
    submitLock.current = true
    setIsSubmitting(true)
    setError(null)

    try {
      if (!resolvedEmployeeId) throw new Error('Please ensure a valid active requester is found before submitting.')
      if (!selectedCategoryId) throw new Error('Please select a valid ticket category.')

      formData.set('category_id', selectedCategoryId)
      formData.set('priority', priority)

      const ticket = await createDraftTicket(formData)
      const ticketId = ticket?.id || (Array.isArray(ticket) ? ticket[0]?.id : null)

      if (!ticketId) throw new Error('Ticket drafted successfully, but the server failed to return the Ticket ID.')

      setIsSubmitting(false)
      setCreatedTicketId(ticketId)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setIsSubmitting(false)
      submitLock.current = false
    }
  }

  const addFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files)
    const accepted: File[] = []
    let rejectedForSize = false

    for (const file of incoming) {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        rejectedForSize = true
        continue
      }
      accepted.push(file)
    }

    if (rejectedForSize) setError('One or more files exceed the 20 MB limit and were not added.')

    setStagedFiles((current) => {
      const existingKeys = new Set(current.map((f) => `${f.name}-${f.size}`))
      const deduped = accepted.filter((f) => !existingKeys.has(`${f.name}-${f.size}`))
      return [...current, ...deduped]
    })
  }

  const removeStagedFile = (index: number) => {
  setStagedFiles((current) => current.filter((_, i) => i !== index))
}

const handlePriorityChange = (val: string) => {
  priorityTouched.current = true
  setPriority(val)
}

return {
  state: {
    resolvedEmployeeId, selectedCategoryId, priority, isSubmitting, error,
    stagedFiles, createdTicketId, uploadQueueIndex, uploadPaused, 
    isUploadingAttachment, attachmentError
  },
  refs: { hiddenUploadInputRef, priorityTouched },
  setters: { setResolvedEmployeeId, setSelectedCategoryId, setPriority, setError, setStagedFiles, setUploadPaused, setUploadQueueIndex },
  handlers: { 
    handleSubmit, 
    addFiles, 
    handleUpload, 
    removeStagedFile,     
    handlePriorityChange   
  }
}
}

