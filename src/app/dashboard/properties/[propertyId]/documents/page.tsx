import "server-only";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/guard";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { MediaAsset } from "@/models/MediaAsset";
import PropertyDocumentManager from "@/components/dashboard/properties/documents/PropertyDocumentManager";

export const dynamic = "force-dynamic";

interface PropertyDocumentsPageProps {
  params: Promise<{ propertyId: string }>;
}

export default async function PropertyDocumentsPage({ params }: PropertyDocumentsPageProps) {
  const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
  const { propertyId } = await params;

  await connectToDatabase();

  const property = await Property.findById(propertyId).select("title publicationStatus").lean();
  if (!property) notFound();

  const documents = await MediaAsset.find({
    ownerType: "PROPERTY",
    ownerId: property._id,
    assetCategory: "DOCUMENT",
    status: { $nin: ["DELETED"] },
  })
    .sort({ createdAt: -1 })
    .lean();

  const serializedDocuments = documents.map((d) => ({
    id: d._id.toString(),
    purpose: d.purpose as "BROCHURE" | "MASTERPLAN" | "RERA_CERTIFICATE" | "TITLE_DOCUMENT" | "APPROVAL" | "PRICE_SHEET" | "OTHER",
    access: d.access as "PUBLIC" | "PRIVATE" | "INTERNAL",
    status: d.status as "PENDING" | "UPLOADING" | "PROCESSING" | "READY" | "REJECTED" | "QUARANTINED" | "DELETED",
    safeDisplayName: d.safeDisplayName,
    originalFilename: d.originalFilename,
    mimeType: d.mimeType,
    sizeBytes: d.sizeBytes,
    documentTitle: d.documentTitle,
    documentVersion: d.documentVersion,
    uploadedByEmail: d.uploadedByEmail,
    uploadedAt: d.uploadedAt?.toISOString(),
    rejectionReason: d.rejectionReason,
    verifiedBy: d.verifiedBy,
  }));

  return (
    <PropertyDocumentManager
      propertyId={propertyId}
      propertyTitle={(property.title as string) ?? "Property"}
      initialDocuments={serializedDocuments}
      userRole={session.user.role}
    />
  );
}
