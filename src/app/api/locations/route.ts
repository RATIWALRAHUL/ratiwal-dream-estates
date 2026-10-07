/**
 * GET /api/locations — Public, read-only list of published locations.
 * Backs location dropdowns on the marketing site (e.g. EnquiryForm's
 * "Preferred Location" select), so it only exposes PUBLISHED, non-archived
 * entries and the minimal fields a dropdown needs.
 */
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Location } from "@/models/Location";
import { checkRateLimit } from "@/lib/rate-limit";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`locations-list:${clientIp}`, 60, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again in a moment." },
        { status: 429 }
      );
    }

    await connectToDatabase();

    const locations = await Location.find(
      {
        publicationStatus: "PUBLISHED",
        $or: [{ archivedAt: null }, { archivedAt: { $exists: false } }],
      },
      { name: 1, city: 1, state: 1, region: 1, slug: 1 }
    )
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        locations: locations.map((loc) => ({
          id: loc._id.toString(),
          name: loc.name,
          city: loc.city,
          state: loc.state,
          region: loc.region,
          slug: loc.slug,
        })),
      },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load locations." },
      { status: 500 }
    );
  }
}
