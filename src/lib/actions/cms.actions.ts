"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";

import { RedirectRule } from "@/models/RedirectRule";
import { CmsTestimonial } from "@/models/CmsTestimonial";
import { CmsFaqItem } from "@/models/CmsFaqItem";
import { CmsPublishingService } from "@/lib/services/cms-publishing.service";
import { CmsPreviewService } from "@/lib/services/cms-preview.service";

export interface ActionResult<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
}

/**
 * Saves or updates a CMS entry draft
 */
export async function saveCmsDraftAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireSession();

    const entryId = (formData.get("entryId") as string) || undefined;
    const contentType = formData.get("contentType") as any;
    const title = (formData.get("title") as string)?.trim();
    const slug = (formData.get("slug") as string)?.trim();
    const excerpt = (formData.get("excerpt") as string)?.trim() || undefined;
    const metaTitle = (formData.get("metaTitle") as string)?.trim() || undefined;
    const metaDescription = (formData.get("metaDescription") as string)?.trim() || undefined;
    const isNoIndex = formData.get("isNoIndex") === "true";
    const canonicalUrl = (formData.get("canonicalUrl") as string)?.trim() || undefined;
    const ogImage = (formData.get("ogImage") as string)?.trim() || undefined;
    const featuredMediaUrl = (formData.get("featuredMediaUrl") as string)?.trim() || undefined;

    let blocks = [];
    const blocksJson = formData.get("blocks") as string;
    if (blocksJson) {
      try {
        blocks = JSON.parse(blocksJson);
      } catch {
        blocks = [];
      }
    }

    if (!title || !slug || !contentType) {
      return { success: false, code: "VALIDATION_ERROR", message: "Title, slug, and content type are required." };
    }

    const entry = await CmsPublishingService.saveDraft({
      entryId,
      contentType,
      title,
      slug,
      excerpt,
      blocks,
      metaTitle,
      metaDescription,
      isNoIndex,
      canonicalUrl,
      ogImage,
      featuredMediaUrl,
      actorId: session.user.id,
      actorName: session.user.name,
      actorEmail: session.user.email,
      actorRole: session.user.role,
    });

    revalidatePath("/dashboard/content");
    revalidatePath(`/dashboard/content/editor/${entry._id}`);
    return { success: true, message: "Draft saved successfully.", data: { entryId: entry._id.toString() } };
  } catch (error: any) {
    return { success: false, code: "SAVE_ERROR", message: error.message || "Failed to save draft." };
  }
}

/**
 * Publishes a CMS entry
 */
export async function publishCmsAction(entryId: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const entry = await CmsPublishingService.publishEntry(
      entryId,
      session.user.id,
      session.user.name,
      session.user.email
    );

    revalidatePath("/dashboard/content");
    revalidatePath(`/dashboard/content/editor/${entryId}`);
    return { success: true, message: `Published version ${entry.publishedVersionNumber} successfully.` };
  } catch (error: any) {
    return { success: false, code: "PUBLISH_ERROR", message: error.message || "Failed to publish entry." };
  }
}

/**
 * Rolls back a CMS entry to a previous version snapshot
 */
export async function rollbackCmsVersionAction(entryId: string, targetVersion: number): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await CmsPublishingService.rollbackVersion(
      entryId,
      targetVersion,
      session.user.id,
      session.user.name
    );

    revalidatePath("/dashboard/content");
    revalidatePath(`/dashboard/content/editor/${entryId}`);
    return { success: true, message: `Rollback to version ${targetVersion} completed.` };
  } catch (error: any) {
    return { success: false, code: "ROLLBACK_ERROR", message: error.message || "Failed to rollback version." };
  }
}

/**
 * Generates a signed draft preview link
 */
export async function generatePreviewLinkAction(entryId: string): Promise<ActionResult> {
  try {
    await requireSession();
    const { previewUrl, expiresAt } = await CmsPreviewService.generatePreviewLink(entryId);

    return {
      success: true,
      message: "Preview link generated (valid for 2 hours).",
      data: { previewUrl, expiresAt: expiresAt.toISOString() },
    };
  } catch (error: any) {
    return { success: false, code: "PREVIEW_ERROR", message: error.message || "Failed to generate preview." };
  }
}

