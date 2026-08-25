/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle2,
  Archive,
  RotateCcw,
  Eye,
  Layers,
  AlertTriangle,
  Check,
  Building,
  MapPin,
  FileText,
  DollarSign,
  Image as ImageIcon,
  Compass,
  Globe,
  ShieldCheck,
  X,
} from "lucide-react";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { LocationClassificationSection } from "./sections/LocationClassificationSection";
import { DescriptionsSection } from "./sections/DescriptionsSection";
import { PricingAreaSection } from "./sections/PricingAreaSection";
import { MilestonesSection } from "./sections/MilestonesSection";
import { MediaMetadataSection } from "./sections/MediaMetadataSection";
import { DocumentsSection } from "./sections/DocumentsSection";
import { ReraVerificationSection } from "./sections/ReraVerificationSection";
import { SeoSection } from "./sections/SeoSection";
import { PublishingChecklistModal } from "./sections/PublishingChecklistModal";
import { ReturnToDraftModal, ConcurrencyConflictModal } from "./sections/LifecycleModals";
import {
  updatePropertyAction,
  submitPropertyForReviewAction,
  returnPropertyToDraftAction,
  publishPropertyAction,
  archivePropertyAction,
  restorePropertyToDraftAction,
  validatePublishingChecklistAction,
} from "@/lib/actions/property.actions";
import type { PublishingChecklistResult } from "@/lib/services/property-editor.service";
import type { AdminRole } from "@/lib/auth/session";

interface PropertyEditorProps {
  initialProperty: any;
  locations: { id: string; name: string; city: string; state: string; publicationStatus?: string }[];
  userRole: AdminRole;
}

