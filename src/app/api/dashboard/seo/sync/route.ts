import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guard";
import { successResponse, errorResponse } from "@/lib/api/response";
import { RateLimitError } from "@/lib/api/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin } from "@/lib/seo-analytics/request-guards";
import { SeoGscSyncService, MAX_SYNC_DAYS } from "@/lib/services/seo-gsc-sync.service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const bodySchema = z.object({
  mode: z.enum(["verify", "sync"]),
  days: z.number().int().min(1).max(MAX_SYNC_DAYS).optional(),
});

/**
 * POST /api/dashboard/seo/sync  (SUPER_ADMIN only)
 *   { "mode": "verify" }            → one small authenticated request to Search Console
 *   { "mode": "sync", "days": 7 }   → idempotent sync of the last N days (1–90)
 */
export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const session = await requireAdminSession(["SUPER_ADMIN"]);

    const rl = checkRateLimit(`seo-sync:${session.user.id}`, 6, 10 * 60 * 1000);
    if (!rl.allowed) {
      throw new RateLimitError("Too many sync requests. Please wait a few minutes.");
    }

    const body = bodySchema.parse(await request.json());

    if (body.mode === "verify") {
      const result = await SeoGscSyncService.verifyConnection(session.user);
      return successResponse(result);
    }

    const summary = await SeoGscSyncService.runSync({
      days: body.days,
      trigger: "MANUAL",
      actor: session.user,
    });
    return successResponse(summary);
  } catch (error) {
    return errorResponse(error);
  }
}
