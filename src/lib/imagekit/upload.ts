import "server-only";
import { getImageKitClient } from "./client";
import { InternalServerError, ValidationError, getErrorMessage } from "@/lib/api/errors";

export interface UploadOptions {
  file: string | Buffer; // Base64 string or Buffer
  fileName: string;
  folder?: string;
  tags?: string[];
  isPrivateFile?: boolean;
  useUniqueFileName?: boolean;
  customMetadata?: Record<string, string | number | boolean>;
}

export interface UploadResult {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  height?: number;
  width?: number;
  size: number;
  fileType: string;
  filePath: string;
}

/**
 * Uploads a file (base64 string, URL, or Buffer) to ImageKit.
 */
export async function uploadToImageKit(options: UploadOptions): Promise<UploadResult> {
  const ik = getImageKitClient();

  try {
    const uploadPayload: {
      file: string | Buffer;
      fileName: string;
      folder?: string;
      tags?: string[];
      isPrivateFile?: boolean;
      useUniqueFileName?: boolean;
      customMetadata?: Record<string, string | number | boolean>;
    } = {
      file: options.file,
      fileName: options.fileName,
      folder: options.folder || "/ratiwal/properties",
      tags: options.tags || ["ratiwal", "real-estate"],
      useUniqueFileName: options.useUniqueFileName !== false,
      isPrivateFile: options.isPrivateFile || false,
    };

    if (options.customMetadata) {
      uploadPayload.customMetadata = options.customMetadata;
    }

    const response = await ik.upload(uploadPayload);

    return {
      fileId: response.fileId,
      name: response.name,
      url: response.url,
      thumbnailUrl: response.thumbnailUrl,
      height: response.height,
      width: response.width,
      size: response.size,
      fileType: response.fileType,
      filePath: response.filePath,
    };
  } catch (error) {
    const errorMsg = getErrorMessage(error, "Failed to upload file to ImageKit");
    throw new InternalServerError(`ImageKit upload failed: ${errorMsg}`);
  }
}

/**
 * Deletes a file from ImageKit by fileId.
 */
export async function deleteFromImageKit(fileId: string): Promise<boolean> {
  const ik = getImageKitClient();

  if (!fileId || typeof fileId !== "string") {
    throw new ValidationError("Invalid fileId provided for deletion", {
      fileId: ["fileId is required"],
    });
  }

  try {
    await ik.deleteFile(fileId);
    return true;
  } catch (error) {
    // If file already deleted, treat as success. ImageKit SDK errors carry a
    // non-standard `.help` field alongside `.message`.
    const helpText = typeof error === "object" && error !== null && "help" in error ? String((error as { help?: unknown }).help) : "";
    if (getErrorMessage(error).includes("not found") || helpText.includes("not found")) {
      return true;
    }
    throw new InternalServerError(`ImageKit deletion failed: ${getErrorMessage(error, "Unknown error")}`);
  }
}

/**
 * Retrieves file details from ImageKit.
 */
export async function getFileDetails(fileId: string) {
  const ik = getImageKitClient();

  try {
    return await ik.getFileDetails(fileId);
  } catch (error) {
    throw new InternalServerError(`ImageKit getFileDetails failed: ${getErrorMessage(error, "Unknown error")}`);
  }
}

