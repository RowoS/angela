import React from "react"
import { LucideIcon } from "lucide-react" 

export interface StatCardProps {
    label: string
    value: string | number
    sub: string
    icon: LucideIcon
    accent: string
}

export default function StatCard({ label, value, sub, icon: Icon, accent }: StatCardProps) {
    return (
        <div className="flex items-center justify-center h-28 rounded-lg bg-[#FFFFFF] w-full px-6 py-3.5">
            <div className="flex flex-col gap-2 flex-1">
                <div className="flex flex-row gap-2">
                    <div className="flex flex-col w-full font-redhat">
                        <span className="text-[#26343A] font-bold uppercase text-xs">
                            {label}
                        </span>
                        <span className="text-2xl font-extrabold bg-linear-to-r from-[#008AAC] to-[#71BED1] bg-clip-text text-transparent">
                            {value}
                        </span>
                    </div>
                    <div className="relative w-full">
                        <div 
                            className={`absolute flex w-9 h-9 p-2.5 top-0 right-0 rounded-lg justify-center items-center`}
                            style={{
                                backgroundColor: `${accent}33`,
                                color: accent
                            }}
                        >
                            <Icon className="w-3 h-4"/>
                        </div>
                    </div>
                </div>
                <span className="font-sans font-light text-[8px] text-black/50">
                    {sub}
                </span>
            </div>
        </div>
    )
}