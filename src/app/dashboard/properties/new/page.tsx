import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Location } from "@/models/Location";
import { requireAdminSession } from "@/lib/auth/guard";
import { NewPropertyForm } from "@/components/dashboard/properties/NewPropertyForm";

export const dynamic = "force-dynamic";

export default async function NewPropertyPage() {
  await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
  await connectToDatabase();

  const locations = await Location.find({ publicationStatus: { $ne: "ARCHIVED" } })
    .select("name city state")
    .sort({ name: 1 })
    .lean();

  const serializableLocations = locations.map((loc) => ({
    id: loc._id.toString(),
    name: loc.name,
    city: loc.city,
    state: loc.state,
  }));

  return <NewPropertyForm locations={serializableLocations} />;
}
