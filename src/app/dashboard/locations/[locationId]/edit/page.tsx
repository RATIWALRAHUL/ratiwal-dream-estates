import "server-only";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Location } from "@/models/Location";
import { Property } from "@/models/Property";
import { requireAdminSession } from "@/lib/auth/guard";
import { LocationEditor } from "@/components/dashboard/locations/editor/LocationEditor";
import type { ILocation } from "@/types/database";

export const dynamic = "force-dynamic";

interface EditLocationPageProps {
  params: Promise<{ locationId: string }>;
}

export default async function EditLocationPage({ params }: EditLocationPageProps) {
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

  // Count connected properties
  const propertyCount = await Property.countDocuments({
    locationId: new Types.ObjectId(locationId),
  });

  // Serialize Mongoose document to clean JSON
  const location: ILocation & { _id: string } = {
    ...JSON.parse(JSON.stringify(rawLocation)),
    _id: rawLocation._id.toString(),
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <LocationEditor
        initialData={location}
        userRole={session.user.role}
        propertyCount={propertyCount}
      />
    </div>
  );
}
