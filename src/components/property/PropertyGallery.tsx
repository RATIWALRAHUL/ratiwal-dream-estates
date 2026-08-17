"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PropertyGalleryProps {
  images: string[];
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 flex items-center justify-center text-text-muted text-xs rounded">
        [NO IMAGES AVAILABLE]
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Main viewport frame */}
      <div className="relative aspect-video w-full bg-gray-100 rounded overflow-hidden shadow-sm">
        {images[activeImageIndex] ? (
          <Image
            src={images[activeImageIndex]}
            alt={`Property view ${activeImageIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-text-muted text-xs">
            [IMAGE PLACEHOLDER]
          </div>
        )}
      </div>

      {/* Thumbnails bar */}
      {images.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2" aria-label="Property thumbnails">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImageIndex(index)}
              className={cn(
                "relative h-16 w-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden border-2 transition-all focus-visible:outline",
                index === activeImageIndex
                  ? "border-primary-blue scale-95"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
              aria-label={`View property image ${index + 1}`}
            >
              <Image
                src={img}
                alt={`Property thumbnail ${index + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
