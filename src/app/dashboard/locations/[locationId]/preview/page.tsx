import "server-only";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Location } from "@/models/Location";
import { Property } from "@/models/Property";
import { requireAdminSession } from "@/lib/auth/guard";
import { LocationPreview } from "@/components/dashboard/locations/LocationPreview";
import type { ILocation } from "@/types/database";

export const dynamic = "force-dynamic";

interface PreviewLocationPageProps {
  params: Promise<{ locationId: string }>;
}

export default async function PreviewLocationPage({ params }: PreviewLocationPageProps) {
  const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
  const { locationId } = await params;

  if (!Types.ObjectId.isValid(locationId)) {
    notFound();
  }

  await connectToDatabase();
  const rawLocation = await Location.findById(locationId).lean();

  if (!rawLocation) {
    notFound();
  }

  // Load connected properties for realistic preview
  const properties = await Property.find({
    locationId: new Types.ObjectId(locationId),
    publicationStatus: "PUBLISHED",
  })
    .select("title slug shortDescription pricing area heroImage media listingStatus")
    .limit(6)
    .lean();

  const location: ILocation & { _id: string } = {
    ...JSON.parse(JSON.stringify(rawLocation)),
    _id: rawLocation._id.toString(),
  };

  return (
    <LocationPreview
      location={location}
      properties={JSON.parse(JSON.stringify(properties))}
      userRole={session.user.role}
    />
  );
}
