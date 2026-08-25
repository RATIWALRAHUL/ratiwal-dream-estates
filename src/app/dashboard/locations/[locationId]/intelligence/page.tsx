import "server-only";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Location } from "@/models/Location";
import { Property } from "@/models/Property";
import { requireAdminSession } from "@/lib/auth/guard";
import { LocationIntelligenceView } from "@/components/dashboard/locations/intelligence/LocationIntelligenceView";
import type { ILocation } from "@/types/database";

export const dynamic = "force-dynamic";

interface LocationIntelligencePageProps {
  params: Promise<{ locationId: string }>;
}

export default async function LocationIntelligencePage({ params }: LocationIntelligencePageProps) {
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

  const location: ILocation & { _id: string } = {
    ...JSON.parse(JSON.stringify(rawLocation)),
    _id: rawLocation._id.toString(),
  };

  return (
    <LocationIntelligenceView
      location={location}
      userRole={session.user.role}
    />
  );
}
