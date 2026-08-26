import "server-only";

import { connectToDatabase } from "@/lib/db/mongoose";
import { CmsEntry } from "@/models/CmsEntry";
import { Property } from "@/models/Property";
import { Location } from "@/models/Location";
import { RedirectRule } from "@/models/RedirectRule";

export class CmsSlugService {
  private static readonly RESERVED_SLUGS = new Set([
    "dashboard",
    "portal",
    "partner",
    "api",
    "preview",
    "login",
    "admin",
    "kyc",
    "payments",
    "contact",
    "investment",
    "about",
    "why-choose-us",
    "properties",
    "locations",
    "testimonials",
    "insights",
    "privacy-policy",
    "terms-of-service",
    "disclaimer",
    "sitemap.xml",
    "robots.txt",
  ]);

  /**
   * Normalizes a string into a URL-safe slug
   */
  public static normalizeSlug(raw: string): string {
    if (!raw) return "";
    return raw
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Validates if a slug is safe and does not collide with reserved routes
   */
  public static async validateSlugAvailability(slug: string, currentEntryId?: string): Promise<{ isAvailable: boolean; reason?: string }> {
    const normalized = this.normalizeSlug(slug);

    if (!normalized || normalized.length < 2) {
      return { isAvailable: false, reason: "Slug must be at least 2 characters long." };
    }

    if (this.RESERVED_SLUGS.has(normalized)) {
      return { isAvailable: false, reason: `The slug "${normalized}" is reserved for platform system routing.` };
    }

    await connectToDatabase();

    // Check collision in CmsEntry
    const query: any = { slug: normalized };
    if (currentEntryId) {
      query._id = { $ne: currentEntryId };
    }
    const existingCms = await CmsEntry.findOne(query);
    if (existingCms) {
      return { isAvailable: false, reason: `The slug "${normalized}" is already in use by another CMS entry.` };
    }

    // Check collision in Properties & Locations
    const [existingProperty, existingLocation] = await Promise.all([
      Property.findOne({ slug: normalized }),
      Location.findOne({ slug: normalized }),
    ]);

    if (existingProperty) {
      return { isAvailable: false, reason: `The slug "${normalized}" collides with an existing property.` };
    }
    if (existingLocation) {
      return { isAvailable: false, reason: `The slug "${normalized}" collides with an existing location hub.` };
    }

    return { isAvailable: true };
  }

  /**
   * Creates a 301 redirect rule when a published slug is modified
   */
  public static async handlePublishedSlugChange(
    oldSlug: string,
    newSlug: string,
    contentType: string,
    actorId: string,
    actorName: string
  ) {
    if (oldSlug === newSlug) return;
    await connectToDatabase();

    const getPrefix = (type: string) => {
      if (type === "BLOG_POST") return "/insights/";
      if (type === "LOCATION_PAGE") return "/locations/";
      if (type === "PROPERTY_CONTENT") return "/properties/";
      return "/";
    };

    const sourcePath = `${getPrefix(contentType)}${oldSlug}`.toLowerCase();
    const destinationPath = `${getPrefix(contentType)}${newSlug}`.toLowerCase();

    // Upsert 301 redirect
    await RedirectRule.findOneAndUpdate(
      { sourcePath },
      {
        sourcePath,
        destinationPath,
        redirectType: "301",
        status: "ACTIVE",
        reason: `Auto-generated on CMS slug update for ${contentType}`,
        createdBy: actorId,
        createdByName: actorName,
      },
      { upsert: true, new: true }
    );
  }
}
