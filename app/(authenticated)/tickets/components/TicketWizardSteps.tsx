interface TicketWizardStepsProps {
  currentStep: 1 | 2 | 3
}

const STEPS = [
  { num: 1, label: 'Fill in ticket details' },
  { num: 2, label: 'Employee QR confirmation' },
  { num: 3, label: 'Ticket created' },
] as const

export function TicketWizardSteps({ currentStep }: TicketWizardStepsProps) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const isDone = s.num < currentStep
        const isActive = s.num === currentStep
        return (
          <div key={s.num} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isDone || isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isDone ? '✓' : s.num}
              </div>
              <span
                className={`whitespace-nowrap text-xs ${
                  isActive ? 'font-bold text-slate-900' : 'font-medium text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-3 h-px flex-1 ${isDone ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}