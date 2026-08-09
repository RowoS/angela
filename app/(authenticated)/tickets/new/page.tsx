import { TicketForm } from '@/app/(authenticated)/tickets/components/TicketForm'

export default function NewTicketPage() {
  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-center p-7">
        <TicketForm />
      </div>
    </div>
  )
}