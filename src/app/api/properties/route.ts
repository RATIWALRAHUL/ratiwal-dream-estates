/**
 * GET /api/properties — Public High-Performance Property Catalog API
 * 
 * Supports:
 * - Deterministic caching with SWR headers (s-maxage=60, stale-while-revalidate=300)
 * - Server-side indexed filters (city, propertyType, featured, search)
 * - Pagination (page, limit) and cursor-ready response contract
 * - Lean DTO projection: only fields necessary for cards and listings
 */

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getAllProperties } from "@/lib/data/properties";
import { checkRateLimit } from "@/lib/rate-limit";
import { fastCache } from "@/lib/cache/data-cache";

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
    const rl = checkRateLimit(`properties-api:${clientIp}`, 120, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || "";
    const type = searchParams.get("type") || "";
    const search = searchParams.get("search") || "";
    const featuredOnly = searchParams.get("featured") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));

    const cacheKey = fastCache.normalizeKey("api:properties", {
      city,
      type,
      search,
      featured: featuredOnly ? "1" : "0",
      page,
      limit,
    });

    const result = await fastCache.getOrSet(
      cacheKey,
      async () => {
        const all = await getAllProperties();

        let filtered = all.filter((p) => {
          if (featuredOnly && !p.featured) return false;
          if (city && city.toLowerCase() !== "all" && p.city.toLowerCase() !== city.toLowerCase()) return false;
          if (type && type.toLowerCase() !== "all" && p.propertyType.toLowerCase() !== type.toLowerCase()) return false;
          if (search) {
            const q = search.toLowerCase();
            const matchName = p.name.toLowerCase().includes(q);
            const matchLoc = p.location.toLowerCase().includes(q);
            const matchCity = p.city.toLowerCase().includes(q);
            const matchDesc = p.shortDescription.toLowerCase().includes(q);
            if (!matchName && !matchLoc && !matchCity && !matchDesc) return false;
          }
          return true;
        });

        const total = filtered.length;
        const startIndex = (page - 1) * limit;
        const paginated = filtered.slice(startIndex, startIndex + limit);
        const hasNext = startIndex + limit < total;

        // Lean DTO mapping
        const data = paginated.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          location: p.location,
          city: p.city,
          state: p.state,
          propertyType: p.propertyType,
          plotSizes: p.plotSizes,
          priceLabel: p.priceLabel,
          featured: p.featured,
          status: p.status,
          thumbnail: p.images[0] || null,
          shortDescription: p.shortDescription,
        }));

        return {
          data,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext,
            nextCursor: hasNext ? String(page + 1) : null,
          },
        };
      },
      { ttlMs: 60 * 1000, swrMs: 300 * 1000 }
    );

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "CDN-Cache-Control": "max-age=300",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to retrieve properties." },
      { status: 500 }
    );
  }
}