export function PropertyEditor({
  initialProperty,
  locations,
  userRole,
}: PropertyEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [formData, setFormData] = useState({
    title: initialProperty.title || "",
    slug: initialProperty.slug || "",
    shortDescription: initialProperty.shortDescription || "",
    fullDescription: initialProperty.fullDescription || "",
    propertyType: initialProperty.propertyType || "RESIDENTIAL_PLOT",
    listingStatus: initialProperty.listingStatus || "AVAILABLE",
    sourceType: initialProperty.sourceType || "DIRECT_MANDATE",
    developerName: initialProperty.developerName || "",
    featured: Boolean(initialProperty.featured),
    sortOrder: initialProperty.sortOrder || 0,
    locationId: initialProperty.locationId?._id || initialProperty.locationId || locations[0]?.id || "",
    highlights: (initialProperty.highlights || []).map((h: any) =>
      typeof h === "string" ? h : h?.name || h?.title || String(h || "")
    ),
    amenities: (initialProperty.amenities || []).map((a: any) =>
      typeof a === "string" ? a : a?.name || a?.title || String(a || "")
    ),
    pricingType: initialProperty.pricing?.pricingType || "STARTING_FROM",
    startingPricePaise: initialProperty.pricing?.startingPricePaise,
    maximumPricePaise: initialProperty.pricing?.maximumPricePaise,
    ratePerSqYdPaise: initialProperty.pricing?.ratePerSqYdPaise,
    priceVisibility: initialProperty.pricing?.priceVisibility || "PUBLIC",
    pricingNote: initialProperty.pricing?.pricingNote || "",
    minimumAreaSqFt: initialProperty.area?.minimumAreaSqFt || initialProperty.area?.minimumSqFt || 900,
    maximumAreaSqFt: initialProperty.area?.maximumAreaSqFt || initialProperty.area?.maximumSqFt || 2700,
    displayPreference: initialProperty.area?.displayPreference || "BOTH",
    infrastructureMilestones: initialProperty.infrastructureMilestones || [],
    connectivityMilestones: initialProperty.connectivityMilestones || [],
    media: initialProperty.media || [],
    documents: initialProperty.documents || [],
    rera: {
      isApplicable: initialProperty.rera?.isApplicable !== false,
      registrationNumber: initialProperty.rera?.registrationNumber || "",
      authorityName: initialProperty.rera?.authorityName || "",
      authorityUrl: initialProperty.rera?.authorityUrl || "",
      reraStatus: initialProperty.rera?.reraStatus || "REGISTERED",
      internalNotes: initialProperty.rera?.internalNotes || "",
    },
    verificationStatus: initialProperty.verificationStatus || "UNVERIFIED",
    seo: {
      metaTitle: initialProperty.seo?.metaTitle || "",
      metaDescription: initialProperty.seo?.metaDescription || "",
      canonicalUrl: initialProperty.seo?.canonicalUrl || "",
      ogImage: initialProperty.seo?.ogImage || "",
      noIndex: Boolean(initialProperty.seo?.noIndex),
      noFollow: Boolean(initialProperty.seo?.noFollow),
    },
  });

  const [version, setVersion] = useState<number>(initialProperty.__v || 0);
  const [publicationStatus, setPublicationStatus] = useState<string>(initialProperty.publicationStatus || "DRAFT");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistData, setChecklistData] = useState<PublishingChecklistResult | null>(null);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiveReason, setArchiveReason] = useState("");

  const updateFields = (fields: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setHasUnsavedChanges(true);
  };

  // Warn before leaving when unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Master Save Draft handler
  const handleSave = async () => {
    setErrors({});
    setToastMessage(null);

    startTransition(async () => {
      const res = await updatePropertyAction(initialProperty._id, {
        expectedVersion: version,
        ...formData,
      });

      if (res.success && res.data) {
        setVersion(res.data.version);
        setHasUnsavedChanges(false);
        setToastMessage({ type: "success", text: res.message });
      } else if (!res.success) {
        if (res.code === "CONFLICT") {
          setConflictModalOpen(true);
        } else if (res.fieldErrors) {
          setErrors(res.fieldErrors);
        }
        setToastMessage({ type: "error", text: res.message });
      }
    });
  };

  // Open Publishing Checklist
  const handleOpenChecklist = async () => {
    setChecklistOpen(true);
    setChecklistLoading(true);
    try {
      const res = await validatePublishingChecklistAction(initialProperty._id);
      if (res.success && res.data) {
        setChecklistData(res.data);
      } else {
        setToastMessage({ type: "error", text: res.message || "Failed to evaluate publishing checklist." });
      }
    } catch {
      setToastMessage({ type: "error", text: "Failed to evaluate publishing checklist." });
    } finally {
      setChecklistLoading(false);
    }
  };

  const handleConfirmPublish = async () => {
    startTransition(async () => {
      const res = await publishPropertyAction(initialProperty._id, version);
      if (res.success) {
        setPublicationStatus("PUBLISHED");
        setChecklistOpen(false);
        setToastMessage({ type: "success", text: res.message });
        router.refresh();
      } else {
        if (res.code === "CONFLICT") setConflictModalOpen(true);
        setToastMessage({ type: "error", text: res.message });
      }
    });
  };

  const handleSubmitForReview = async () => {
    startTransition(async () => {
      const res = await submitPropertyForReviewAction(initialProperty._id, version);
      if (res.success) {
        setPublicationStatus("REVIEW");
        setToastMessage({ type: "success", text: res.message });
        router.refresh();
      } else {
        if (res.code === "CONFLICT") setConflictModalOpen(true);
        setToastMessage({ type: "error", text: res.message });
      }
    });
  };

  const handleConfirmReturnToDraft = async (reason: string) => {
    startTransition(async () => {
      const res = await returnPropertyToDraftAction(initialProperty._id, reason, version);
      if (res.success) {
        setPublicationStatus("DRAFT");
        setReturnModalOpen(false);
        setToastMessage({ type: "success", text: res.message });
        router.refresh();
      } else {
        if (res.code === "CONFLICT") setConflictModalOpen(true);
        setToastMessage({ type: "error", text: res.message });
      }
    });
  };

  const handleConfirmArchive = async () => {
    if (!archiveReason.trim()) return;
    startTransition(async () => {
      const res = await archivePropertyAction(initialProperty._id, archiveReason, version);
      if (res.success) {
        setPublicationStatus("ARCHIVED");
        setArchiveModalOpen(false);
        setArchiveReason("");
        setToastMessage({ type: "success", text: res.message });
        router.refresh();
      } else {
        if (res.code === "CONFLICT") setConflictModalOpen(true);
        setToastMessage({ type: "error", text: res.message });
      }
    });
  };

  const handleRestoreToDraft = async () => {
    startTransition(async () => {
      const res = await restorePropertyToDraftAction(initialProperty._id, version);
      if (res.success) {
        setPublicationStatus("DRAFT");
        setToastMessage({ type: "success", text: res.message });
        router.refresh();
      } else {
        if (res.code === "CONFLICT") setConflictModalOpen(true);
        setToastMessage({ type: "error", text: res.message });
      }
    });
  };

  const navItems = [
    { id: "section-basic", label: "1. Basic Info", icon: Building },
    { id: "section-location", label: "2. Location Hub", icon: MapPin },
    { id: "section-descriptions", label: "3. Highlights & Amenities", icon: FileText },
    { id: "section-pricing", label: "4. Pricing & Area", icon: DollarSign },
    { id: "section-milestones", label: "5. Milestones", icon: Compass },
    { id: "section-media", label: "6. Media Showcase", icon: ImageIcon },
    { id: "section-documents", label: "7. Legal Vault", icon: FileText },
    { id: "section-rera", label: "8. RERA Diligence", icon: ShieldCheck },
    { id: "section-seo", label: "9. SEO Metadata", icon: Globe },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="pb-32 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(7,26,40,0.06)]">
        <div>
          <Link
            href="/dashboard/properties"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#647581] hover:text-[#071a28] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Property Catalog</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#071a28] tracking-tight">
              {formData.title || "Untitled Property"}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                publicationStatus === "PUBLISHED"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : publicationStatus === "REVIEW"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : publicationStatus === "ARCHIVED"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {publicationStatus}
            </span>
          </div>
          <p className="text-xs text-[#647581] mt-0.5 font-mono">
            Document Version: v{version} • ID: {initialProperty._id}
          </p>
        </div>

        {/* Quick External Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/properties/${initialProperty._id}/inventory`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-bold bg-white hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Plot Inventory</span>
          </Link>

          <Link
            href={`/dashboard/properties/${initialProperty._id}/media`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-bold bg-white hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ImageIcon className="w-3.5 h-3.5 text-violet-500" />
            <span>Media</span>
          </Link>

          <Link
            href={`/dashboard/properties/${initialProperty._id}/documents`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-bold bg-white hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-rose-500" />
            <span>Documents</span>
          </Link>

          <Link
            href={`/dashboard/properties/${initialProperty._id}/preview`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-amber-700 text-xs font-bold bg-white hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </Link>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-2xs border ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Left Sidebar Nav + Central Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Section Navigation Sidebar */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24 space-y-2">
          <div className="p-4 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-1 text-xs">
            <span className="text-[10px] font-mono uppercase text-[#647581] font-bold block mb-2 px-2">
              Form Sections
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-medium text-[#071a28] hover:bg-[#f7f5ef] transition-colors cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-[#087fc3]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Central Form Sections */}
        <div className="lg:col-span-9 space-y-6">
          <BasicInfoSection
            formData={{
              title: formData.title,
              slug: formData.slug,
              shortDescription: formData.shortDescription,
              fullDescription: formData.fullDescription,
              propertyType: formData.propertyType,
              listingStatus: formData.listingStatus,
              sourceType: formData.sourceType,
              developerName: formData.developerName,
              featured: formData.featured,
              sortOrder: formData.sortOrder,
            }}
            errors={errors}
            onChange={updateFields}
            isPublished={publicationStatus === "PUBLISHED"}
            userRole={userRole}
          />

          <LocationClassificationSection
            locationId={formData.locationId}
            locations={locations}
            errors={errors}
            onChange={(locId) => updateFields({ locationId: locId })}
          />

          <DescriptionsSection
            highlights={formData.highlights}
            amenities={formData.amenities}
            onChange={updateFields}
          />

          <PricingAreaSection
            formData={{
              pricingType: formData.pricingType,
              startingPricePaise: formData.startingPricePaise,
              maximumPricePaise: formData.maximumPricePaise,
              ratePerSqYdPaise: formData.ratePerSqYdPaise,
              priceVisibility: formData.priceVisibility,
              pricingNote: formData.pricingNote,
              minimumAreaSqFt: formData.minimumAreaSqFt,
              maximumAreaSqFt: formData.maximumAreaSqFt,
              displayPreference: formData.displayPreference,
            }}
            errors={errors}
            onChange={updateFields}
          />

          <MilestonesSection
            connectivity={formData.connectivityMilestones}
            infrastructure={formData.infrastructureMilestones}
            onChange={updateFields}
          />

          <MediaMetadataSection
            media={formData.media}
            errors={errors}
            onChange={(m) => updateFields({ media: m })}
          />

          <DocumentsSection
            documents={formData.documents}
            onChange={(docs) => updateFields({ documents: docs })}
          />

          <ReraVerificationSection
            rera={formData.rera as any}
            verificationStatus={formData.verificationStatus}
            errors={errors}
            onChange={(fields) =>
              updateFields({
                ...fields,
                rera: fields.rera ? { ...formData.rera, ...fields.rera } : formData.rera,
              })
            }
          />

          <SeoSection seo={formData.seo} onChange={(s) => updateFields({ seo: { ...formData.seo, ...s } })} />
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[rgba(7,26,40,0.1)] p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {hasUnsavedChanges ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Unsaved Changes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
                All Changes Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            {/* Save Draft Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#0a6ba3] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isPending ? "Saving..." : "Save Draft"}</span>
            </button>

            {/* Lifecycle: Submit for Review (DRAFT) */}
            {publicationStatus === "DRAFT" && (
              <button
                type="button"
                onClick={handleSubmitForReview}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit for Review</span>
              </button>
            )}

            {/* Lifecycle: Return to Draft (REVIEW + Admin) */}
            {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && publicationStatus === "REVIEW" && (
              <button
                type="button"
                onClick={() => setReturnModalOpen(true)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return for Corrections</span>
              </button>
            )}

            {/* Lifecycle: Publish (Admin / Super Admin) */}
            {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") &&
              (publicationStatus === "REVIEW" || publicationStatus === "DRAFT") && (
                <button
                  type="button"
                  onClick={handleOpenChecklist}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Publish Property</span>
                </button>
              )}

            {/* Lifecycle: Archive (PUBLISHED + Admin) */}
            {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && publicationStatus === "PUBLISHED" && (
              <button
                type="button"
                onClick={() => setArchiveModalOpen(true)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive</span>
              </button>
            )}

            {/* Lifecycle: Restore (ARCHIVED + Admin) */}
            {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && publicationStatus === "ARCHIVED" && (
              <button
                type="button"
                onClick={handleRestoreToDraft}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore to Draft</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PublishingChecklistModal
        isOpen={checklistOpen}
        onClose={() => setChecklistOpen(false)}
        onConfirmPublish={handleConfirmPublish}
        checklist={checklistData}
        isLoading={checklistLoading}
        isPublishing={isPending}
        propertyTitle={formData.title}
      />

      <ReturnToDraftModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={handleConfirmReturnToDraft}
        isPending={isPending}
      />

      <ConcurrencyConflictModal
        isOpen={conflictModalOpen}
        onRefresh={() => router.refresh()}
      />

      {/* Archive Modal */}
      {archiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#071a28]">Archive Property</h3>
                <p className="text-xs text-[#647581]">{formData.title}</p>
              </div>
            </div>

            <p className="text-xs text-[#647581]">
              Archiving will immediately remove this property from public search results and investor portals. Historical plot reservations and audit trails will remain preserved.
            </p>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#071a28] font-bold mb-1">
                Reason for Archiving <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="e.g. Land parcel fully acquired / Delisted upon developer request"
                rows={3}
                className="w-full p-3 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setArchiveModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                disabled={isPending || !archiveReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                {isPending ? "Archiving..." : "Confirm Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
