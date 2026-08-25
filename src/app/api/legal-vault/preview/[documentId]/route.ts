import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { getAdminSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { LegalDocument } from "@/models/LegalDocument";
import { LegalDocumentVersion } from "@/models/LegalDocumentVersion";
import { LegalDocumentAccessLog } from "@/models/LegalDocumentAccessLog";
import { getStorageProvider } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await params;
    await connectToDatabase();

    const doc = await LegalDocument.findById(documentId);
    if (!doc || doc.status === "ARCHIVED" || doc.status === "QUARANTINED") {
      return NextResponse.json({ error: "Document not accessible or archived" }, { status: 404 });
    }

    if (!doc.currentVersionId) {
      return NextResponse.json({ error: "No uploaded file version exists" }, { status: 404 });
    }

    const version = await LegalDocumentVersion.findById(doc.currentVersionId);
    if (!version) {
      return NextResponse.json({ error: "File version not found" }, { status: 404 });
    }

    // Role check: ADVISOR can only preview PUBLIC_APPROVED or non-restricted documents
    if (session.user.role === "EDITOR" && doc.classification === "RESTRICTED") {
      return NextResponse.json({ error: "Access denied to restricted document" }, { status: 403 });
    }

    const provider = getStorageProvider();
    const download = await provider.createPrivateDownload({
      assetId: version._id.toString(),
      providerKey: version.providerKey,
      ttlSeconds: 900,
    });

    await LegalDocumentAccessLog.create({
      legalDocumentId: doc._id,
      documentVersionId: version._id,
      propertyId: doc.propertyId,
      actorType: "INTERNAL_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorRole: session.user.role,
      action: "PREVIEW_REQUESTED",
      accessResult: "GRANTED",
    });

    return NextResponse.json({
      success: true,
      previewUrl: download.signedUrl,
      filename: version.sanitizedOriginalFilename,
      mimeType: version.mimeType,
      fileSize: version.fileSize,
      classification: doc.classification,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate preview." }, { status: 500 });
  }
}
