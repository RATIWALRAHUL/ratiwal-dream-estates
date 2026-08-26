import "server-only";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CmsEntry, ICmsEntry } from "@/models/CmsEntry";
import { CmsEntryVersion } from "@/models/CmsEntryVersion";
import {
  CmsPublishingStatus,
  isValidCmsStatusTransition,
} from "@/types/cms";
import { CmsSlugService } from "./cms-slug.service";
import { CmsSanitizerService } from "./cms-sanitizer.service";
import { logAuditEvent } from "./audit.service";

export interface SaveCmsDraftInput {
  entryId?: string;
  contentType: any;
  title: string;
  slug: string;
  excerpt?: string;
  blocks: any[];
  metaTitle?: string;
  metaDescription?: string;
  isNoIndex?: boolean;
  canonicalUrl?: string;
  ogImage?: string;
  structuredDataType?: any;
  structuredDataOverride?: string;
  featuredMediaUrl?: string;
  featuredMediaAlt?: string;
  relatedPropertyIds?: string[];
  relatedLocationIds?: string[];
  tags?: string[];
  categories?: string[];
  readingTimeMinutes?: number;
  actorId: string;
  actorName: string;
  actorEmail?: string;
  actorRole?: string;
  changeSummary?: string;
}

export class CmsPublishingService {
  /**
   * Saves or updates a CMS entry as DRAFT
   */
  public static async saveDraft(input: SaveCmsDraftInput): Promise<ICmsEntry> {
    await connectToDatabase();

    const normalizedSlug = CmsSlugService.normalizeSlug(input.slug);
    const availability = await CmsSlugService.validateSlugAvailability(normalizedSlug, input.entryId);
    if (!availability.isAvailable) {
      throw new Error(`SLUG_INVALID: ${availability.reason}`);
    }

    const sanitizedBlocks = CmsSanitizerService.sanitizeBlocks(input.blocks);

    let entry: ICmsEntry | null = null;

    if (input.entryId) {
      entry = await CmsEntry.findById(input.entryId);
      if (!entry) {
        throw new Error("NOT_FOUND: CMS entry not found.");
      }

      // If already published, editing creates a new working draft version
      if (entry.status === "PUBLISHED") {
        entry.status = "DRAFT";
      }

      entry.title = input.title.trim();
      entry.slug = normalizedSlug;
      entry.excerpt = input.excerpt?.trim();
      entry.blocks = sanitizedBlocks;
      entry.metaTitle = input.metaTitle?.trim();
      entry.metaDescription = input.metaDescription?.trim();
      entry.isNoIndex = Boolean(input.isNoIndex);
      entry.canonicalUrl = input.canonicalUrl?.trim();
      entry.ogImage = input.ogImage?.trim();
      entry.structuredDataType = input.structuredDataType;
      entry.structuredDataOverride = input.structuredDataOverride;
      entry.featuredMediaUrl = input.featuredMediaUrl?.trim();
      entry.featuredMediaAlt = input.featuredMediaAlt?.trim();
      entry.relatedPropertyIds = input.relatedPropertyIds?.map((id) => new Types.ObjectId(id));
      entry.relatedLocationIds = input.relatedLocationIds?.map((id) => new Types.ObjectId(id));
      entry.tags = input.tags || [];
      entry.categories = input.categories || [];
      entry.readingTimeMinutes = input.readingTimeMinutes || 3;
      entry.updatedBy = input.actorId;
      entry.updatedByName = input.actorName;
      entry.version += 1;

      await entry.save();
    } else {
      const count = await CmsEntry.countDocuments();
      const entryReference = `RDE-CMS-${String(count + 100001).slice(1)}`;

      entry = await CmsEntry.create({
        entryReference,
        contentType: input.contentType,
        title: input.title.trim(),
        slug: normalizedSlug,
        excerpt: input.excerpt?.trim(),
        blocks: sanitizedBlocks,
        metaTitle: input.metaTitle?.trim(),
        metaDescription: input.metaDescription?.trim(),
        isNoIndex: Boolean(input.isNoIndex),
        canonicalUrl: input.canonicalUrl?.trim(),
        ogImage: input.ogImage?.trim(),
        structuredDataType: input.structuredDataType,
        structuredDataOverride: input.structuredDataOverride,
        featuredMediaUrl: input.featuredMediaUrl?.trim(),
        featuredMediaAlt: input.featuredMediaAlt?.trim(),
        relatedPropertyIds: input.relatedPropertyIds?.map((id) => new Types.ObjectId(id)),
        relatedLocationIds: input.relatedLocationIds?.map((id) => new Types.ObjectId(id)),
        tags: input.tags || [],
        categories: input.categories || [],
        readingTimeMinutes: input.readingTimeMinutes || 3,
        status: "DRAFT",
        authorId: input.actorId,
        authorName: input.actorName,
        authorEmail: input.actorEmail,
        createdBy: input.actorId,
        createdByName: input.actorName,
        version: 1,
        currentVersionNumber: 1,
      });
    }

    await logAuditEvent({
      actor: { id: input.actorId, role: (input.actorRole as any) || "SUPER_ADMIN", email: input.actorEmail, name: input.actorName },
      action: input.entryId ? "CMS_ENTRY_UPDATED" : "CMS_ENTRY_CREATED",
      targetCmsEntryId: entry._id,
      reason: input.changeSummary || "CMS draft saved",
    });

    return entry;
  }

