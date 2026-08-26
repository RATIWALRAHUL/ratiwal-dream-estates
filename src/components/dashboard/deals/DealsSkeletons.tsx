import React from "react";

export function DealKpiSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] space-y-2 shadow-2xs">
          <div className="h-3 w-16 bg-stone-200 rounded-md" />
          <div className="h-6 w-20 bg-stone-300 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function DealTableSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 space-y-4 shadow-2xs animate-pulse">
      <div className="flex justify-between items-center pb-4 border-b border-[rgba(7,26,40,0.06)]">
        <div className="h-4 w-32 bg-stone-200 rounded-md" />
        <div className="h-8 w-48 bg-stone-200 rounded-xl" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-full bg-[#f8f7f4] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function DealWorkspaceSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 w-full bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-2xs" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-2xs" />
          <div className="h-48 bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-2xs" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-2xs" />
          <div className="h-64 bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-2xs" />
        </div>
      </div>
    </div>
  );
}
