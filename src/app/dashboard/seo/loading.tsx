/** Skeleton shown while any /dashboard/seo/* server page streams. */
export default function SeoLoading() {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Loading SEO data">
      <div className="space-y-2">
        <div className="h-3 w-28 bg-slate-200 rounded" />
        <div className="h-7 w-64 bg-slate-200 rounded" />
        <div className="h-3 w-96 max-w-full bg-slate-100 rounded" />
      </div>
      <div className="h-9 w-full max-w-md bg-slate-100 rounded-xl" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-white border border-slate-200/60 p-5 space-y-3">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-20 bg-slate-200 rounded" />
            <div className="h-3 w-full bg-slate-100 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-60 rounded-2xl bg-white border border-slate-200/60" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
