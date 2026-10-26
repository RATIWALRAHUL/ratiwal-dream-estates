"use client";

import { useState } from "react";
import Image from "next/image";
import { Map, Download, Maximize2, X } from "lucide-react";
import { MasterplanInfo } from "@/types/property";

interface PropertyMasterplanProps {
  masterplan?: MasterplanInfo;
  propertyName: string;
}

export function PropertyMasterplan({ masterplan, propertyName }: PropertyMasterplanProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!masterplan) {
    return null;
  }

  return (
    <section aria-labelledby="masterplan-heading" className="mb-8 sm:mb-12">
      <div className="p-4 sm:p-7 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-5 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-[10.5px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
              <Map className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sanctioned Layout Map</span>
            </div>
            <h2
              id="masterplan-heading"
              className="font-instrument text-xl sm:text-2xl sm:text-3xl text-[#031C2B] font-normal leading-tight tracking-tight"
            >
              Masterplan and property layout.
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs text-[#667d8f] font-mono">
              {masterplan.approvalAuthority} • {masterplan.version}
            </span>
          </div>
        </div>

        {/* Masterplan Preview Image Container */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[rgba(8,127,195,0.2)] shadow-xs transition-all hover:border-[rgba(8,127,195,0.35)]">
          <div
            className="relative aspect-[16/10] sm:aspect-[16/9] w-full cursor-pointer group bg-[#072435]"
            onClick={() => setIsZoomed(true)}
          >
            <Image
              src={masterplan.imageUrl}
              alt={`${propertyName} official masterplan layout`}
              fill
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-cover transition-transform duration-500 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B]/30 via-transparent to-transparent opacity-60" />

            {/* Top-right quick enlarge pill */}
            <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(3,28,43,0.85)] hover:bg-[#0784C8] text-white text-[11px] sm:text-xs font-semibold backdrop-blur-md border border-[rgba(255,255,255,0.2)] shadow-sm transition-colors">
              <Maximize2 className="w-3.5 h-3.5 text-[#52BDE9]" />
              <span>Tap to Enlarge</span>
            </div>
          </div>

          {/* Details & Actions Footer Bar (Underneath the image) */}
          <div className="p-4 sm:p-5 bg-white border-t border-[rgba(7,26,40,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="min-w-0">
              <span className="font-semibold text-xs sm:text-sm md:text-base text-[#071A28] block leading-snug">
                {masterplan.title}
              </span>
              <span className="text-[11px] sm:text-xs text-[#667d8f] font-mono block mt-0.5">
                Digital Sector Map • {masterplan.fileSize}
              </span>
            </div>

            {/* Actions Grid (perfect 50/50 on mobile, flex on desktop) */}
            <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto sm:flex sm:items-center flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsZoomed(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#edf5f9] hover:bg-[#d9ecf6] text-[#0784C8] text-xs font-bold transition-colors min-h-[40px] text-center"
                aria-label="Enlarge masterplan view"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fullscreen</span>
              </button>

              <a
                href={masterplan.fileUrl}
                download
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#0784C8] hover:bg-[#129be0] text-white text-xs font-bold transition-colors shadow-xs whitespace-nowrap min-h-[40px] text-center"
                aria-label={`Download ${masterplan.title}`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>

        {/* Masterplan Modal */}
        {isZoomed && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-[#031C2B]/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
          >
            <div className="flex items-center justify-between text-white z-10">
              <div className="text-sm font-medium">
                <span className="font-bold">{masterplan.title}</span> — {propertyName}
              </div>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] text-white flex items-center justify-center transition-colors"
                aria-label="Close masterplan view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 my-4">
              <Image
                src={masterplan.imageUrl}
                alt={masterplan.title}
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
