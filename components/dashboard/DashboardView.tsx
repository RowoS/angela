"use client"

import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import { Zap, TrendingUp, TriangleAlert, Clock4, Clock, CheckCircle2, Users } from "lucide-react";
import type { StatCardProps } from './StatCard' // adjust your import path
import { TicketVolCard } from "./TicketVolCard";
import { ByCategoryCard } from "./ByCategory";
import { RecentTicketCard, TICKETS } from "./RecentTicket";
import { ACTIVITY_LOG, ActivityLogCard } from "./ActivityLog";
import { AgentWorkloadCard } from "./AgentWorkload";
import { StatCard2 } from "./StatCard2";

const mockStatCardData: StatCardProps[] = [
    {
        label: 'Open Tickets',
        value: '3',
        sub: 'Awaiting assignment or first response',
        icon: Zap,
        accent: '#8A38F5', // or an accent color code like '#10B981' depending on how you use it
    },
    {
        label: 'In Progress',
        value: '2',
        sub: 'Currently being worked on',
        icon: TrendingUp,
        accent: '#1949CF'
    },
    {
        label: 'SLA Breached',
        value: '1',
        sub: 'Past resolution deadline',
        icon: TriangleAlert,
        accent: '#DD1515'
    },
    {
        label: 'SLA Warning',
        value: '3',
        sub: 'Approaching resolution deadline',
        icon: Clock4,
        accent: '#FF9100'
    }
]

const mockTicketVolData = [
    { month: 'Jan', tickets: 30 },
    { month: 'Feb', tickets: 45 },
    { month: 'Mar', tickets: 60 },
    { month: 'Apr', tickets: 50 },
    { month: 'May', tickets: 70 },
    { month: 'Jun', tickets: 90 },
    { month: 'Jul', tickets: 80 },
    { month: 'Aug', tickets: 100 },
    { month: 'Sep', tickets: 110 },
    { month: 'Oct', tickets: 95 },
    { month: 'Nov', tickets: 120 },
    { month: 'Dec', tickets: 130 },
]

const mockByCategoryData = [
    { name: 'Software', value: 30 },
    { name: 'Hardware', value: 25 },
    { name: 'Network', value: 20 },
    { name: 'Security', value: 15 },
    { name: 'Other', value: 10 },
]

export const AGENT_WORKLOAD = [
  { agent: "Sofia R.",  open: 8, in_progress: 5, resolved: 12 },
  { agent: "Dmitri V.", open: 6, in_progress: 3, resolved: 9  },
  { agent: "Hana M.",   open: 4, in_progress: 6, resolved: 7  },
  { agent: "Marcus W.", open: 2, in_progress: 2, resolved: 5  },
];

export default function DashboardViewPage() {
    const recentTickets = TICKETS.filter((t) => t.status !== "closed").slice(0, 5)
    const recentActivity = ACTIVITY_LOG.slice(0, 7);

    return (
        <div className="flex flex-col w-full">
            <DashboardHeader menuItem="Dashboard" />
            <div className="flex p-7 flex-1">
                <div className="flex flex-col w-full gap-7">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                        <StatCard {...mockStatCardData[0]} />
                        <StatCard {...mockStatCardData[1]} />
                        <StatCard {...mockStatCardData[2]} />
                        <StatCard {...mockStatCardData[3]} />
                    </div>
                    <div className="flex flex-row justify-between gap-5">
                        <TicketVolCard data={mockTicketVolData} />
                        <ByCategoryCard data={mockByCategoryData} />
                    </div>
                    <div className="w-full flex flex-row justify-between gap-5">
                        <RecentTicketCard 
                            tickets={recentTickets} 
                            onSelectTicket={(id) => console.log("Select ticket", id)} 
                        />
                        <div className="w-3/7 flex flex-row gap-5">
                            <div className="flex-1 min-w-0">
                                <ActivityLogCard 
                                    items={recentActivity}
                                    onViewAll={() => console.log("View all activity")}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <AgentWorkloadCard data={AGENT_WORKLOAD} />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <StatCard2
                            label="Avg. First Response"
                            value="1h 24m"
                            icon={<Clock size={16} />}
                            color="#6366f1"
                        />
                        <StatCard2
                            label="Resolution Rate (7d)"
                            value="87%"
                            icon={<CheckCircle2 size={16} />}
                            color="#10b981"
                        />
                        <StatCard2
                            label="Agents Online"
                            value="3 / 4"
                            icon={<Users size={16} />}
                            color="#8b5cf6"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}