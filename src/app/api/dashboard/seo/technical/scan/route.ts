import { NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/auth/guard";
import { successResponse, errorResponse } from "@/lib/api/response";
import { RateLimitError } from "@/lib/api/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin } from "@/lib/seo-analytics/request-guards";
import { SeoTechnicalService } from "@/lib/services/seo-technical.service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/dashboard/seo/technical/scan  (SUPER_ADMIN only)
 * Takes NO parameters: the scan target is always the configured production site,
 * never a value from the request (SSRF prevention). The scanner only reads.
 */
export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const session = await requireAdminSession(["SUPER_ADMIN"]);

    const rl = checkRateLimit(`seo-tech-scan:${session.user.id}`, 3, 60 * 60 * 1000);
    if (!rl.allowed) {
      throw new RateLimitError("Scans are limited to 3 per hour. Please try again later.");
    }

    const summary = await SeoTechnicalService.runScan({ actor: session.user, trigger: "MANUAL" });
    return successResponse(summary);
  } catch (error) {
    return errorResponse(error);
  }
}
