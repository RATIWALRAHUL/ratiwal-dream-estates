import "server-only";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/guard";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Location } from "@/models/Location";
import { MediaAsset } from "@/models/MediaAsset";
import LocationMediaManager from "@/components/dashboard/locations/media/LocationMediaManager";

export const dynamic = "force-dynamic";

interface LocationMediaPageProps {
  params: Promise<{ locationId: string }>;
}

export default async function LocationMediaPage({ params }: LocationMediaPageProps) {
  const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
  const { locationId } = await params;

  await connectToDatabase();

  const location = await Location.findById(locationId).select("name city publicationStatus").lean();
  if (!location) notFound();

  const assets = await MediaAsset.find({
    ownerType: "LOCATION",
    ownerId: location._id,
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
      <LocationMediaManager
        locationId={locationId}
        locationName={`${location.name} · ${location.city}`}
        initialAssets={serializedAssets}
        userRole={session.user.role}
      />
    </Suspense>
  );
}