/**
 * Creates or updates a 301/302 redirect rule
 */
export async function createRedirectAction(sourcePath: string, destinationPath: string, redirectType: any = "301", reason: string = "Manual redirect"): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const normalizedSource = sourcePath.toLowerCase().trim();
    const normalizedDest = destinationPath.toLowerCase().trim();

    if (normalizedSource === normalizedDest) {
      return { success: false, code: "LOOP_ERROR", message: "Source and destination cannot be identical." };
    }

    const redirect = await RedirectRule.create({
      sourcePath: normalizedSource,
      destinationPath: normalizedDest,
      redirectType,
      reason: reason.trim(),
      createdBy: session.user.id,
      createdByName: session.user.name,
    });

    revalidatePath("/dashboard/content/redirects");
    return { success: true, message: "Redirect created successfully.", data: { redirectId: redirect._id.toString() } };
  } catch (error: any) {
    return { success: false, code: "REDIRECT_ERROR", message: error.message || "Failed to create redirect." };
  }
}

/**
 * Deletes a redirect rule
 */
export async function deleteRedirectAction(redirectId: string): Promise<ActionResult> {
  try {
    await requireSession();
    await connectToDatabase();

    await RedirectRule.findByIdAndDelete(redirectId);
    revalidatePath("/dashboard/content/redirects");
    return { success: true, message: "Redirect rule deleted." };
  } catch (error: any) {
    return { success: false, code: "DELETE_ERROR", message: error.message || "Failed to delete redirect." };
  }
}

/**
 * Creates or updates a testimonial
 */
export async function saveTestimonialAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const id = formData.get("id") as string;
    const clientName = (formData.get("clientName") as string)?.trim();
    const clientRoleOrCity = (formData.get("clientRoleOrCity") as string)?.trim();
    const testimonialText = (formData.get("testimonialText") as string)?.trim();
    const rating = Number(formData.get("rating")) || 5;
    const hasClientConsent = formData.get("hasClientConsent") === "true";
    const status = (formData.get("status") as any) || "APPROVED";

    if (!clientName || !testimonialText) {
      return { success: false, code: "VALIDATION_ERROR", message: "Client name and testimonial text are required." };
    }

    if (id) {
      await CmsTestimonial.findByIdAndUpdate(id, {
        clientName,
        clientRoleOrCity,
        testimonialText,
        rating,
        hasClientConsent,
        status,
        verifiedBy: session.user.name,
        verifiedAt: new Date(),
      });
    } else {
      await CmsTestimonial.create({
        clientName,
        clientRoleOrCity,
        testimonialText,
        rating,
        hasClientConsent,
        status,
        verifiedBy: session.user.name,
        verifiedAt: new Date(),
      });
    }

    revalidatePath("/dashboard/content/testimonials");
    revalidatePath("/testimonials");
    return { success: true, message: "Testimonial saved." };
  } catch (error: any) {
    return { success: false, code: "SAVE_ERROR", message: error.message || "Failed to save testimonial." };
  }
}

/**
 * Creates or updates a FAQ item
 */
export async function saveFaqAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const id = formData.get("id") as string;
    const category = formData.get("category") as any;
    const question = (formData.get("question") as string)?.trim();
    const answerHtml = (formData.get("answerHtml") as string)?.trim();
    const plainTextAnswer = (formData.get("plainTextAnswer") as string)?.trim() || answerHtml;
    const status = (formData.get("status") as any) || "PUBLISHED";

    if (!question || !answerHtml || !category) {
      return { success: false, code: "VALIDATION_ERROR", message: "Category, question, and answer are required." };
    }

    if (id) {
      await CmsFaqItem.findByIdAndUpdate(id, {
        category,
        question,
        answerHtml,
        plainTextAnswer,
        status,
        reviewedBy: session.user.name,
        reviewedAt: new Date(),
      });
    } else {
      await CmsFaqItem.create({
        category,
        question,
        answerHtml,
        plainTextAnswer,
        status,
        reviewedBy: session.user.name,
        reviewedAt: new Date(),
      });
    }

    revalidatePath("/dashboard/content/faqs");
    return { success: true, message: "FAQ saved." };
  } catch (error: any) {
    return { success: false, code: "SAVE_ERROR", message: error.message || "Failed to save FAQ." };
  }
}
