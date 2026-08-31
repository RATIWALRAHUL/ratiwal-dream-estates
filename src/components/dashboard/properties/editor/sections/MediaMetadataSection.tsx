"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, ArrowUp, ArrowDown, Star, Image as ImageIcon } from "lucide-react";
import { ImageKitUpload } from "@/components/shared/ImageKitUpload";

interface MediaItem {
  url: string;
  altText?: string;
  caption?: string;
  isPrimary: boolean;
  publicationStatus: "PUBLISHED" | "DRAFT";
  sortOrder: number;
}

interface MediaMetadataSectionProps {
  media: MediaItem[];
  errors: Record<string, string[]>;
  onChange: (media: MediaItem[]) => void;
}

export function MediaMetadataSection({
  media,
  errors,
  onChange,
}: MediaMetadataSectionProps) {
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [showDirectUpload, setShowDirectUpload] = useState(true);

  const handleImageKitSuccess = (result: {
    url: string;
    fileId: string;
    name: string;
    width?: number;
    height?: number;
  }) => {
    const updatedList = [...media];
    const isFirst = updatedList.length === 0;

    const item: MediaItem = {
      url: result.url,
      altText: `Property media asset ${result.name}`,
      caption: undefined,
      isPrimary: isFirst,
      publicationStatus: "PUBLISHED",
      sortOrder: updatedList.length,
    };

    onChange([...updatedList, item]);
  };

  const addMedia = () => {
    if (!newUrl.trim()) return;

    let updatedList = [...media];
    // If setting as primary, unset other primaries
    if (isPrimary || updatedList.length === 0) {
      updatedList = updatedList.map((m) => ({ ...m, isPrimary: false }));
    }

    const item: MediaItem = {
      url: newUrl.trim(),
      altText: newAlt.trim() || undefined,
      caption: newCaption.trim() || undefined,
      isPrimary: isPrimary || updatedList.length === 0,
      publicationStatus: "PUBLISHED",
      sortOrder: updatedList.length,
    };

    onChange([...updatedList, item]);
    setNewUrl("");
    setNewAlt("");
    setNewCaption("");
    setIsPrimary(false);
  };

  const removeMedia = (idx: number) => {
    const removingPrimary = media[idx]?.isPrimary;
    const filtered = media.filter((_, i) => i !== idx);
    // If removed primary and others remain, set first as primary
    if (removingPrimary && filtered.length > 0) {
      filtered[0].isPrimary = true;
    }
    onChange(filtered);
  };

  const setPrimary = (idx: number) => {
    const updated = media.map((m, i) => ({
      ...m,
      isPrimary: i === idx,
    }));
    onChange(updated);
  };

  const moveMedia = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= media.length) return;
    const copy = [...media];
    const item = copy.splice(idx, 1)[0];
    copy.splice(targetIdx, 0, item);
    onChange(copy);
  };

  return (
    <div id="section-media" className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
        <div>
          <h2 className="text-sm font-bold text-[#071a28]">6. Media Metadata & Hero Showcase</h2>
          <p className="text-xs text-[#647581] mt-0.5">
            Manage high-resolution imagery, masterplan maps, and designate exactly one primary hero image.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-[#087fc3]">
          {media.length} Asset(s) Attached
        </span>
      </div>

      {errors.media && (
        <p className="text-xs text-rose-600 font-mono font-bold">{errors.media[0]}</p>
      )}

      {/* Direct ImageKit Upload Box */}
      <div className="space-y-3">
        <ImageKitUpload
          onSuccess={handleImageKitSuccess}
          folder="/ratiwal/properties"
          accept="image/jpeg,image/png,image/webp,image/avif"
          label="Upload Property Photo to ImageKit CDN"
          helperText="Drag & drop or browse photos (JPEG, PNG, WebP up to 15MB). Automatically optimizes and adds to gallery."
        />
      </div>

      {/* Manual URL Input Box (Accordion/Fallback) */}
      <div className="p-4 rounded-xl bg-[#f7f5ef]/40 border border-[rgba(7,26,40,0.06)] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#071a28]">Or Add via Web URL / Asset Path</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">
              Image URL / Web Path <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="e.g. /images/properties/royal-palms-hero.jpg or https://ik.imagekit.io/..."
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] bg-white focus:outline-none focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Alt Text (Accessibility / SEO)</label>
            <input
              type="text"
              value={newAlt}
              onChange={(e) => setNewAlt(e.target.value)}
              placeholder="e.g. Aerial view of 60ft wide entrance road and palm tree avenue"
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] bg-white focus:outline-none focus:border-[#087fc3]"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <input
            type="text"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            placeholder="Caption / Description (optional)"
            className="flex-1 p-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] bg-white focus:outline-none"
          />

          <div className="flex items-center gap-3 shrink-0">
            <label className="inline-flex items-center gap-1.5 text-xs text-[#071a28] font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#087fc3]"
              />
              <span>Set as Primary Hero</span>
            </label>

            <button
              type="button"
              onClick={addMedia}
              className="px-4 py-2 rounded-xl bg-[#071a28] text-white text-xs font-semibold hover:bg-[#0a6ba3] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" />
              Add URL
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid / List */}
      {media.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-[rgba(7,26,40,0.1)] rounded-2xl">
          <ImageIcon className="w-8 h-8 text-[#647581]/40 mx-auto mb-2" />
          <p className="text-xs text-[#647581]">No media assets attached. Add at least one primary hero image.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {media.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all ${
                item.isPrimary
                  ? "bg-[#eaf5fa]/50 border-[#087fc3] shadow-xs"
                  : "bg-white border-[rgba(7,26,40,0.08)]"
              }`}
            >
              <div className="flex gap-3">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={item.url}
                    alt={item.altText || "Property image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback placeholder
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  {item.isPrimary && (
                    <span className="absolute top-1 left-1 bg-[#087fc3] text-white text-[8px] font-mono font-bold px-1 py-0.2 rounded">
                      PRIMARY
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1 text-xs">
                  <p className="font-mono text-[10px] text-[#647581] truncate">{item.url}</p>
                  <p className="font-semibold text-[#071a28] line-clamp-1">
                    {item.altText || <span className="text-slate-400 italic">No alt text</span>}
                  </p>
                  {item.caption && <p className="text-[11px] text-[#647581] line-clamp-1">{item.caption}</p>}

                  <div className="flex items-center justify-between pt-2">
                    {!item.isPrimary ? (
                      <button
                        type="button"
                        onClick={() => setPrimary(idx)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#087fc3] hover:underline cursor-pointer"
                      >
                        <Star className="w-3 h-3" />
                        <span>Make Primary</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-[#087fc3] flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Primary Image
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveMedia(idx, -1)}
                        disabled={idx === 0}
                        aria-label="Move media left/up"
                        className="p-1 text-[#647581] hover:text-[#071a28] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveMedia(idx, 1)}
                        disabled={idx === media.length - 1}
                        aria-label="Move media right/down"
                        className="p-1 text-[#647581] hover:text-[#071a28] disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMedia(idx)}
                        aria-label="Remove media asset"
                        className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
