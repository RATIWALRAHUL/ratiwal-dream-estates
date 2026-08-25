import { NextResponse } from "next/server";
import { HoldService } from "@/lib/services/hold.service";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Durable worker endpoint for expiring elapsed inventory holds
 * Protected by CRON_SECRET or ADMIN authentication
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET || "ratiwal-cron-secret-2026";

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const result = await HoldService.processExpiredHolds(100);

    return NextResponse.json({
      success: true,
      processed: result.processedCount,
      expiredHoldIds: result.expiredHoldIds,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("[API] Hold expiration job failed", { error: error?.message });
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
