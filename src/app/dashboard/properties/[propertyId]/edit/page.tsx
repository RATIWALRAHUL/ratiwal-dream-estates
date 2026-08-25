import "server-only";
import { requireAdminSession } from "@/lib/auth/guard";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Location } from "@/models/Location";
import { getPropertyForEditor } from "@/lib/services/property-editor.service";
import { PropertyEditor } from "@/components/dashboard/properties/editor/PropertyEditor";

export const dynamic = "force-dynamic";

interface EditPropertyPageProps {
  params: Promise<{ propertyId: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
  const { propertyId } = await params;

  await connectToDatabase();

  const [property, locations] = await Promise.all([
    getPropertyForEditor(propertyId),
    Location.find({ publicationStatus: { $ne: "ARCHIVED" } })
      .select("name city state publicationStatus")
      .sort({ name: 1 })
      .lean(),
  ]);

  const serializableLocations = locations.map((loc) => ({
    id: loc._id.toString(),
    name: loc.name,
    city: loc.city,
    state: loc.state,
    publicationStatus: loc.publicationStatus,
  }));

  return (
    <PropertyEditor
      initialProperty={property}
      locations={serializableLocations}
      userRole={session.user.role}
    />
  );
}
