export function ErrorState({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-center min-h-28 ${className}`}>
      <p className="text-sm text-red-600">Couldn&apos;t load {label}.</p>
    </div>
  )
}