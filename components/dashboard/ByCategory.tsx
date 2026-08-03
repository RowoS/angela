"use client"

import React from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e"]

interface CategoryItem {
  name: string
  value: number
}

interface ByCategoryCardProps {
  data: CategoryItem[]
}

export function ByCategoryCard({ data }: ByCategoryCardProps) {
  return (
    <div className="w-2/5 rounded-xl border border-[#e8ecf2] bg-white p-5.5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">By Category</h3>
        <p className="mt-0.5 text-xs text-slate-400">This month</p>
      </div>

      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
        {data.slice(0, 4).map((c, i) => (
          <span
            key={c.name}
            className="flex items-center gap-1 text-[11px] text-slate-500"
          >
            <span
              className="inline-block h-2 w-2 rounded-xs"
              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            {c.name}
          </span>
        ))}
      </div>
    </div>
  )
}