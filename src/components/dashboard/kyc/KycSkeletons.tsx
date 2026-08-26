"use client";

import React from "react";

export function KycOverviewSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-slate-200 rounded-md" />
          <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        </div>
        <div className="h-10 w-44 bg-slate-200 rounded-xl" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-3xl bg-white border border-slate-100 space-y-3">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-7 w-16 bg-slate-200 rounded-md" />
            <div className="h-2.5 w-28 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-100 space-y-4">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-slate-50 rounded-2xl border border-slate-100" />
            ))}
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-100 space-y-4">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-50 rounded-2xl border border-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function KycCaseListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-7 w-48 bg-slate-200 rounded" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
      </div>
      <div className="h-12 bg-white rounded-2xl border border-slate-100" />
      <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 bg-slate-50 rounded-2xl border border-slate-100" />
        ))}
      </div>
    </div>
  );
}

export function KycCaseWorkspaceSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="h-6 w-32 bg-slate-200 rounded" />
      <div className="p-6 rounded-3xl bg-white border border-slate-100 space-y-4">
        <div className="h-8 w-64 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 space-y-4">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-slate-50 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 space-y-4">
            <div className="h-6 w-36 bg-slate-200 rounded" />
            <div className="h-32 bg-slate-50 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
