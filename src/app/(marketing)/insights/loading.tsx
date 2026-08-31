export default function PublicInsightsLoading() {
  return (
    <div className="flex flex-col w-full animate-pulse" aria-label="Loading insights & guides...">
      {/* Hero Skeleton */}
      <div className="bg-[#071a28] py-16 sm:py-24 text-white">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="h-4 w-36 bg-white/20 rounded-md" />
          <div className="h-10 w-96 max-w-full bg-white/30 rounded-xl" />
          <div className="h-4 w-72 max-w-full bg-white/20 rounded-md" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] overflow-hidden shadow-xs space-y-4">
              <div className="h-52 w-full bg-slate-200" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-52 bg-slate-200 rounded-lg" />
                <div className="h-3.5 w-64 bg-slate-100 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
