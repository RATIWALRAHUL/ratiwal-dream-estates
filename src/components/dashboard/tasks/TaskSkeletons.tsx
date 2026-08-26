import React from "react";

export function MyWorkSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-stone-200 rounded-xl mb-2" />
          <div className="h-4 w-72 bg-stone-100 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-[#0088cc]/20 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl border border-[rgba(7,26,40,0.08)] bg-white">
            <div className="h-3 w-20 bg-stone-200 rounded mb-2" />
            <div className="h-7 w-12 bg-stone-300 rounded" />
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white p-6 space-y-4 shadow-2xs">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-[#f8f7f4] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function TaskDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-32 bg-stone-200 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white space-y-4">
            <div className="h-8 w-3/4 bg-stone-200 rounded-lg" />
            <div className="h-20 bg-[#f8f7f4] rounded-2xl" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white space-y-4">
            <div className="h-5 w-28 bg-stone-200 rounded-lg" />
            <div className="h-32 bg-[#f8f7f4] rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
