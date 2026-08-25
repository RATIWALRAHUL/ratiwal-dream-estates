import React from "react";

export function DealKpiSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.06)] space-y-2">
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="h-6 w-16 bg-slate-300 rounded" />
        </div>
      ))}
    </div>
  );
}

export function DealTableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.06)] p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-8 w-48 bg-slate-200 rounded-xl" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-full bg-slate-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function DealWorkspaceSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 w-full bg-white rounded-2xl border border-[rgba(7,26,40,0.06)]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-white rounded-2xl border border-[rgba(7,26,40,0.06)]" />
          <div className="h-48 bg-white rounded-2xl border border-[rgba(7,26,40,0.06)]" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-white rounded-2xl border border-[rgba(7,26,40,0.06)]" />
          <div className="h-64 bg-white rounded-2xl border border-[rgba(7,26,40,0.06)]" />
        </div>
      </div>
    </div>
  );
}
