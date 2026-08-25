import "server-only";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/guard";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { MediaAsset } from "@/models/MediaAsset";
import PropertyMediaManager from "@/components/dashboard/properties/media/PropertyMediaManager";

export const dynamic = "force-dynamic";

interface PropertyMediaPageProps {
  params: Promise<{ propertyId: string }>;
}

export default async function PropertyMediaPage({ params }: PropertyMediaPageProps) {
  const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
  const { propertyId } = await params;

  await connectToDatabase();

  const property = await Property.findById(propertyId).select("title publicationStatus").lean();
  if (!property) notFound();

  const assets = await MediaAsset.find({
    ownerType: "PROPERTY",
    ownerId: property._id,
    assetCategory: "IMAGE",
    status: { $nin: ["DELETED"] },
  })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  const serializedAssets = assets.map((a) => ({
    id: a._id.toString(),
    assetCategory: a.assetCategory,
    purpose: a.purpose,
    access: a.access,
    status: a.status,
    safeDisplayName: a.safeDisplayName,
    originalFilename: a.originalFilename,
    mimeType: a.mimeType,
    sizeBytes: a.sizeBytes,
    width: a.width,
    height: a.height,
    publicUrl: a.publicUrl,
    altText: a.altText,
    caption: a.caption,
    sortOrder: a.sortOrder,
    isPrimary: a.isPrimary,
    uploadedByEmail: a.uploadedByEmail,
    uploadedAt: a.uploadedAt?.toISOString(),
    rejectionReason: a.rejectionReason,
  }));

  return (
    <Suspense>
      <PropertyMediaManager
        propertyId={propertyId}
        propertyTitle={(property.title as string) ?? "Property"}
        initialAssets={serializedAssets}
        userRole={session.user.role}
      />
    </Suspense>
  );
}
