"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  TrendingUp,
  Save,
  Send,
  CheckCircle2,
  RotateCcw,
  Archive,
  ExternalLink,
  Loader2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import {
  updateLocationAction,
  submitLocationForReviewAction,
  publishLocationAction,
  restoreLocationToDraftAction,
} from "@/lib/actions/location.actions";
import { validateLocationPublishingChecklist } from "@/lib/utils/location-intelligence";
import type { ILocation } from "@/types/database";

// Editor Sections
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { GeographicIdentitySection } from "./sections/GeographicIdentitySection";
import { DescriptionsSection } from "./sections/DescriptionsSection";
import { HeroMediaSection } from "./sections/HeroMediaSection";
import { MicroMarketsSection } from "./sections/MicroMarketsSection";
import { InfrastructureSection } from "./sections/InfrastructureSection";
import { ConnectivitySection } from "./sections/ConnectivitySection";
import { MarketIntelligenceSection } from "./sections/MarketIntelligenceSection";
import { PropertyTypesSection } from "./sections/PropertyTypesSection";
import { SeoSection } from "./sections/SeoSection";
import { PublishingChecklistModal } from "./sections/PublishingChecklistModal";
import { ReturnToDraftModal, ArchiveLocationModal } from "./sections/LifecycleModals";
import { PublishedSlugModal } from "./sections/PublishedSlugModal";

interface LocationEditorProps {
  initialData: ILocation & { _id: string };
  userRole: string;
  propertyCount: number;
}

