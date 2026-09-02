import { Zap, Shield, Trees, Road, Layers } from "lucide-react";
import { PropertyAmenity } from "@/types/property";

interface PropertyAmenitiesProps {
  amenities?: PropertyAmenity[];
  propertyName: string;
}

export function PropertyAmenities({ amenities, propertyName }: PropertyAmenitiesProps) {
  if (!amenities || amenities.length === 0) {
    return null;
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Roads & Access":
        return Road;
      case "Utilities & Power":
        return Zap;
      case "Security & Safety":
        return Shield;
      case "Greenery & Leisure":
        return Trees;
      default:
        return Layers;
    }
  };

  return (
    <section aria-labelledby="amenities-heading" className="mb-8 sm:mb-12">
      <div className="p-4 sm:p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)]">
        <div className="max-w-[720px] mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-[10.5px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Infrastructure &amp; Amenities</span>
          </div>
          <h2
            id="amenities-heading"
            className="font-instrument text-xl sm:text-2xl sm:text-3xl text-[#031C2B] font-normal leading-tight tracking-tight mb-1.5 sm:mb-2"
          >
            Township infrastructure and features.
          </h2>
          <p className="text-xs sm:text-sm text-[#4a6171]">
            Verified utilities, access roads, and civil infrastructure at {propertyName}.
          </p>
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {amenities.map((item, idx) => {
            const Icon = getCategoryIcon(item.category);
            return (
              <div
                key={idx}
                className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white text-[#0784C8] flex items-center justify-center shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "Available"
                          ? "bg-[rgba(36,209,127,0.12)] text-[#10854d]"
                          : item.status === "Under Development"
                          ? "bg-[rgba(243,156,18,0.12)] text-[#b85e13]"
                          : "bg-[#edf5f9] text-[#0784C8]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-heading text-sm font-bold text-[#031C2B] mb-1">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-[#536574] leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="text-[10px] text-[#7a93a5] uppercase tracking-wider font-semibold mt-3 pt-2 border-t border-[rgba(7,26,40,0.04)]">
                  {item.category}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