  /**
   * Publishes a CMS entry creating an immutable version snapshot
   */
  public static async publishEntry(entryId: string, actorId: string, actorName: string, actorEmail?: string): Promise<ICmsEntry> {
    await connectToDatabase();

    const entry = await CmsEntry.findById(entryId);
    if (!entry) {
      throw new Error("NOT_FOUND: CMS entry not found.");
    }

    const previousStatus = entry.status;
    const now = new Date();
    const newVersionNumber = (entry.publishedVersionNumber || 0) + 1;

    // Create immutable version snapshot
    const versionSnapshot = await CmsEntryVersion.create({
      entryId: entry._id,
      versionNumber: newVersionNumber,
      titleSnapshot: entry.title,
      slugSnapshot: entry.slug,
      excerptSnapshot: entry.excerpt,
      blocksSnapshot: entry.blocks,
      seoSnapshot: {
        metaTitle: entry.metaTitle,
        metaDescription: entry.metaDescription,
        canonicalUrl: entry.canonicalUrl,
        isNoIndex: entry.isNoIndex,
        ogImage: entry.ogImage,
        structuredDataType: entry.structuredDataType,
      },
      featuredMediaUrl: entry.featuredMediaUrl,
      relatedPropertyIds: entry.relatedPropertyIds,
      relatedLocationIds: entry.relatedLocationIds,
      tags: entry.tags,
      categories: entry.categories,
      changeSummary: `Published version ${newVersionNumber}`,
      createdBy: entry.authorId,
      createdByName: entry.authorName,
      approvedBy: actorId,
      approvedByName: actorName,
      publishedAt: now,
    });

    entry.status = "PUBLISHED";
    entry.publishedAt = entry.publishedAt || now;
    entry.publishedVersionNumber = newVersionNumber;
    entry.currentVersionNumber = newVersionNumber;
    entry.reviewerId = actorId;
    entry.reviewerName = actorName;
    entry.updatedBy = actorId;
    entry.updatedByName = actorName;
    entry.version += 1;

    await entry.save();

    // Revalidate public route paths
    if (entry.contentType === "BLOG_POST") {
      revalidatePath(`/insights`);
      revalidatePath(`/insights/${entry.slug}`);
    } else if (entry.contentType === "LOCATION_PAGE") {
      revalidatePath(`/locations`);
      revalidatePath(`/locations/${entry.slug}`);
    } else {
      revalidatePath(`/${entry.slug}`);
    }
    revalidatePath(`/sitemap.xml`);

    await logAuditEvent({
      actor: { id: actorId, role: "SUPER_ADMIN", email: actorEmail, name: actorName },
      action: "CMS_ENTRY_PUBLISHED",
      targetCmsEntryId: entry._id,
      targetCmsVersionId: versionSnapshot._id,
      reason: `Published version ${newVersionNumber}`,
    });

    return entry;
  }

  /**
   * Rolls back an entry to a previous version snapshot by creating a new forward version
   */
  public static async rollbackVersion(entryId: string, targetVersionNumber: number, actorId: string, actorName: string): Promise<ICmsEntry> {
    await connectToDatabase();

    const [entry, version] = await Promise.all([
      CmsEntry.findById(entryId),
      CmsEntryVersion.findOne({ entryId, versionNumber: targetVersionNumber }),
    ]);

    if (!entry || !version) {
      throw new Error("NOT_FOUND: Entry or targeted version snapshot not found.");
    }

    entry.title = version.titleSnapshot;
    entry.slug = version.slugSnapshot;
    entry.excerpt = version.excerptSnapshot;
    entry.blocks = version.blocksSnapshot;
    entry.metaTitle = version.seoSnapshot?.metaTitle;
    entry.metaDescription = version.seoSnapshot?.metaDescription;
    entry.isNoIndex = Boolean(version.seoSnapshot?.isNoIndex);
    entry.canonicalUrl = version.seoSnapshot?.canonicalUrl;
    entry.ogImage = version.seoSnapshot?.ogImage;
    entry.featuredMediaUrl = version.featuredMediaUrl;
    entry.relatedPropertyIds = version.relatedPropertyIds;
    entry.relatedLocationIds = version.relatedLocationIds;
    entry.tags = version.tags;
    entry.categories = version.categories;
    entry.status = "DRAFT";
    entry.updatedBy = actorId;
    entry.updatedByName = actorName;
    entry.version += 1;

    await entry.save();

    await logAuditEvent({
      actor: { id: actorId, role: "SUPER_ADMIN", name: actorName },
      action: "CMS_ENTRY_ROLLBACK",
      targetCmsEntryId: entry._id,
      targetCmsVersionId: version._id,
      reason: `Rollback applied from version ${targetVersionNumber}`,
    });

    return entry;
  }

  /**
   * Processes scheduled entries whose scheduled timestamp is due
   */
  public static async processScheduledPublications() {
    await connectToDatabase();
    const now = new Date();

    const dueEntries = await CmsEntry.find({
      status: "SCHEDULED",
      scheduledAt: { $lte: now },
    }).limit(20);

    for (const entry of dueEntries) {
      await this.publishEntry(
        entry._id.toString(),
        "SYSTEM_SCHEDULER",
        "Ratiwal Scheduled Publisher",
        "system@ratiwaldreamestates.com"
      );
    }

    return { processedCount: dueEntries.length };
  }
}
