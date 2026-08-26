import React from "react";

export function PortalHomeSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      {/* Welcome Banner Skeleton */}
      <div className="h-40 rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6 flex flex-col justify-between" />

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-800/40 border border-slate-700/50 p-4" />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 rounded-2xl bg-slate-800/40 border border-slate-700/50" />
        <div className="h-96 rounded-2xl bg-slate-800/40 border border-slate-700/50" />
      </div>
    </div>
  );
}

export function PortalCardSkeleton() {
  return (
    <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6 space-y-4 animate-pulse" aria-busy="true">
      <div className="h-6 w-1/3 bg-slate-700/60 rounded-md" />
      <div className="h-4 w-2/3 bg-slate-700/40 rounded-md" />
      <div className="h-32 bg-slate-700/30 rounded-xl" />
    </div>
  );
}
