import { NextRequest, NextResponse } from "next/server";
import { PaymentReconciliationService } from "@/lib/services/payment-reconciliation.service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret = process.env.CRON_SECRET || "internal-cron-secret-key-2026";
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "UNAUTHORIZED: Invalid cron secret." }, { status: 401 });
    }

    const result = await PaymentReconciliationService.runReconciliation();

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Reconciliation failed" },
      { status: 500 }
    );
  }
}
