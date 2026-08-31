
interface DemandDistributionProps {
  items: {
    label: string;
    count: number;
    percentage: number;
    sublabel?: string;
  }[];
}

export function DemandDistributionChart({ items }: DemandDistributionProps) {
  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-[#647581] bg-[#f8f7f4] rounded-2xl">
        No demand distribution data available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#071a28] truncate max-w-[200px]">
              {item.label}
            </span>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="font-bold text-[#071a28]">{item.count}</span>
              <span className="text-[#647581]">({item.percentage}%)</span>
            </div>
          </div>

          <div className="h-2.5 rounded-full bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#087fc3] transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(3, item.percentage))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
