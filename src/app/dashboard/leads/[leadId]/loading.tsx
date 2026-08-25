export default function LeadDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb */}
      <div>
        <div className="h-3 w-36 bg-slate-200 rounded-full mb-2" />
        <div className="h-3 w-56 bg-slate-200 rounded-full mb-2" />
        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-16 bg-slate-200 rounded-full" />
          <div className="h-5 w-12 bg-slate-200 rounded-full" />
        </div>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Identity card */}
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5 space-y-4">
            <div className="h-2 w-28 bg-slate-200 rounded-full" />
            <div className="grid grid-cols-2 gap-4">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-xl shrink-0" />
                  <div className="space-y-1 flex-1">
                    <div className="h-2 w-12 bg-slate-200 rounded-full" />
                    <div className="h-4 w-32 bg-slate-200 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Inquiry card */}
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5 space-y-4">
            <div className="h-2 w-28 bg-slate-200 rounded-full" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-2 w-16 bg-slate-200 rounded-full" />
                  <div className="h-4 w-24 bg-slate-200 rounded-lg" />
                </div>
              ))}
            </div>
            <div className="h-20 bg-slate-100 rounded-xl" />
          </div>
          {/* Contact log */}
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5 space-y-3">
            <div className="h-2 w-24 bg-slate-200 rounded-full" />
            <div className="h-24 bg-slate-100 rounded-xl" />
          </div>
          {/* Notes */}
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5 space-y-3">
            <div className="h-2 w-24 bg-slate-200 rounded-full" />
            <div className="h-16 bg-slate-100 rounded-xl" />
          </div>
          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5 space-y-4">
            <div className="h-2 w-20 bg-slate-200 rounded-full" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 ml-4">
                <div className="w-5 h-5 bg-slate-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-64 bg-slate-200 rounded-full" />
                  <div className="h-2 w-40 bg-slate-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Side panels */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-5 space-y-3">
              <div className="h-2 w-24 bg-slate-200 rounded-full" />
              <div className="h-12 bg-slate-100 rounded-xl" />
              <div className="h-8 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
