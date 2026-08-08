"use client"

import React from "react"
import { Users } from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface WorkloadItem {
  agent: string
  in_progress: number
  closed: number
}

interface AgentWorkloadCardProps {
  data: WorkloadItem[]
}

export function AgentWorkloadCard({ data }: AgentWorkloadCardProps) {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl border border-[#e8ecf2] bg-white p-5">
      <div className="mb-3.5 flex items-center gap-1.5 text-sm font-bold text-slate-900">
        <Users size={14} className="text-indigo-600" />
        <span>Agent Workload</span>
      </div>

      <div className="h-[160px] w-full">
        <ResponsiveContainer width="99%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 0, left: 10, bottom: 0 }}
            barSize={7}
            barGap={2}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="agent"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="in_progress"
              fill="#6366f1"
              radius={[0, 4, 4, 0]}
              name="In Progress"
            />
            <Bar
              dataKey="open"
              fill="#cbd5e1"
              radius={[0, 4, 4, 0]}
              name="Open"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex gap-3">
        {[
          { label: "In Progress", color: "#6366f1" },
          { label: "Closed", color: "#cbd5e1" },
        ].map((legend) => (
          <span
            key={legend.label}
            className="flex items-center gap-1 text-[11px] text-slate-500"
          >
            <span
              className="inline-block h-2 w-2 rounded-xs"
              style={{ backgroundColor: legend.color }}
            />
            {legend.label}
          </span>
        ))}
      </div>
    </div>
  )
}