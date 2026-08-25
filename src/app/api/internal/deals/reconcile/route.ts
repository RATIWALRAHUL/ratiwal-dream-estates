import { NextResponse } from "next/server";
import { DealReconciliationService } from "@/lib/services/deal-reconciliation.service";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET || "ratiwal-cron-secret-2026";

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const report = await DealReconciliationService.scanConsistency();

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    logger.error("[API] Deal reconciliation job failed", { error: error?.message });
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
