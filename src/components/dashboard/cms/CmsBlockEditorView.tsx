"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CmsContentType,
  CMS_CONTENT_TYPES,
  CmsBlock,
  CMS_BLOCK_TYPES,
  CmsBlockType,
  STRUCTURED_DATA_TYPES,
} from "@/types/cms";
import {
  saveCmsDraftAction,
  publishCmsAction,
  rollbackCmsVersionAction,
  generatePreviewLinkAction,
} from "@/lib/actions/cms.actions";
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  RotateCcw,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Globe,
  Compass,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";

interface CmsBlockEditorViewProps {
  initialData?: any;
  isNew?: boolean;
  defaultType?: string;
}

export function CmsBlockEditorView({
  initialData,
  isNew,
  defaultType,
}: CmsBlockEditorViewProps) {
  const router = useRouter();
  const entry = initialData?.entry;
  const versions = initialData?.versions || [];

  const [contentType, setContentType] = useState<CmsContentType>(
    entry?.contentType || (defaultType as CmsContentType) || "STANDARD_PAGE"
  );
  const [title, setTitle] = useState(entry?.title || "");
  const [slug, setSlug] = useState(entry?.slug || "");
  const [excerpt, setExcerpt] = useState(entry?.excerpt || "");
  const [featuredMediaUrl, setFeaturedMediaUrl] = useState(entry?.featuredMediaUrl || "");
  const [metaTitle, setMetaTitle] = useState(entry?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(entry?.metaDescription || "");
  const [canonicalUrl, setCanonicalUrl] = useState(entry?.canonicalUrl || "");
  const [isNoIndex, setIsNoIndex] = useState(entry?.isNoIndex || false);
  const [structuredDataType, setStructuredDataType] = useState(entry?.structuredDataType || "ORGANIZATION");

  const [blocks, setBlocks] = useState<CmsBlock[]>(
    entry?.blocks?.length
      ? entry.blocks
      : [
          {
            id: "b_hero",
            type: "HERO",
            order: 0,
            data: { heading: "", subheading: "", buttonText: "Explore Opportunities", buttonLink: "/properties" },
          },
          {
            id: "b_content",
            type: "RICH_TEXT",
            order: 1,
            data: { html: "<p>Write rich, informative land acquisition content here...</p>" },
          },
        ]
  );

  const [activeTab, setActiveTab] = useState<"CONTENT" | "SEO" | "VERSIONS">("CONTENT");
  const [previewLink, setPreviewLink] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addBlock(type: CmsBlockType) {
    const newBlock: CmsBlock = {
      id: `block_${Date.now()}`,
      type,
      order: blocks.length,
      data:
        type === "RICH_TEXT"
          ? { html: "<p>New paragraph section...</p>" }
          : type === "CTA"
          ? { heading: "Schedule Private Land Tour", buttonText: "Book Site Visit", buttonLink: "/contact" }
          : type === "STATISTICS"
          ? { stat1Value: "100%", stat1Label: "RERA Clear Titles", stat2Value: "450+ Acres", stat2Label: "Under Custody" }
          : {},
    };
    setBlocks([...blocks, newBlock]);
  }

  function removeBlock(index: number) {
    setBlocks(blocks.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: "UP" | "DOWN") {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === blocks.length - 1) return;

    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    const reordered = [...blocks];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    setBlocks(reordered);
  }

  function updateBlockData(index: number, key: string, value: any) {
    const updated = [...blocks];
    updated[index].data = { ...updated[index].data, [key]: value };
    setBlocks(updated);
  }

  async function handleSaveDraft() {
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setStatusMessage(null);

    const formData = new FormData();
    if (entry?._id) formData.append("entryId", entry._id);
    formData.append("contentType", contentType);
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("excerpt", excerpt);
    formData.append("featuredMediaUrl", featuredMediaUrl);
    formData.append("metaTitle", metaTitle);
    formData.append("metaDescription", metaDescription);
    formData.append("canonicalUrl", canonicalUrl);
    formData.append("isNoIndex", String(isNoIndex));
    formData.append("structuredDataType", structuredDataType);
    formData.append("blocks", JSON.stringify(blocks));

    const res = await saveCmsDraftAction(formData);
    setIsSaving(false);

    if (res.success) {
      setStatusMessage("Draft saved successfully.");
      if (isNew && res.data?.entryId) {
        router.push(`/dashboard/content/editor/${res.data.entryId}`);
      }
    } else {
      setError(res.message || "Failed to save draft.");
    }
  }

  async function handlePublish() {
    if (!entry?._id) {
      await handleSaveDraft();
    }
    if (!entry?._id) return;

    setIsPublishing(true);
    setError(null);
    const res = await publishCmsAction(entry._id);
    setIsPublishing(false);

    if (res.success) {
      setStatusMessage(res.message || "Published successfully.");
      router.refresh();
    } else {
      setError(res.message || "Failed to publish.");
    }
  }

  async function handleGeneratePreview() {
    if (!entry?._id) {
      setError("Please save the draft first before generating a preview link.");
      return;
    }
    const res = await generatePreviewLinkAction(entry._id);
    if (res.success && res.data?.previewUrl) {
      setPreviewLink(res.data.previewUrl);
    } else {
      setError(res.message || "Failed to generate preview.");
    }
  }

  async function handleRollback(targetVersion: number) {
    if (!entry?._id) return;
    const res = await rollbackCmsVersionAction(entry._id, targetVersion);
    if (res.success) {
      setStatusMessage(`Rolled back to version ${targetVersion}.`);
      router.refresh();
    } else {
      setError(res.message || "Rollback failed.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/content"
            className="p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-[#647581] uppercase tracking-wider">
                {entry?.entryReference || "NEW ENTRY"}
              </span>
              {entry?.status && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-[#071a28] border border-[rgba(7,26,40,0.06)]">
                  {entry.status} (v{entry.currentVersionNumber})
                </span>
              )}
            </div>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-[#071a28]">
              {title || "Untitled Content"}
            </h1>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {entry?._id && (
            <button
              onClick={handleGeneratePreview}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50 shadow-2xs transition flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-[#0088cc]" />
              <span>Preview</span>
            </button>
          )}

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-[#071a28] bg-white hover:bg-stone-50 border border-[rgba(7,26,40,0.12)] rounded-xl shadow-2xs transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Draft"}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPublishing ? "Publishing..." : "Publish Page"}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 text-xs text-emerald-800 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 text-xs text-rose-800 bg-rose-50 rounded-2xl border border-rose-200">
          {error}
        </div>
      )}

      {previewLink && (
        <div className="p-4 rounded-3xl border border-[#0088cc]/30 bg-[#eaf5fa] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#071a28]">
              Signed Draft Preview URL (Expires in 2 hours):
            </span>
            <p className="font-mono text-xs text-[#0088cc]">{previewLink}</p>
          </div>
          <a
            href={previewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl transition"
          >
            <span>Open Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Editor Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[rgba(7,26,40,0.08)]">
        {[
          { id: "CONTENT", label: "Page Content & Blocks" },
          { id: "SEO", label: "SEO & Social Metadata" },
          { id: "VERSIONS", label: `Version History (${versions.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === tab.id
                ? "border-[#0088cc] text-[#0088cc]"
                : "border-transparent text-[#647581] hover:text-[#071a28]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Content Blocks */}
      {activeTab === "CONTENT" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Block Builder */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_24px_rgba(7,26,40,0.03)] space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#071a28] mb-1">
                  Title / Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2026 Plotted Land Investment Blueprint: Jaipur & Ajmer"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:ring-2 focus:ring-[#0088cc]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#071a28] mb-1">
                    Slug / URL Path <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="investment-guide-jaipur-ring-road"
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:ring-2 focus:ring-[#0088cc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#071a28] mb-1">
                    Content Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as CmsContentType)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:ring-2 focus:ring-[#0088cc]"
                  >
                    {CMS_CONTENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#071a28] mb-1">
                  Excerpt / Lead Paragraph
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Summary snippet displayed on archives and search previews..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:ring-2 focus:ring-[#0088cc]"
                />
              </div>
            </div>

            {/* Block Items Stream */}
            <div className="space-y-4">
              <h3 className="font-serif text-base font-bold text-[#071a28]">
                Content Blocks ({blocks.length})
              </h3>

              {blocks.map((block, idx) => (
                <div
                  key={block.id}
                  className="p-5 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_20px_rgba(7,26,40,0.02)] space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[rgba(7,26,40,0.06)] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#eaf5fa] text-[#0088cc] text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#071a28]">
                        {block.type} BLOCK
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveBlock(idx, "UP")}
                        disabled={idx === 0}
                        className="p-1 rounded-lg text-[#647581] hover:text-[#071a28] hover:bg-stone-100 disabled:opacity-30 transition"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveBlock(idx, "DOWN")}
                        disabled={idx === blocks.length - 1}
                        className="p-1 rounded-lg text-[#647581] hover:text-[#071a28] hover:bg-stone-100 disabled:opacity-30 transition"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeBlock(idx)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {block.type === "RICH_TEXT" && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#647581] mb-1">
                        Rich Text HTML Content (Sanitized)
                      </label>
                      <textarea
                        value={block.data.html || ""}
                        onChange={(e) => updateBlockData(idx, "html", e.target.value)}
                        rows={4}
                        className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#fcfbf9] text-[#071a28] focus:outline-hidden focus:ring-2 focus:ring-[#0088cc]"
                      />
                    </div>
                  )}

                  {block.type === "HERO" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#647581] mb-1">
                          Heading
                        </label>
                        <input
                          type="text"
                          value={block.data.heading || ""}
                          onChange={(e) => updateBlockData(idx, "heading", e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#647581] mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={block.data.buttonText || ""}
                          onChange={(e) => updateBlockData(idx, "buttonText", e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === "CTA" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#647581] mb-1">
                          CTA Heading
                        </label>
                        <input
                          type="text"
                          value={block.data.heading || ""}
                          onChange={(e) => updateBlockData(idx, "heading", e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#647581] mb-1">
                          Action Destination URL
                        </label>
                        <input
                          type="text"
                          value={block.data.buttonLink || ""}
                          onChange={(e) => updateBlockData(idx, "buttonLink", e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Block Selector */}
              <div className="p-4 rounded-3xl border border-dashed border-[rgba(7,26,40,0.15)] bg-[#fcfbf9] flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#071a28] mr-2">
                  + Add Block:
                </span>
                {["RICH_TEXT", "HERO", "CTA", "STATISTICS", "FEATURE_LIST", "FAQ", "MAP"].map((t) => (
                  <button
                    key={t}
                    onClick={() => addBlock(t as CmsBlockType)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[rgba(7,26,40,0.12)] text-[#071a28] hover:border-[#0088cc] hover:text-[#0088cc] transition shadow-2xs"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Google Snippet Preview */}
          <div className="space-y-6">
            <div className="p-5 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_24px_rgba(7,26,40,0.03)] space-y-3">
              <h3 className="font-serif text-sm font-bold text-[#071a28] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#0088cc]" />
                <span>Google Search Snippet Preview</span>
              </h3>

              <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] text-xs space-y-1">
                <div className="text-[11px] text-[#647581] truncate">
                  https://ratiwaldreamestates.com/{slug || "slug-preview"}
                </div>
                <div className="text-sm font-bold text-[#0088cc] hover:underline line-clamp-1">
                  {metaTitle || title || "Page Title — Ratiwal Dream Estates"}
                </div>
                <p className="text-xs text-[#647581] line-clamp-2 leading-relaxed">
                  {metaDescription || excerpt || "Verified plotted land developments and commercial corridors across Jaipur and Navi Mumbai..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SEO Settings */}
      {activeTab === "SEO" && (
        <div className="max-w-2xl p-6 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_24px_rgba(7,26,40,0.03)] space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">
              Custom Meta Title (Max 60 chars)
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="e.g. Royal Palms Township | Ajmer Road Villa Plots"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">
              Meta Description (Max 160 chars)
            </label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Discover luxury villa plots on Ajmer Road, Jaipur with clear JDA patta documentation..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">
              Canonical URL Override (Optional)
            </label>
            <input
              type="text"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="https://ratiwaldreamestates.com/..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1">
              Structured Data Schema.org Type
            </label>
            <select
              value={structuredDataType}
              onChange={(e) => setStructuredDataType(e.target.value as any)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
            >
              {STRUCTURED_DATA_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNoIndex}
                onChange={(e) => setIsNoIndex(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-[#0088cc] focus:ring-[#0088cc]"
              />
              <span className="text-xs font-medium text-[#071a28]">
                Add <code>noindex, nofollow</code> tag (Hide page from search engines)
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Tab 3: Version History */}
      {activeTab === "VERSIONS" && (
        <div className="rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white overflow-hidden shadow-[0_4px_24px_rgba(7,26,40,0.03)]">
          <div className="px-6 py-4.5 bg-[#fcfbf9] border-b border-[rgba(7,26,40,0.06)]">
            <h3 className="font-serif text-base font-bold text-[#071a28]">
              Immutable Version Lineage ({versions.length})
            </h3>
          </div>

          <div className="divide-y divide-[rgba(7,26,40,0.05)]">
            {versions.length === 0 ? (
              <p className="p-8 text-center text-xs text-[#647581]">
                No previous published versions recorded yet.
              </p>
            ) : (
              versions.map((v: any) => (
                <div key={v._id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#071a28]">
                      Version {v.versionNumber}
                    </span>
                    <p className="text-[#647581] mt-0.5">{v.changeSummary}</p>
                    <span className="text-[10px] text-[#647581]">
                      Published {new Date(v.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} by {v.createdByName}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRollback(v.versionNumber)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#0088cc] bg-[#eaf5fa] hover:bg-[#d6ecf7] rounded-lg transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Rollback</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
