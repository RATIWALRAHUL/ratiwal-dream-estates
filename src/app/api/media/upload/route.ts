import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { uploadToImageKit } from "@/lib/imagekit/upload";
import { successResponse, errorResponse } from "@/lib/api/response";
import { AuthenticationError, ValidationError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

// Allowed MIME types for real estate assets
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "application/pdf",
]);

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_DOC_SIZE_BYTES = 30 * 1024 * 1024; // 30MB

/**
 * POST /api/media/upload
 * Secure administrative media upload handler for properties, locations, and documents.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || !session.user.isActive) {
      throw new AuthenticationError("Admin session required to upload media");
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "/ratiwal/properties";
    const customName = (formData.get("fileName") as string) || "";
    const tagsRaw = (formData.get("tags") as string) || "";

    if (!file) {
      throw new ValidationError("No file provided in form data", {
        file: ["File is required"],
      });
    }

    // MIME type validation
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new ValidationError(`Unsupported file type: "${file.type}". Allowed types: JPEG, PNG, WEBP, AVIF, SVG, PDF`, {
        file: ["Unsupported file format"],
      });
    }

    // Size limit check
    const isDoc = file.type === "application/pdf";
    const maxSize = isDoc ? MAX_DOC_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
    if (file.size > maxSize) {
      throw new ValidationError(
        `File exceeds maximum permitted size of ${Math.round(maxSize / (1024 * 1024))}MB`,
        { file: [`Maximum allowed size is ${Math.round(maxSize / (1024 * 1024))}MB`] }
      );
    }

    // Convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize filename
    const sanitizedFileName = (customName || file.name)
      .replace(/[^a-zA-Z0-9_.-]/g, "_")
      .toLowerCase();

    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : ["ratiwal", "property"];

    const result = await uploadToImageKit({
      file: buffer,
      fileName: sanitizedFileName,
      folder,
      tags,
    });

    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error);
  }
}
