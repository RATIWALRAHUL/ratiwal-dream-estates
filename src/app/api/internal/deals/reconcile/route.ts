import { NextResponse } from "next/server";
import { DealReconciliationService } from "@/lib/services/deal-reconciliation.service";
import { logger } from "@/lib/logger";

import { getErrorMessage } from "@/lib/api/errors";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const report = await DealReconciliationService.scanConsistency();

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    logger.error("[API] Deal reconciliation job failed", { error: getErrorMessage(error) });
    return NextResponse.json(
      { success: false, error: getErrorMessage(error, "Internal server error") },
      { status: 500 }
    );
  }
}
