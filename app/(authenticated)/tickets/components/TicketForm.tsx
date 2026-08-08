'use client'

import type { ReactNode } from 'react'
import { User } from 'lucide-react'
import { EmployeeLookup } from './EmployeeLookup'
import { CategorySelector } from './CategorySelector'
import { TicketWizardSteps } from './TicketWizardSteps'
import { TicketPriority } from './TicketPriority'
import { PendingTicketAttachments } from './PendingTicketAttachments'
import { useTicketCategories } from '@/hooks/use-ticket-categories'
import { useTicketSubmission } from '@/hooks/use-ticket-submission'

function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-red-600">*</span>}
    </label>
  )
}

export function TicketForm() {
  const { categories } = useTicketCategories()
  
  // All state and submission logic is now neatly encapsulated here
  const { state, refs, setters, handlers } = useTicketSubmission()

  const handleCategorySelected = (id: string) => {
    setters.setSelectedCategoryId(id)

    // Pre-fills priority from the category's default the moment a category
    // is chosen, unless the agent has already overridden it manually.
    if (!refs.priorityTouched.current && id) {
      const category = categories.find((c) => c.id === id)
      if (category) setters.setPriority(category.default_priority)
    }
  }

  const retryUpload = () => setters.setUploadPaused(false)
  const skipFailedUpload = () => {
    setters.setUploadPaused(false)
    setters.setUploadQueueIndex((i: number) => i + 1)
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <TicketWizardSteps currentStep={1} />

      <form action={handlers.handleSubmit} className="flex flex-col gap-5 rounded-xl border border-[#e8ecf2] bg-white p-7">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
          <User size={14} className="shrink-0 text-indigo-600" />
          <span className="text-xs text-slate-500">
            You are entering this ticket on behalf of an employee. Their identity will be confirmed via QR
            scan before submission.
          </span>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold text-slate-900">Requester Information</h2>
          <EmployeeLookup onEmployeeFound={(id) => setters.setResolvedEmployeeId(id)} />
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-5">
          <h2 className="text-sm font-bold text-slate-900">Ticket Details</h2>

          <div>
            <FieldLabel required>Title</FieldLabel>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. Cannot connect to VPN from home office"
              className="w-full rounded-lg border border-slate-200 p-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <FieldLabel required>Description</FieldLabel>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              placeholder="Describe the issue in detail. Include error messages, steps to reproduce, and impact on work."
              className="w-full resize-none rounded-lg border border-slate-200 p-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-5">
          <h2 className="text-sm font-bold text-slate-900">Classification</h2>
          <CategorySelector onCategorySelected={handleCategorySelected} />
        </div>

        <TicketPriority 
          priority={state.priority} 
          onPriorityChange={handlers.handlePriorityChange}
        />

        <PendingTicketAttachments 
          stagedFiles={state.stagedFiles}
          addFiles={handlers.addFiles}
          removeStagedFile={handlers.removeStagedFile}
          createdTicketId={state.createdTicketId}
          uploadQueueIndex={state.uploadQueueIndex}
          isUploadingAttachment={state.isUploadingAttachment}
          uploadPaused={state.uploadPaused}
          hiddenUploadInputRef={refs.hiddenUploadInputRef}
          handleUpload={handlers.handleUpload}
        />

        {(state.error || (state.uploadPaused && state.attachmentError)) && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {state.uploadPaused && state.attachmentError
              ? `Failed to upload "${state.stagedFiles[state.uploadQueueIndex]?.name}": ${state.attachmentError}`
              : state.error}
            {state.uploadPaused && (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={retryUpload}
                  className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Retry Upload
                </button>
                <button
                  type="button"
                  onClick={skipFailedUpload}
                  className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  Skip This File
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-1">
          {state.createdTicketId ? (
            <span className="text-sm font-medium text-slate-500">
              {state.uploadQueueIndex < state.stagedFiles.length
                ? `Uploading attachment ${state.uploadQueueIndex + 1} of ${state.stagedFiles.length}...`
                : 'Ticket created — redirecting...'}
            </span>
          ) : (
            <button
              type="submit"
              disabled={state.isSubmitting || !state.resolvedEmployeeId || !state.selectedCategoryId}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.isSubmitting ? 'Creating Draft...' : 'Create Draft Ticket'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}