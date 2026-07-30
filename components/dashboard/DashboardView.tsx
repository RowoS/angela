import DashboardHeader from "@/components/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import { Zap } from "lucide-react";
import type { StatCardProps } from './StatCard' // adjust your import path

export const mockStatCardData: StatCardProps = {
  label: 'Open Tickets',
  value: '3',
  sub: 'Awaiting assignment or first response',
  icon: Zap,
  accent: '#8A38F5', // or an accent color code like '#10B981' depending on how you use it
}

export default function DashboardViewPage() {
    return (
        <div className="flex flex-col w-full">
            <DashboardHeader menuItem="Dashboard" />
            <div className="flex px-7 pt-7 flex-1">
                <div className="flex flex-col flex-1 gap-7">
                    <div className="flex flex-row justify-between gap-5">
                        <StatCard {...mockStatCardData} />
                        <StatCard {...mockStatCardData} />
                        <StatCard {...mockStatCardData} />
                        <StatCard {...mockStatCardData} />
                    </div>
                    saddsd
                </div>
            </div>
        </div>
    )
}