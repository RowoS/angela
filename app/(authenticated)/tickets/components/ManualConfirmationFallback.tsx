'use client'

import { confirmTicketCreation } from '@/lib/actions/ticket-actions'
import { EmployeeVerification } from '@/components/qr/EmployeeVerification'

interface ManualConfirmationFallbackProps {
  ticketId: string
  onSuccess: () => void
  disabled: boolean
}

export function ManualConfirmationFallback({ ticketId, onSuccess, disabled }: ManualConfirmationFallbackProps) {
  
  const handleConfirm = async (scannedEmployeeNo: string) => {
    await confirmTicketCreation(ticketId, scannedEmployeeNo)
    onSuccess() // Tell the parent component it succeeded!
  }

  return (
    <div className="w-full rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-gray-800">Manual QR Fallback</h3>
      <EmployeeVerification
        title="Employee ID"
        description="Awaiting employee QR scan. To manually confirm this ticket creation, enter the requester's Employee ID below."
        submitLabel="Confirm Ticket"
        submittingLabel="Confirming..."
        onSubmit={handleConfirm}
        disabled={disabled}
        accentColor="blue"
      />
    </div>
  )
}