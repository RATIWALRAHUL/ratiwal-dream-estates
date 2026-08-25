import { NextRequest, NextResponse } from "next/server";
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

    if (session.user.role === "EDITOR" && doc.classification === "RESTRICTED") {
      return NextResponse.json({ error: "Access denied to restricted document" }, { status: 403 });
    }

    const provider = getStorageProvider();
    const download = await provider.createPrivateDownload({
      assetId: version._id.toString(),
      providerKey: version.providerKey,
      ttlSeconds: 300,
    });

    await LegalDocumentAccessLog.create({
      legalDocumentId: doc._id,
      documentVersionId: version._id,
      propertyId: doc.propertyId,
      actorType: "INTERNAL_USER",
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorRole: session.user.role,
      action: "DOWNLOAD_REQUESTED",
      accessResult: "GRANTED",
    });

    return NextResponse.redirect(download.signedUrl, {
      headers: {
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to download document." }, { status: 500 });
  }
}
