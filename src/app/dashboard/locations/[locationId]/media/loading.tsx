export default function LocationMediaLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="mb-8">
        <div className="h-3 w-28 bg-stone-200 rounded-full mb-3" />
        <div className="h-7 w-56 bg-stone-200 rounded-full mb-2" />
        <div className="h-3 w-40 bg-stone-200 rounded-full" />
      </div>
      <div className="h-40 bg-stone-100 rounded-2xl border-2 border-dashed border-stone-200 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="aspect-video bg-stone-100" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-28 bg-stone-200 rounded-full" />
              <div className="h-8 bg-stone-100 rounded-lg" />
              <div className="flex justify-between">
                <div className="flex gap-1">
                  <div className="w-7 h-7 bg-stone-100 rounded-lg" />
                  <div className="w-7 h-7 bg-stone-100 rounded-lg" />
                </div>
                <div className="flex gap-1">
                  <div className="w-7 h-7 bg-stone-100 rounded-lg" />
                  <div className="w-7 h-7 bg-stone-100 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
