import { NextRequest, NextResponse } from "next/server";
import { NotificationProcessorService } from "@/lib/communications/services/processor.service";

/**
 * Internal cron/worker batch processing endpoint.
 * Protected by CRON_SECRET Bearer header.
 */
export async function GET(request: NextRequest) {
  return handleProcess(request);
}

export async function POST(request: NextRequest) {
  return handleProcess(request);
}

async function handleProcess(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("Authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized worker request" },
      { status: 401 }
    );
  }

  try {
    const result = await NotificationProcessorService.processBatch(25);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: result,
    });
  } catch (err) {
    console.error("[InternalCronProcessor] Execution error:", err);
    return NextResponse.json(
      { success: false, error: "Worker processing error" },
      { status: 500 }
    );
  }
}
