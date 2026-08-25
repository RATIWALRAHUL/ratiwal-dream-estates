import "server-only";

import { Types } from "mongoose";
import { Property } from "@/models/Property";
export * from "@/lib/utils/location-intelligence";

/**
 * Check location dependencies before archival
 */
export async function checkLocationDependencies(locationId: string): Promise<{
  canArchive: boolean;
  totalProperties: number;
  publishedProperties: number;
  publishedPropertyTitles: string[];
}> {
  const objectId = new Types.ObjectId(locationId);

  const [totalCount, publishedProps] = await Promise.all([
    Property.countDocuments({ locationId: objectId }),
    Property.find({ locationId: objectId, publicationStatus: "PUBLISHED" })
      .select("title slug")
      .lean(),
  ]);

  return {
    canArchive: publishedProps.length === 0,
    totalProperties: totalCount,
    publishedProperties: publishedProps.length,
    publishedPropertyTitles: publishedProps.map((p) => p.title),
  };
}