export function LocationEditor({
  initialData,
  userRole,
  propertyCount,
}: LocationEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ILocation & { _id: string }>(initialData);
  const [currentVersion, setCurrentVersion] = useState<number>(initialData.version || 0);

  const [activeSection, setActiveSection] = useState<string>("basic");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [returnDraftModalOpen, setReturnDraftModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [slugModalOpen, setSlugModalOpen] = useState(false);

  const updateFields = (fields: Record<string, any>) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }));
  };

  const handleSave = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateLocationAction(formData._id, {
        expectedVersion: currentVersion,
        name: formData.name,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        region: formData.region,
        tagline: formData.tagline,
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
        heroImage: formData.heroImage,
        coordinates: formData.coordinates,
        supportedPropertyTypes: formData.supportedPropertyTypes,
        featured: formData.featured,
        sortOrder: formData.sortOrder,
        verificationStatus: formData.verificationStatus,
        verifiedBy: formData.verifiedBy,
        verificationNotes: formData.verificationNotes,
        seo: formData.seo,
      });

      if (res.success && res.data) {
        setCurrentVersion(res.data.version);
        setFeedback({ type: "success", message: `Corridor successfully saved (v${res.data.version}).` });
      } else {
        setFeedback({ type: "error", message: res.message || "Failed to update location." });
      }
    });
  };

  const handleSubmitForReview = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await submitLocationForReviewAction(formData._id);
      if (res.success) {
        setFormData((prev) => ({ ...prev, publicationStatus: "REVIEW" }));
        setFeedback({ type: "success", message: "Location submitted for editorial review." });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  const handleConfirmPublish = () => {
    startTransition(async () => {
      const res = await publishLocationAction(formData._id);
      if (res.success) {
        setFormData((prev) => ({ ...prev, publicationStatus: "PUBLISHED" }));
        setChecklistModalOpen(false);
        setFeedback({ type: "success", message: "Location published live to public marketplace." });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  const handleRestore = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await restoreLocationToDraftAction(formData._id);
      if (res.success) {
        setFormData((prev) => ({ ...prev, publicationStatus: "DRAFT" }));
        setFeedback({ type: "success", message: "Location restored to DRAFT status." });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  // Compute live 16-point checklist
  const publishingChecklist = validateLocationPublishingChecklist(formData);

  const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    DRAFT: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
    REVIEW: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    PUBLISHED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    ARCHIVED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  };
  const currentStatusStyle = statusStyles[formData.publicationStatus] || statusStyles.DRAFT;

  const sections = [
    { id: "basic", label: "1. Basic Info" },
    { id: "geo", label: "2. Geography" },
    { id: "descriptions", label: "3. Descriptions" },
    { id: "media", label: "4. Hero Media" },
    { id: "micromarkets", label: `5. Micro-Markets (${formData.microMarkets?.length || 0})` },
    { id: "infrastructure", label: `6. Infrastructure (${formData.infrastructureHighlights?.length || 0})` },
    { id: "connectivity", label: `7. Connectivity (${formData.connectivityHighlights?.length || 0})` },
    { id: "intelligence", label: `8. Intelligence (${formData.marketObservations?.length || 0})` },
    { id: "propertytypes", label: "9. Property Types" },
    { id: "seo", label: "10. SEO Metadata" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-[0_4px_20px_rgba(7,26,40,0.04)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#647581] mb-1.5">
            <Link href="/dashboard/locations" className="hover:text-[#087fc3] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Locations</span>
            </Link>
            <span>/</span>
            <span className="text-[#071a28] font-medium">{formData.city}</span>
            <span>/</span>
            <span className="text-[#647581] font-mono">v{currentVersion}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-serif text-[#071a28] font-normal tracking-tight">
              {formData.name}
            </h1>
            <span
              className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${currentStatusStyle.bg} ${currentStatusStyle.text} ${currentStatusStyle.border}`}
            >
              {formData.publicationStatus}
            </span>
          </div>
        </div>

        {/* Quick Nav Links */}
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/locations/${formData._id}/preview`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#071a28] text-xs font-semibold transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#647581]" />
            <span>Preview</span>
          </Link>

          <Link
            href={`/dashboard/locations/${formData._id}/intelligence`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#eaf5fa] hover:bg-[#087fc3] hover:text-white text-[#087fc3] text-xs font-semibold transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Intelligence Hub</span>
          </Link>

          {formData.publicationStatus === "PUBLISHED" && (
            <Link
              href={`/locations/${formData.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#071a28] text-white text-xs font-semibold hover:bg-[#0a6ba3] transition-colors shadow-2xs"
            >
              <span>Live Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#42b7e8]" />
            </Link>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-2 font-body animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[#647581] hover:text-[#071a28] text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Horizontal Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {sections.map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => setActiveSection(sec.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === sec.id
                ? "bg-[#087fc3] text-white shadow-xs"
                : "bg-white text-[#647581] hover:text-[#071a28] border border-[rgba(7,26,40,0.08)]"
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="space-y-6">
        {activeSection === "basic" && (
          <BasicInfoSection
            name={formData.name}
            slug={formData.slug}
            city={formData.city}
            state={formData.state}
            country={formData.country}
            region={formData.region}
            tagline={formData.tagline}
            featured={formData.featured}
            sortOrder={formData.sortOrder}
            publicationStatus={formData.publicationStatus}
            userRole={userRole}
            onChange={updateFields}
            onRequestSlugChange={() => setSlugModalOpen(true)}
          />
        )}

        {activeSection === "geo" && (
          <GeographicIdentitySection
            coordinates={formData.coordinates}
            onChange={updateFields}
          />
        )}

        {activeSection === "descriptions" && (
          <DescriptionsSection
            shortDescription={formData.shortDescription}
            longDescription={formData.longDescription}
            onChange={updateFields}
          />
        )}

        {activeSection === "media" && (
          <HeroMediaSection
            heroImage={formData.heroImage}
            onChange={updateFields}
          />
        )}

        {activeSection === "micromarkets" && (
          <MicroMarketsSection
            microMarkets={formData.microMarkets || []}
            onChange={updateFields}
          />
        )}

        {activeSection === "infrastructure" && (
          <InfrastructureSection
            infrastructureHighlights={formData.infrastructureHighlights || []}
            onChange={updateFields}
          />
        )}

        {activeSection === "connectivity" && (
          <ConnectivitySection
            connectivityHighlights={formData.connectivityHighlights || []}
            onChange={updateFields}
          />
        )}

        {activeSection === "intelligence" && (
          <MarketIntelligenceSection
            marketObservations={formData.marketObservations || []}
            onChange={updateFields}
          />
        )}

        {activeSection === "propertytypes" && (
          <PropertyTypesSection
            supportedPropertyTypes={formData.supportedPropertyTypes || []}
            onChange={updateFields}
          />
        )}

        {activeSection === "seo" && (
          <SeoSection
            seo={formData.seo}
            slug={formData.slug}
            onChange={updateFields}
          />
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#071a28]/95 backdrop-blur-md text-white border border-[#0d2c42] shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#087fc3] hover:bg-[#0a6ba3] text-white text-xs font-semibold shadow-[0_4px_16px_rgba(8,127,195,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Changes</span>
          </button>

          <span className="text-[11px] font-mono text-[#a0b6c6] hidden sm:inline">
            Version {currentVersion}
          </span>
        </div>

        {/* Lifecycle Transitions */}
        <div className="flex items-center gap-2">
          {formData.publicationStatus === "DRAFT" && (
            <button
              type="button"
              onClick={handleSubmitForReview}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Review</span>
            </button>
          )}

          {formData.publicationStatus === "REVIEW" && (
            <>
              {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
                <button
                  type="button"
                  onClick={() => setReturnDraftModalOpen(true)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Return to Draft</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setChecklistModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Publishing Audit ({publishingChecklist.readyCount}/{publishingChecklist.totalChecks})</span>
              </button>
            </>
          )}

          {formData.publicationStatus === "PUBLISHED" && (userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
            <button
              type="button"
              onClick={() => setArchiveModalOpen(true)}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive Location</span>
            </button>
          )}

          {formData.publicationStatus === "ARCHIVED" && (userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
            <button
              type="button"
              onClick={handleRestore}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restore to Draft</span>
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <PublishingChecklistModal
        isOpen={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        checklist={publishingChecklist}
        onConfirmPublish={handleConfirmPublish}
        isPublishing={isPending}
        userRole={userRole}
      />

      <ReturnToDraftModal
        isOpen={returnDraftModalOpen}
        onClose={() => setReturnDraftModalOpen(false)}
        locationId={formData._id}
        onSuccess={() => {
          setFormData((prev) => ({ ...prev, publicationStatus: "DRAFT" }));
          setFeedback({ type: "success", message: "Location returned to DRAFT with feedback." });
        }}
      />

      <ArchiveLocationModal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        locationId={formData._id}
        locationName={formData.name}
        propertyCount={propertyCount}
        onSuccess={() => {
          setFormData((prev) => ({ ...prev, publicationStatus: "ARCHIVED" }));
          setFeedback({ type: "success", message: "Location corridor archived successfully." });
        }}
      />

      {slugModalOpen && (
        <PublishedSlugModal
          isOpen={slugModalOpen}
          onClose={() => setSlugModalOpen(false)}
          locationId={formData._id}
          currentSlug={formData.slug}
          onSuccess={(newSlug) => {
            setFormData((prev) => ({ ...prev, slug: newSlug }));
            setFeedback({ type: "success", message: `Slug updated to "/locations/${newSlug}".` });
          }}
        />
      )}
    </div>
  );
}
