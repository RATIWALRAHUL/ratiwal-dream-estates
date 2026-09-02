"use client";

import { MessageCircle, Calendar } from "lucide-react";
import { Property, PlotOption } from "@/types/property";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

interface MobilePropertyActionBarProps {
  property: Property;
  selectedOption?: PlotOption | null;
  onOpenSiteVisitModal: () => void;
}

export function MobilePropertyActionBar({
  property,
  selectedOption,
  onOpenSiteVisitModal,
}: MobilePropertyActionBarProps) {
  const whatsappUrl = generateWhatsAppUrl({
    type: "property",
    propertyName: property.name,
    locationName: `${property.location}, ${property.city}`,
  });

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[rgba(7,26,40,0.1)] p-2.5 px-4 shadow-[0_-4px_20px_rgba(7,26,40,0.08)] pb-[calc(10px+env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        {/* Left Price Display */}
        <div className="flex-1 min-w-0">
          <span className="text-[10px] text-[#667d8f] uppercase tracking-wider block truncate">
            {selectedOption ? selectedOption.label : "Starting Price"}
          </span>
          <div className="font-heading text-base xs:text-lg font-bold text-[#031C2B] truncate leading-tight">
            {selectedOption ? selectedOption.basePriceLabel : property.priceLabel}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs transition-transform active:scale-95"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </a>

          <button
            type="button"
            onClick={onOpenSiteVisitModal}
            className="px-4 py-2.5 rounded-full bg-[#031C2B] hover:bg-[#0784C8] active:scale-95 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap min-h-[40px]"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Site Visit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
