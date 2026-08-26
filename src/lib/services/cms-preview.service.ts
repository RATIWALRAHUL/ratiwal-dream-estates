import "server-only";

import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CmsEntry, ICmsEntry } from "@/models/CmsEntry";

export class CmsPreviewService {
  /**
   * Hashes a raw preview token using SHA-256
   */
  public static hashToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  /**
   * Generates a 2-hour cryptographic draft preview token
   */
  public static async generatePreviewLink(entryId: string): Promise<{ previewUrl: string; expiresAt: Date }> {
    await connectToDatabase();

    const entry = await CmsEntry.findById(entryId);
    if (!entry) {
      throw new Error("NOT_FOUND: CMS entry not found.");
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 2 * 3600 * 1000); // 2 hours

    entry.previewTokenHash = tokenHash;
    entry.previewTokenExpiresAt = expiresAt;
    await entry.save();

    const previewUrl = `/preview/${rawToken}`;
    return { previewUrl, expiresAt };
  }

  /**
   * Resolves a CMS entry by raw preview token verifying expiry
   */
  public static async resolvePreviewEntry(rawToken: string): Promise<ICmsEntry | null> {
    if (!rawToken || rawToken.length < 32) return null;
    await connectToDatabase();

    const tokenHash = this.hashToken(rawToken);
    const entry = await CmsEntry.findOne({
      previewTokenHash: tokenHash,
      previewTokenExpiresAt: { $gt: new Date() },
    })
      .populate("relatedPropertyIds", "title slug pricePaise")
      .populate("relatedLocationIds", "name slug");

    return entry;
  }
}
