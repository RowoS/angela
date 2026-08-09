// app/(authenticated)/admin/components/DashboardStats.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Clock, CheckCircle2, Users } from 'lucide-react'
import StatCard from './StatCard'
import { StatCard2 } from './StatCard2'
import { TicketVolCard } from './TicketVolCard'
import { ByCategoryCard } from './ByCategory'
import { RecentTicketCard } from './RecentTicket'
import { ActivityLogCard } from './ActivityLog'
import { AgentWorkloadCard } from './AgentWorkload'
import { ErrorState } from './ErrorState'
import {
  toStatCards,
  toCategorySeries,
  toRecentTicketItems,
  toActivityItems,
  toWorkloadItems,
  computeResolutionRate,
  formatMinutes
} from '@/lib/dashboard-adapters'
import type {
  DashboardCounts,
  RecentTicket,
  CategoryBreakdown,
  OpenedBucket,
  RecentActivity,
  AgentWorkload,
  AvgFirstResponse
} from '@/lib/actions/dashboard-actions'

interface DashboardStatsProps {
  role: 'admin' | 'agent' | 'manager'
  counts: DashboardCounts | null
  recentTickets: RecentTicket[] | null
  byCategory: CategoryBreakdown[] | null
  initialOpened: OpenedBucket[] | null
  recentActivity: RecentActivity[] | null
  agentWorkload: AgentWorkload[] | null
  avgFirstResponse: AvgFirstResponse | null
}

export default function DashboardView({
  role,
  counts,
  recentTickets,
  byCategory,
  initialOpened,
  recentActivity,
  agentWorkload,
  avgFirstResponse
}: DashboardStatsProps) {
  const isAdmin = role === 'admin'
  const router = useRouter()
  const resolutionRate = isAdmin && agentWorkload?.length ? computeResolutionRate(agentWorkload) : null
  const avgResponseValue = avgFirstResponse && avgFirstResponse.sampleSize > 0 ? formatMinutes(avgFirstResponse.avgMinutes): '-'

  return (
    <div className="flex flex-col w-full">
      <div className="flex p-7 flex-1">
        <div className="flex flex-col w-full gap-7">

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            {counts ? (
              toStatCards(counts).map((c) => <StatCard key={c.label} {...c} />)
            ) : (
              <div className="sm:col-span-4"><ErrorState label="ticket counts" /></div>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-5">
            <TicketVolCard initial={initialOpened} />
            {byCategory ? (
              <ByCategoryCard data={toCategorySeries(byCategory)} />
            ) : (
              <ErrorState label="category breakdown" className="w-full md:w-2/5" />
            )}
          </div>

          <div className="w-full flex flex-col lg:flex-row justify-between gap-5">
            {role !== 'manager' && (
              recentTickets ? (
                <RecentTicketCard
                  tickets={toRecentTicketItems(recentTickets)}
                  onSelectTicket={(id) => router.push(`/tickets/${id}`)}
                />
              ) : (
                <ErrorState label="recent tickets" className="lg:w-4/7" />
              )
            )}

            {isAdmin && (
              <div className="w-full lg:w-3/7 flex flex-col sm:flex-row gap-5">
                <div className="flex-1 min-w-0">
                  {recentActivity ? (
                    <ActivityLogCard items={toActivityItems(recentActivity)} onViewAll={() => router.push('/admin/activity')} />
                  ) : (
                    <ErrorState label="activity log" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {agentWorkload ? (
                    <AgentWorkloadCard data={toWorkloadItems(agentWorkload)} />
                  ) : (
                    <ErrorState label="agent workload" />
                  )}
                </div>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <StatCard2 label="Avg. First Response" value={avgResponseValue} icon={<Clock size={16} />} color="#6366f1" />
              <StatCard2
                label="Resolution Rate"
                value={resolutionRate !== null ? `${resolutionRate}%` : '—'}
                icon={<CheckCircle2 size={16} />}
                color="#10b981"
              />
              <StatCard2 label="Agents Online" value="—" icon={<Users size={16} />} color="#8b5cf6" />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}