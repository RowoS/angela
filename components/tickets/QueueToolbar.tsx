"use client"

import { Search, Filter, Download } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { TicketPriority } from "@/lib/types/tickets"
import { ManualStatus } from "@/hooks/use-ticket-controls"

const STATUS_TABS: { value: ManualStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "open", label: "open" },
    { value: "in_progress", label: "in progress" },
    { value: "on_hold", label: "on hold" },
    { value: "resolved", label: "resolved" },
]

const PRIORITY_TABS: { value: TicketPriority | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "critical", label: "critical" },
    { value: "high", label: "high" },
    { value: "medium", label: "medium" },
    { value: "low", label: "low" },
]

const MOBILE_SELECT_TRIGGER_CLASS =
    "h-8.5 w-full min-w-0 rounded-lg border-[#E2E2E2] text-black/55"

function getTabLabel(tabs: { value: string; label: string }[], value: string | null, allLabel: string) {
    if (!value || value === "all") return allLabel
    return tabs.find((t) => t.value === value)?.label ?? allLabel
}

export function QueueToolbar({ categories }: { categories: string[] }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const currentStatus = searchParams.get("status") ?? "all"
    const currentPriority = searchParams.get("priority") ?? "all"
    const currentCategory = searchParams.get("category") ?? "all"
    const currentSearch = searchParams.get("search") ?? ""

    const setParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === "all" || value === "") {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleExportCsv = () => {
        const params = new URLSearchParams(searchParams.toString())
        window.location.href = `/api/tickets/export?${params.toString()}`
    }

    return (
        <div className="flex flex-col gap-3">
            {/* ================= MOBILE (below md) ================= */}
            <div className="flex flex-col gap-3 md:hidden">
                <div className="relative flex w-full">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8A8A8A]" />
                    <Input
                        defaultValue={currentSearch}
                        onChange={(e) => setParam("search", e.target.value)}
                        placeholder="Search by title, ticket ID, or employee ID..."
                        className="h-10 w-full rounded-lg border-[#E2E2E2] bg-[#FAFAFA] pl-9 focus-visible:ring-1 focus-visible:ring-[#0D90B0]/80"
                    />
                </div>

                {/* Status + Priority as selects, side by side */}
                <div className="flex items-center gap-2">
                    <Select value={currentStatus} onValueChange={(v) => setParam("status", v ?? "all")}>
                        <SelectTrigger className={MOBILE_SELECT_TRIGGER_CLASS}>
                            <SelectValue>
                                {(value: string | null) => getTabLabel(STATUS_TABS, value, "All statuses")}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_TABS.map((tab) => (
                                <SelectItem key={tab.value} value={tab.value}>
                                    {tab.value === "all" ? "All statuses" : tab.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={currentPriority} onValueChange={(v) => setParam("priority", v ?? "all")}>
                        <SelectTrigger className={MOBILE_SELECT_TRIGGER_CLASS}>
                            <SelectValue>
                                {(value: string | null) => getTabLabel(PRIORITY_TABS, value, "All priorities")}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {PRIORITY_TABS.map((tab) => (
                                <SelectItem key={tab.value} value={tab.value}>
                                    {tab.value === "all" ? "All priorities" : tab.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Category + Export, side by side. Export keeps its
                    text visible here. */}
                <div className="flex items-center gap-2">
                    <Select value={currentCategory} onValueChange={(v) => setParam("category", v ?? "all")}>
                        <SelectTrigger className={MOBILE_SELECT_TRIGGER_CLASS}>
                            <SelectValue>
                                {(value: string | null) => (!value || value === "all" ? "All categories" : value)}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="w-max min-w-(--anchor-width)">
                            <SelectItem value="all">All categories</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        onClick={handleExportCsv}
                        className="h-8.5 shrink-0 gap-2 rounded-md border border-[#D1D1D1] bg-white text-black/55 transition-colors hover:text-[#008AAC]"
                    >
                        <Download className="size-4" />
                        <span>Export CSV</span>
                    </Button>
                </div>
            </div>

            {/* ================= DESKTOP/TABLET (md and up) ================= */}
            <div className="hidden md:flex md:flex-col md:gap-3">
                {/* Row 1: search + status tabs */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-7">
                    <div className="relative flex w-full min-w-0 md:flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8A8A8A]" />
                        <Input
                            defaultValue={currentSearch}
                            onChange={(e) => setParam("search", e.target.value)}
                            placeholder="Search by title, ticket ID, or employee ID..."
                            className="h-8.5 w-full rounded-lg border-[#E2E2E2] bg-[#FAFAFA] pl-9 focus-visible:ring-1 focus-visible:ring-[#0D90B0]/80"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-center">
                        <span className="flex items-center gap-1 text-xs font-semibold tracking-wide text-[#8A8A8A]">
                            <Filter className="size-3.5" />
                            STATUS:
                        </span>
                        <div className="flex flex-wrap items-center justify-center gap-1">
                            {STATUS_TABS.map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setParam("status", tab.value)}
                                    className={`rounded-sm px-3 py-2 text-xs font-semibold transition-colors ${
                                        currentStatus === tab.value
                                            ? "bg-[#008AAC] text-white"
                                            : "bg-white text-black/55 hover:bg-[#E5E5E5] border"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 2: priority tabs + category dropdown + export */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold tracking-wide text-[#8A8A8A]">PRIORITY:</span>
                        <div className="flex flex-wrap items-center justify-center gap-1">
                            {PRIORITY_TABS.map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setParam("priority", tab.value)}
                                    className={`rounded-sm px-3 py-2 text-xs font-semibold transition-colors ${
                                        currentPriority === tab.value
                                            ? "bg-[#008AAC] text-white"
                                            : "bg-white text-black/55 hover:bg-[#E5E5E5] border"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                        <Select value={currentCategory} onValueChange={(v) => setParam("category", v ?? "all")}>
                            <SelectTrigger className="h-8.5 w-full min-w-0 rounded-lg border-[#E2E2E2] text-black/55 md:w-40 lg:w-56 xl:w-70">
                                <SelectValue>
                                    {(value: string | null) => (!value || value === "all" ? "All categories" : value)}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                {categories.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            onClick={handleExportCsv}
                            className="h-8.5 shrink-0 gap-2 rounded-md border border-[#D1D1D1] bg-white text-black/55 transition-colors hover:text-[#008AAC]"
                        >
                            <Download className="size-4" />
                            <span>Export CSV</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}