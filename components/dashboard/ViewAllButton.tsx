"use client" // Only this small file becomes a client component

export default function ViewAllButton() {
  return (
    <button className="text-xs font-semibold text-indigo-600 hover:underline" onClick={() => console.log("Routing...")}>
      View All
    </button>
  )
}