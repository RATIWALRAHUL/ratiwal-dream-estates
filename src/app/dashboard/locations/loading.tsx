export function MarketAtlasSkeleton() {
  return (
    <div className="relative rounded-2xl sm:rounded-3xl bg-[#071a28] border border-[#0d2c42] shadow-[0_18px_44px_rgba(7,26,40,0.18)] p-6 sm:p-8 lg:p-10 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="space-y-3 max-w-xl">
          <div className="h-5 w-48 rounded-full bg-white/10 animate-pulse" />
          <div className="h-9 w-3/4 rounded-xl bg-white/15 animate-pulse" />
          <div className="h-4 w-full rounded-lg bg-white/10 animate-pulse" />
        </div>
        <div className="h-10 w-44 rounded-xl bg-white/10 animate-pulse shrink-0" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-white/10">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
              <div className="w-6 h-6 rounded-lg bg-white/10 animate-pulse" />
            </div>
            <div className="h-7 w-16 rounded bg-white/20 animate-pulse" />
            <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LocationFiltersSkeleton() {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_20px_rgba(7,26,40,0.04)] space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-[rgba(7,26,40,0.06)]">
        <div className="h-4 w-40 rounded bg-[#f7f5ef] animate-pulse" />
        <div className="h-7 w-24 rounded-xl bg-[#f7f5ef] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-6 h-10 rounded-xl bg-[#f7f5ef] animate-pulse" />
        <div className="lg:col-span-3 h-10 rounded-xl bg-[#f7f5ef] animate-pulse" />
        <div className="lg:col-span-3 h-10 rounded-xl bg-[#f7f5ef] animate-pulse" />
      </div>
    </div>
  );
}

export function LocationCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-[rgba(7,26,40,0.1)] overflow-hidden shadow-[0_4px_20px_rgba(7,26,40,0.04)]">
      {/* 16:10 Image area */}
      <div className="aspect-[16/10] w-full bg-[#f2ede4] animate-pulse relative">
        <div className="absolute top-3.5 left-3.5 h-6 w-20 rounded-full bg-black/10" />
        <div className="absolute top-3.5 right-3.5 h-5 w-24 rounded-full bg-black/10" />
        <div className="absolute bottom-3 left-3.5 right-3.5 flex justify-between">
          <div className="h-4 w-28 rounded bg-black/10" />
          <div className="h-4 w-24 rounded bg-black/10" />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <div className="h-6 w-1/2 rounded bg-[#f7f5ef] animate-pulse" />
            <div className="w-4 h-4 rounded bg-[#f7f5ef]" />
          </div>
          <div className="h-3 w-1/3 rounded bg-[#f7f5ef] animate-pulse" />
          <div className="h-3 w-full rounded bg-[#f7f5ef] animate-pulse" />
          <div className="h-3 w-4/5 rounded bg-[#f7f5ef] animate-pulse" />
          <div className="pt-2 flex gap-1.5">
            <div className="h-5 w-20 rounded bg-[#f7f5ef] animate-pulse" />
            <div className="h-5 w-20 rounded bg-[#f7f5ef] animate-pulse" />
            <div className="h-5 w-16 rounded bg-[#f7f5ef] animate-pulse" />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[rgba(7,26,40,0.06)] flex justify-between items-center">
          <div className="h-4 w-24 rounded bg-[#f7f5ef] animate-pulse" />
          <div className="h-7 w-24 rounded-lg bg-[#f7f5ef] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function LocationsPageSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8" aria-busy="true" aria-label="Loading Growth Corridors">
      {/* 1. Market Atlas Skeleton */}
      <MarketAtlasSkeleton />

      {/* 2. Filter Bar Skeleton */}
      <LocationFiltersSkeleton />

      {/* 3. Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <LocationCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
