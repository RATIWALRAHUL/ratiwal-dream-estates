import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getDashboardOverview } from "@/lib/services/dashboard.service";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || !session.user.isActive) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Active administrator session required." },
        { status: 401 }
      );
    }

    const overview = await getDashboardOverview();

    return NextResponse.json(
      {
        success: true,
        summary: overview.metrics,
        inventoryBreakdown: overview.inventoryBreakdown,
        alerts: overview.verificationAlerts,
        recentProperties: overview.recentProperties,
        locationCoverage: overview.locationCoverage,
        generatedAt: overview.lastRefreshedAt,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("[DASHBOARD_OVERVIEW_API] Failed to fetch overview metrics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard overview data." },
      { status: 500 }
    );
  }
}
