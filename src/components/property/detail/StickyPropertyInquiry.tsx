"use client";

import { MessageCircle, Calendar, Send, ShieldCheck, CheckCircle2, PhoneCall, Sparkles } from "lucide-react";
import { Property, PlotOption } from "@/types/property";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

interface StickyPropertyInquiryProps {
  property: Property;
  selectedOption?: PlotOption | null;
  onOpenEnquiryModal: () => void;
  onOpenSiteVisitModal: () => void;
}

export function StickyPropertyInquiry({
  property,
  selectedOption,
  onOpenEnquiryModal,
  onOpenSiteVisitModal,
}: StickyPropertyInquiryProps) {
  const whatsappUrl = generateWhatsAppUrl({
    type: "property",
    propertyName: property.name,
    locationName: `${property.location}, ${property.city}`,
  });

  return (
    <div className="sticky top-28 space-y-4">
      <div className="p-6 rounded-3xl bg-white border border-[rgba(7,26,40,0.1)] shadow-[0_12px_36px_rgba(7,26,40,0.06)]">
        {/* Header Badge */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[rgba(7,26,40,0.06)]">
          <span className="text-[11px] font-bold text-[#0784C8] uppercase tracking-wider">
            Advisory Desk
          </span>
          <span className="text-[11px] text-[#24D17F] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Verified Listing
          </span>
        </div>

        {/* Price & Selected Plot */}
        <div className="mb-5">
          <span className="text-[11px] text-[#667d8f] uppercase tracking-wider block">
            {selectedOption ? `Selected: ${selectedOption.label}` : "Indicative Investment"}
          </span>
          <div className="font-heading text-2xl sm:text-3xl font-bold text-[#031C2B]">
            {selectedOption ? selectedOption.basePriceLabel : property.priceLabel}
          </div>
          {selectedOption && (
            <span className="text-xs text-[#0784C8] font-mono block mt-0.5">
              {selectedOption.areaSqYd} Sq. Yds ({selectedOption.widthFt} × {selectedOption.lengthFt} ft)
            </span>
          )}
        </div>

        {/* Primary Actions */}
        <div className="space-y-3">
          {/* WhatsApp Direct */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-full bg-[#25D366] hover:bg-[#1fb355] text-[#031C2B] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all focus-visible:outline"
            aria-label={`Chat with advisor on WhatsApp about ${property.name}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>

          {/* Schedule Site Visit */}
          <button
            type="button"
            onClick={onOpenSiteVisitModal}
            className="w-full py-3 px-4 rounded-full bg-[#031C2B] hover:bg-[#0784C8] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm focus-visible:outline"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Site Visit</span>
          </button>

          {/* Send Direct Enquiry */}
          <button
            type="button"
            onClick={onOpenEnquiryModal}
            className="w-full py-3 px-4 rounded-full bg-[#F5F1E9] hover:bg-[#e8e2d5] text-[#031C2B] font-semibold text-xs border border-[rgba(7,26,40,0.08)] flex items-center justify-center gap-2 transition-all focus-visible:outline"
          >
            <Send className="w-4 h-4 text-[#0784C8]" />
            <span>Send Enquiry Email</span>
          </button>
        </div>

        {/* Trust Points */}
        <div className="mt-6 pt-4 border-t border-[rgba(7,26,40,0.06)] space-y-2 text-[11px] text-[#536574]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#24D17F] flex-shrink-0" />
            <span>30-Year Revenue Title Verification</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0784C8] flex-shrink-0" />
            <span>Zero Brokerage on Direct Townships</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#52BDE9] flex-shrink-0" />
            <span>On-Site Escort &amp; Boundary Demarcation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
