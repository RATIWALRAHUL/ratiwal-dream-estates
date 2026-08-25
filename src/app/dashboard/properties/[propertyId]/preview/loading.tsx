export default function PreviewPropertyLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-16 bg-amber-100 rounded-2xl" />
      <div className="h-96 bg-slate-100 rounded-3xl" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-48 bg-slate-100 rounded-2xl" />
        <div className="h-48 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}
