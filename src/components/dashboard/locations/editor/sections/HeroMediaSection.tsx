"use client";

import Image from "next/image";
import { Image as ImageIcon, Sparkles, Trash2 } from "lucide-react";
import { ImageKitUpload } from "@/components/shared/ImageKitUpload";

interface HeroMediaSectionProps {
  heroImage?: {
    url?: string;
    storagePublicId?: string;
    altText?: string;
    caption?: string;
    width?: number;
    height?: number;
  };
  onChange: (fields: Record<string, any>) => void;
}

export function HeroMediaSection({
  heroImage = {},
  onChange,
}: HeroMediaSectionProps) {
  const hasImage = Boolean(heroImage.url && heroImage.url.trim().length > 0);

  const handleImageUploaded = (uploaded: { url: string; fileId: string; name: string }) => {
    onChange({
      heroImage: {
        ...heroImage,
        url: uploaded.url,
        storagePublicId: uploaded.fileId,
        altText: heroImage.altText || uploaded.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      },
    });
  };

  const handleRemoveImage = () => {
    onChange({
      heroImage: {
        url: "",
        storagePublicId: "",
        altText: "",
        caption: "",
      },
    });
  };

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)] space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-bold text-[#071a28] font-body flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#087fc3]" />
          <span>4. Hero Media &amp; Masterplan Photography</span>
        </h2>
        <p className="text-xs text-[#647581] mt-0.5 font-body">
          High-resolution landscape imagery served globally via ImageKit CDN with automated WebP/AVIF formatting.
        </p>
      </div>

      {hasImage ? (
        <div className="space-y-4">
          <div className="relative aspect-[16/9] max-h-72 w-full rounded-2xl overflow-hidden bg-[#072435] border border-[rgba(7,26,40,0.1)] group">
            <Image
              src={heroImage.url!}
              alt={heroImage.altText || "Location hero"}
              fill
              sizes="(max-width: 1200px) 100vw, 800px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />

            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-2 rounded-xl bg-rose-600/90 text-white hover:bg-rose-700 backdrop-blur-md transition-colors shadow-sm"
                title="Remove hero image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
                Hero Alt Text (Required for Publishing) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={heroImage.altText ?? ""}
                onChange={(e) =>
                  onChange({
                    heroImage: { ...heroImage, altText: e.target.value },
                  })
                }
                placeholder="e.g. Master-planned residential township along Ajmer Road Expressway, Jaipur"
                className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
                Media Caption / Photographic Credit
              </label>
              <input
                type="text"
                value={heroImage.caption ?? ""}
                onChange={(e) =>
                  onChange({
                    heroImage: { ...heroImage, caption: e.target.value },
                  })
                }
                placeholder="e.g. Drone aerial perspective of the development node"
                className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body shadow-2xs"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <ImageKitUpload
            folder="/ratiwal/locations"
            onSuccess={handleImageUploaded}
          />

          <div>
            <label className="block text-xs font-semibold text-[#071a28] mb-1.5 font-body">
              Or specify image URL directly:
            </label>
            <input
              type="url"
              value={heroImage.url ?? ""}
              onChange={(e) =>
                onChange({
                  heroImage: { ...heroImage, url: e.target.value },
                })
              }
              placeholder="https://ik.imagekit.io/ratiwaldream/locations/ajmer-road.jpg"
              className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-mono shadow-2xs"
            />
          </div>
        </div>
      )}
    </section>
  );
}
