"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PropertyLightboxModalProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  propertyName: string;
}

export function PropertyLightboxModal({
  isOpen,
  images,
  currentIndex,
  onClose,
  onSelectIndex,
  propertyName,
}: PropertyLightboxModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onSelectIndex((currentIndex + 1) % images.length);
      if (e.key === "ArrowLeft") onSelectIndex((currentIndex - 1 + images.length) % images.length);
    },
    [isOpen, currentIndex, images.length, onClose, onSelectIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo Gallery for ${propertyName}`}
      className="fixed inset-0 z-50 bg-[#031C2B]/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between text-white z-10">
        <div className="text-xs sm:text-sm font-medium text-[#c5d8e4]">
          <span className="font-bold text-white">{propertyName}</span> — Photo {currentIndex + 1} of {images.length}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] text-white flex items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          aria-label="Close photo gallery"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center my-4">
        {/* Prev Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onSelectIndex((currentIndex - 1 + images.length) % images.length)}
            className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-[rgba(3,28,43,0.75)] hover:bg-[#0784C8] text-white flex items-center justify-center transition-colors border border-[rgba(255,255,255,0.2)] focus-visible:outline"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Current Image */}
        <div className="relative w-full max-w-5xl h-full max-h-[75vh]">
          <Image
            src={images[currentIndex]}
            alt={`${propertyName} — Photo ${currentIndex + 1}`}
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-contain"
            priority
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onSelectIndex((currentIndex + 1) % images.length)}
            className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-[rgba(3,28,43,0.75)] hover:bg-[#0784C8] text-white flex items-center justify-center transition-colors border border-[rgba(255,255,255,0.2)] focus-visible:outline"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                idx === currentIndex
                  ? "ring-2 ring-[#52BDE9] scale-105"
                  : "opacity-60 hover:opacity-100"
              }`}
              aria-label={`Go to photo ${idx + 1}`}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
