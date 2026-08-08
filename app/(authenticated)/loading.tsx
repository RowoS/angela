import { Skeleton } from "@/components/ui/skeleton"

export default function AuthenticatedLoading() {
  return (
    <div className="bg-[#F8F8F8] w-full min-h-screen flex">
      <aside className="w-64 shrink-0 border-r bg-white p-3 flex flex-col gap-6">
        {/* Logo row */}
        <div className="flex items-center gap-2 p-2">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Group label + nav rows */}
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-16 mb-2 ml-2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="size-5 rounded-sm shrink-0" />
              <Skeleton className="h-4 flex-1 max-w-28" />
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-6 flex flex-col gap-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </main>
    </div>
  )
}