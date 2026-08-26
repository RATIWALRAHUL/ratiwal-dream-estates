import "server-only";

import { connectToDatabase } from "@/lib/db/mongoose";
import { CmsEntry } from "@/models/CmsEntry";
import { CmsEntryVersion } from "@/models/CmsEntryVersion";
import { RedirectRule } from "@/models/RedirectRule";
import { CmsTestimonial } from "@/models/CmsTestimonial";
import { CmsFaqItem } from "@/models/CmsFaqItem";
import { CmsOverviewMetrics, CmsEntryListItemDTO, CmsContentType, CmsPublishingStatus } from "@/types/cms";

export class CmsQueryService {
  /**
   * Fetches CMS overview KPI metrics
   */
  public static async getCmsOverviewMetrics(): Promise<CmsOverviewMetrics> {
    await connectToDatabase();

    const [
      totalPublishedCount,
      draftsCount,
      underReviewCount,
      scheduledCount,
      totalRedirectsCount,
    ] = await Promise.all([
      CmsEntry.countDocuments({ status: "PUBLISHED" }),
      CmsEntry.countDocuments({ status: "DRAFT" }),
      CmsEntry.countDocuments({ status: "UNDER_REVIEW" }),
      CmsEntry.countDocuments({ status: "SCHEDULED" }),
      RedirectRule.countDocuments({ status: "ACTIVE" }),
    ]);

    return {
      totalPublishedCount,
      draftsCount,
      underReviewCount,
      scheduledCount,
      totalRedirectsCount,
      seoIssuesCount: 0,
    };
  }

  /**
   * Fetches CMS entries matching filters
   */
  public static async getCmsEntries(filters: {
    contentType?: string;
    status?: string;
    search?: string;
  }): Promise<CmsEntryListItemDTO[]> {
    await connectToDatabase();

    const query: any = {};
    if (filters.contentType && filters.contentType !== "ALL") {
      query.contentType = filters.contentType;
    }
    if (filters.status && filters.status !== "ALL") {
      query.status = filters.status;
    }
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { slug: { $regex: filters.search, $options: "i" } },
        { entryReference: { $regex: filters.search, $options: "i" } },
      ];
    }

    const entries = await CmsEntry.find(query)
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    return entries.map((e: any) => ({
      id: e._id.toString(),
      entryReference: e.entryReference,
      contentType: e.contentType,
      title: e.title,
      slug: e.slug,
      status: e.status,
      currentVersionNumber: e.currentVersionNumber,
      publishedVersionNumber: e.publishedVersionNumber,
      authorName: e.authorName,
      reviewerName: e.reviewerName,
      publishedAt: e.publishedAt ? new Date(e.publishedAt).toISOString() : undefined,
      scheduledAt: e.scheduledAt ? new Date(e.scheduledAt).toISOString() : undefined,
      updatedAt: new Date(e.updatedAt).toISOString(),
      isNoIndex: Boolean(e.isNoIndex),
    }));
  }

  /**
   * Fetches full CMS entry detail along with version history
   */
  public static async getCmsEntryDetail(entryId: string) {
    await connectToDatabase();

    const [entry, versions] = await Promise.all([
      CmsEntry.findById(entryId)
        .populate("relatedPropertyIds", "title slug pricePaise")
        .populate("relatedLocationIds", "name slug")
        .lean(),
      CmsEntryVersion.find({ entryId })
        .sort({ versionNumber: -1 })
        .limit(20)
        .lean(),
    ]);

    if (!entry) return null;

    return {
      entry: {
        ...entry,
        _id: entry._id.toString(),
        publishedAt: entry.publishedAt?.toISOString(),
        scheduledAt: entry.scheduledAt?.toISOString(),
        unpublishedAt: entry.unpublishedAt?.toISOString(),
        createdAt: entry.createdAt?.toISOString(),
        updatedAt: entry.updatedAt?.toISOString(),
      },
      versions: versions.map((v: any) => ({
        ...v,
        _id: v._id.toString(),
        entryId: v.entryId.toString(),
        createdAt: v.createdAt?.toISOString(),
        publishedAt: v.publishedAt?.toISOString(),
      })),
    };
  }

  /**
   * Fetches published CMS entries for dynamic sitemap generation
   */
  public static async getSitemapEntries() {
    await connectToDatabase();

    const published = await CmsEntry.find({
      status: "PUBLISHED",
      isNoIndex: { $ne: true },
    })
      .select("slug contentType updatedAt publishedAt")
      .lean();

    return published.map((p: any) => {
      let path = `/${p.slug}`;
      if (p.contentType === "BLOG_POST") path = `/insights/${p.slug}`;
      else if (p.contentType === "LOCATION_PAGE") path = `/locations/${p.slug}`;
      else if (p.contentType === "PROPERTY_CONTENT") path = `/properties/${p.slug}`;

      return {
        path,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(p.publishedAt || Date.now()),
      };
    });
  }
}
