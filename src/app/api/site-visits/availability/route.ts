import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { generateAvailableSlots } from "@/lib/services/site-visit-scheduling.service";
import { checkRateLimit } from "@/lib/rate-limit";
import { Types } from "mongoose";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const meetingMode = searchParams.get("meetingMode") || undefined;

    if (!propertyId || !Types.ObjectId.isValid(propertyId)) {
      return NextResponse.json(
        { success: false, error: "Valid propertyId query parameter is required." },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "startDate and endDate query parameters (YYYY-MM-DD) are required." },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientIp = getClientIp(req);
    const rl = checkRateLimit(`sv-avail:${clientIp}`, 120, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again in a moment." },
        { status: 429 }
      );
    }

    const slots = await generateAvailableSlots({
      propertyId,
      startDate,
      endDate,
      meetingMode,
    });

    return NextResponse.json({
      success: true,
      data: {
        slots,
        timezone: "Asia/Kolkata",
        message: "Slots are subject to advisor and property confirmation.",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to generate availability slots." },
      { status: 500 }
    );
  }
}
