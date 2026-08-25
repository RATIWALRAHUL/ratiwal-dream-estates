export default function PropertyDocumentsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="mb-8">
        <div className="h-3 w-28 bg-stone-200 rounded-full mb-3" />
        <div className="h-7 w-64 bg-stone-200 rounded-full mb-2" />
        <div className="h-3 w-40 bg-stone-200 rounded-full" />
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8">
        <div className="h-4 w-40 bg-stone-200 rounded-full mb-4" />
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-stone-100 rounded-xl" />
          <div className="w-28 h-10 bg-stone-900/20 rounded-xl" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200">
            <div className="flex items-center gap-4 p-5 border-b border-stone-100">
              <div className="w-10 h-10 bg-stone-100 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-stone-200 rounded-full" />
                <div className="h-3 w-32 bg-stone-100 rounded-full" />
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-stone-100 rounded-full" />
                  <div className="h-5 w-16 bg-stone-100 rounded-full" />
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex gap-3 mb-3">
                <div className="flex-1 h-9 bg-stone-100 rounded-lg" />
                <div className="w-28 h-9 bg-stone-100 rounded-lg" />
              </div>
              <div className="flex gap-2">
                <div className="h-7 w-14 bg-stone-200 rounded-lg" />
                <div className="h-7 w-20 bg-stone-100 rounded-lg" />
                <div className="h-7 w-20 bg-stone-100 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
