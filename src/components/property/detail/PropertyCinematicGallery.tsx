"use client";

import { useState } from "react";
import Image from "next/image";
import { Images, Maximize2 } from "lucide-react";
import { PropertyLightboxModal } from "./PropertyLightboxModal";

interface PropertyCinematicGalleryProps {
  images: string[];
  propertyName: string;
}

export function PropertyCinematicGallery({ images, propertyName }: PropertyCinematicGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const validImages = images && images.length > 0
    ? images
    : ["/images/about/township-development.jpg"];

  const openLightbox = (index: number) => {
    setActivePhotoIndex(index);
    setIsLightboxOpen(true);
  };

  const leadImage = validImages[0];
  const sideImages = validImages.slice(1, 3);

  return (
    <section aria-label={`Photo Gallery for ${propertyName}`} className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 rounded-3xl overflow-hidden shadow-[0_12px_36px_rgba(7,26,40,0.08)] bg-[#031C2B]">
        {/* Large Lead Image */}
        <div
          className={`relative overflow-hidden cursor-pointer group ${
            sideImages.length > 0 ? "md:col-span-8 aspect-[16/10] md:aspect-[16/11]" : "md:col-span-12 aspect-[16/9]"
          }`}
          onClick={() => openLightbox(0)}
        >
          <Image
            src={leadImage}
            alt={`${propertyName} primary photograph`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 65vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

          <button
            type="button"
            className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(3,28,43,0.85)] hover:bg-[#0784C8] text-white text-xs font-semibold backdrop-blur-md border border-[rgba(255,255,255,0.2)] transition-colors shadow-sm focus-visible:outline"
            aria-label="Enlarge lead photo"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Enlarge</span>
          </button>
        </div>

        {/* Supporting Secondary Images */}
        {sideImages.length > 0 && (
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-3.5">
            {sideImages.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-[16/10] md:aspect-[16/11] overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(idx + 1)}
              >
                <Image
                  src={img}
                  alt={`${propertyName} gallery photograph ${idx + 2}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 35vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

                {idx === sideImages.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(0);
                    }}
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(3,28,43,0.9)] hover:bg-[#0784C8] text-white text-[11px] font-bold backdrop-blur-md border border-[rgba(255,255,255,0.2)] transition-colors shadow-sm"
                    aria-label={`View all ${validImages.length} photos`}
                  >
                    <Images className="w-3.5 h-3.5 text-[#52BDE9]" />
                    <span>View All {validImages.length} Photos</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <PropertyLightboxModal
        isOpen={isLightboxOpen}
        images={validImages}
        currentIndex={activePhotoIndex}
        onClose={() => setIsLightboxOpen(false)}
        onSelectIndex={(idx) => setActivePhotoIndex(idx)}
        propertyName={propertyName}
      />
    </section>
  );
}
