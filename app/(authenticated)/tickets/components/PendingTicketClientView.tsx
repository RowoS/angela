'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ComponentProps } from 'react'

import type { Tables } from '@/lib/supabase/types' 

import { TicketWizardSteps } from './TicketWizardSteps'
import { ManualConfirmationFallback } from './ManualConfirmationFallback'
import { TicketAttachments } from './TicketAttachment'
import { PriorityBadge } from '@/components/Badges'

// 1. Pick exactly what we need from the Supabase tickets table row type
interface PendingTicketClientViewProps {
  ticket: Pick<Tables<'tickets'>, 'id' | 'ticket_number' | 'title' | 'priority' | 'status'>
  // 2. Automatically extract whatever type TicketAttachments expects
  attachments: ComponentProps<typeof TicketAttachments>['attachments']
}

export function PendingTicketClientView({ ticket, attachments }: PendingTicketClientViewProps) {
  const router = useRouter()
  const [success, setSuccess] = useState(false)

  const handleSuccess = () => {
    setSuccess(true)
    setTimeout(() => {
      router.push(`/tickets/${ticket.id}`)
    }, 1000)
  }

  return (
    <div className="flex flex-col items-center gap-5 p-10">
      <div className="w-full max-w-4xl">
        <TicketWizardSteps currentStep={success ? 3 : 2} />
      </div>

      <div className="mt-5 w-full max-w-md rounded-xl border border-slate-100 bg-white p-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-indigo-600">{ticket.ticket_number}</span>
          <PriorityBadge priority={ticket.priority} />
        </div>
        <h2 className="mb-2 text-base font-bold text-slate-900">{ticket.title}</h2>
        <p className="text-sm text-slate-500">
          Awaiting the requester&apos;s QR confirmation before this ticket enters the queue.
        </p>
      </div>

      <div className="w-full max-w-md rounded-xl border border-slate-100 bg-white p-6">
        <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Attachments</h3>
        <p className="mb-3 text-xs text-slate-400">
          Add screenshots or logs now — once confirmed, attachments can no longer be removed.
        </p>
        <TicketAttachments ticketId={ticket.id} ticketStatus="pending_confirmation" attachments={attachments} />
      </div>

      <div className="w-full max-w-md">
        <ManualConfirmationFallback 
          ticketId={ticket.id} 
          onSuccess={handleSuccess} 
          disabled={success} 
        />
      </div>
    </div>
  )
}