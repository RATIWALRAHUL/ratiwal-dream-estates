/**
 * GET /api/projects — Alias endpoint for GET /api/properties
 * 
 * Provides unified access to project listings (e.g. GET /api/projects?city=jaipur)
 * with caching, filtering, and pagination identical to /api/properties.
 */

import "server-only";
import { NextRequest } from "next/server";
import { GET as getPropertiesHandler } from "@/app/api/properties/route";

export async function GET(req: NextRequest) {
  return getPropertiesHandler(req);
}
