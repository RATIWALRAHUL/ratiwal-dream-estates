import React from "react";

export function CmsOverviewSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-56 bg-stone-200 rounded-xl mb-2" />
          <div className="h-4 w-80 bg-stone-100 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-stone-200 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl border border-[rgba(7,26,40,0.08)] bg-white">
            <div className="h-3 w-20 bg-stone-100 rounded mb-2" />
            <div className="h-8 w-14 bg-stone-200 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100" />
            <div className="h-5 w-32 bg-stone-200 rounded-md" />
            <div className="h-4 w-full bg-stone-100 rounded-md" />
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-stone-50 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function CmsEditorSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-32 bg-stone-200 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-36 bg-white border border-[rgba(7,26,40,0.08)] rounded-3xl p-6" />
          <div className="h-64 bg-white border border-[rgba(7,26,40,0.08)] rounded-3xl p-6" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-white border border-[rgba(7,26,40,0.08)] rounded-3xl p-6" />
        </div>
      </div>
    </div>
  );
}
