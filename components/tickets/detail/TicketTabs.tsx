"use client"

import { useState } from "react"
import { MessageSquare, History, Paperclip } from "lucide-react"

type Tab = "comments" | "audit" | "attachments"

export function TicketTabs({
    commentCount,
    attachmentCount,
    commentsPanel,
    auditPanel,
    attachmentsPanel,
}: {
    commentCount: number
    attachmentCount: number
    commentsPanel: React.ReactNode
    auditPanel: React.ReactNode
    attachmentsPanel: React.ReactNode
}) {
    const [activeTab, setActiveTab] = useState<Tab>("comments")

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: "comments", label: `Comments (${commentCount})`, icon: MessageSquare },
        { id: "audit", label: "Audit Log", icon: History },
        { id: "attachments", label: `Attachments (${attachmentCount})`, icon: Paperclip },
    ]

    return (
        <div className="flex flex-col rounded-xl border border-[#EFEFEF] bg-white px-[18px] py-5">
            <div className="flex items-center gap-6 border-b border-[#EFEFEF]">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const active = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 border-b-2 pb-2 text-xs font-medium transition-colors ${
                                active
                                    ? "border-[#008AAC] text-[#008AAC]"
                                    : "border-transparent text-[#8A8A8A] hover:text-[#5B5B5B]"
                            }`}
                        >
                            <Icon className="size-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {activeTab === "comments" && commentsPanel}
            {activeTab === "audit" && auditPanel}
            {activeTab === "attachments" && attachmentsPanel}
        </div>
    )
}