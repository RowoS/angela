import React from "react"

export default function TicketLayout ({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col w-full px-7 pt-7 items-center justify-center">
            {children}
        </div>
    )
}