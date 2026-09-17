import { NextResponse } from "next/server";
import { HoldService } from "@/lib/services/hold.service";
import { logger } from "@/lib/logger";

import { getErrorMessage } from "@/lib/api/errors";
export const dynamic = "force-dynamic";

/**
 * Durable worker endpoint for expiring elapsed inventory holds
 * Protected by CRON_SECRET or ADMIN authentication
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const result = await HoldService.processExpiredHolds(100);

    return NextResponse.json({
      success: true,
      processed: result.processedCount,
      expiredHoldIds: result.expiredHoldIds,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("[API] Hold expiration job failed", { error: getErrorMessage(error) });
    return NextResponse.json(
      { success: false, error: getErrorMessage(error, "Internal server error") },
      { status: 500 }
    );
  }
}
