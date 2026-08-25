"use client";

import { Info, Sparkles } from "lucide-react";
import type { PropertyType, ListingStatus, SourceType } from "@/types/database";

interface BasicInfoSectionProps {
  formData: {
    title: string;
    slug: string;
    shortDescription: string;
    fullDescription: string;
    propertyType: PropertyType;
    listingStatus: ListingStatus;
    sourceType: SourceType;
    developerName: string;
    featured: boolean;
    sortOrder: number;
  };
  errors: Record<string, string[]>;
  onChange: (fields: Partial<BasicInfoSectionProps["formData"]>) => void;
  isPublished: boolean;
  userRole: string;
}

export function BasicInfoSection({
  formData,
  errors,
  onChange,
  isPublished,
  userRole,
}: BasicInfoSectionProps) {
  return (
    <div id="section-basic" className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
        <div>
          <h2 className="text-sm font-bold text-[#071a28]">1. Basic Information & Classification</h2>
          <p className="text-xs text-[#647581] mt-0.5">
            Core property identity, classification, developer mandating, and public URL slug.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-[#071a28] mb-1">
            Property Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. Royal Palms Township — Ajmer Road"
            maxLength={200}
            className={`w-full p-3 rounded-xl border text-xs sm:text-sm text-[#071a28] focus:outline-none ${
              errors.title ? "border-rose-400 bg-rose-50/20" : "border-[rgba(7,26,40,0.12)] focus:border-[#087fc3]"
            }`}
          />
          {errors.title && <p className="text-[11px] text-rose-600 mt-1 font-mono">{errors.title[0]}</p>}
        </div>

        {/* Slug */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#071a28]">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            {isPublished && (
              <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Live URL (Super Admin Required to Change)
              </span>
            )}
          </div>
          <div className="flex items-center">
            <span className="px-3 py-3 rounded-l-xl bg-slate-100 border border-r-0 border-[rgba(7,26,40,0.12)] text-xs text-[#647581] font-mono">
              /properties/
            </span>
            <input
              type="text"
              required
              disabled={isPublished && userRole !== "SUPER_ADMIN"}
              value={formData.slug}
              onChange={(e) => onChange({ slug: e.target.value })}
              maxLength={100}
              className={`w-full p-3 rounded-r-xl border text-xs sm:text-sm font-mono text-[#071a28] focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 ${
                errors.slug ? "border-rose-400 bg-rose-50/20" : "border-[rgba(7,26,40,0.12)] focus:border-[#087fc3]"
              }`}
            />
          </div>
          {errors.slug && <p className="text-[11px] text-rose-600 mt-1 font-mono">{errors.slug[0]}</p>}
        </div>

        {/* Grid: Type, ListingStatus, SourceType */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">
              Property Classification <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.propertyType}
              onChange={(e) => onChange({ propertyType: e.target.value as PropertyType })}
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs sm:text-sm text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
            >
              <option value="RESIDENTIAL_PLOT">Residential Plot</option>
              <option value="COMMERCIAL_PLOT">Commercial Plot</option>
              <option value="INDUSTRIAL_PLOT">Industrial Plot</option>
              <option value="FARM_LAND">Farm Land</option>
              <option value="VILLA">Villa</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">
              Inventory Availability <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.listingStatus}
              onChange={(e) => onChange({ listingStatus: e.target.value as ListingStatus })}
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs sm:text-sm text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
            >
              <option value="AVAILABLE">Available</option>
              <option value="LIMITED">Limited Units</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold Out</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">Mandate Source</label>
            <select
              value={formData.sourceType}
              onChange={(e) => onChange({ sourceType: e.target.value as SourceType })}
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs sm:text-sm text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
            >
              <option value="INTERNAL">Internal Direct Mandate</option>
              <option value="DEVELOPER">Developer Partnership</option>
              <option value="DIRECT_LANDOWNER">Direct Landowner</option>
              <option value="AUTHORIZED_CHANNEL_PARTNER">Authorized Channel Partner</option>
              <option value="OTHER">Other Source</option>
            </select>
          </div>
        </div>

        {/* Developer Name & Sort Order & Featured */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">Developer / Landowner</label>
            <input
              type="text"
              value={formData.developerName}
              onChange={(e) => onChange({ developerName: e.target.value })}
              placeholder="e.g. Ratiwal Infrastructure LLP"
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs sm:text-sm text-[#071a28] focus:outline-none focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">Sort Priority Order</label>
            <input
              type="number"
              min={0}
              value={formData.sortOrder}
              onChange={(e) => onChange({ sortOrder: Number(e.target.value) || 0 })}
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs sm:text-sm text-[#071a28] focus:outline-none focus:border-[#087fc3]"
            />
          </div>

          <div className="sm:pt-5">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => onChange({ featured: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-[#087fc3] focus:ring-[#087fc3]"
              />
              <span className="text-xs font-bold text-[#071a28]">Feature on Homepage Showcase</span>
            </label>
          </div>
        </div>

        {/* Short & Full Descriptions */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#071a28]">
              Short Description / Overview <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] font-mono text-[#647581]">
              {formData.shortDescription.length}/500 chars
            </span>
          </div>
          <textarea
            required
            rows={3}
            value={formData.shortDescription}
            onChange={(e) => onChange({ shortDescription: e.target.value })}
            maxLength={500}
            className={`w-full p-3 rounded-xl border text-xs sm:text-sm text-[#071a28] focus:outline-none ${
              errors.shortDescription ? "border-rose-400 bg-rose-50/20" : "border-[rgba(7,26,40,0.12)] focus:border-[#087fc3]"
            }`}
          />
          {errors.shortDescription && (
            <p className="text-[11px] text-rose-600 mt-1 font-mono">{errors.shortDescription[0]}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#071a28]">Full Editorial Description</label>
            <span className="text-[10px] font-mono text-[#647581]">
              {formData.fullDescription.length}/5000 chars
            </span>
          </div>
          <textarea
            rows={5}
            value={formData.fullDescription}
            onChange={(e) => onChange({ fullDescription: e.target.value })}
            maxLength={5000}
            placeholder="Detailed narrative regarding layout design, zoning clearances, water table, electricity lines, and investment rationale..."
            className="w-full p-3 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs sm:text-sm text-[#071a28] focus:outline-none focus:border-[#087fc3]"
          />
        </div>
      </div>
    </div>
  );
}
