import React from "react"

export interface StatCard2Props {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}

export function StatCard2({ label, value, icon, color }: StatCard2Props) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-[#e8ecf2] bg-white px-5 py-4">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}18`, color }}
      >
        {icon}
      </div>
      <div>
        <div className="font-mono text-xl font-extrabold tracking-tight text-slate-900">
          {value}
        </div>
        <div className="mt-0.5 text-xs text-slate-400">{label}</div>
      </div>
    </div>
  )
}