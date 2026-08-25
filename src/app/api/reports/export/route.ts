import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { ReportExportService, REPORT_COLUMN_CATALOG } from "@/lib/services/report-export.service";
import { ReportType } from "@/types/analytics";
import { logAuditEvent } from "@/lib/services/audit.service";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit(`report-export:${session.user.id}`, 10, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Export rate limit exceeded. Please wait a minute." }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = (searchParams.get("type") || "INQUIRY_REPORT") as ReportType;

    const columns = REPORT_COLUMN_CATALOG[reportType];
    if (!columns) {
      return NextResponse.json({ error: "Invalid report type specified." }, { status: 400 });
    }

    // Fetch maximum 1000 rows for bounded synchronous export
    const result = await ReportExportService.executeReport(reportType, 1, 1000, session);
    const csvContent = ReportExportService.generateCsvContent(columns, result.rows);

    const filename = `ratiwal_${reportType.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;

    await logAuditEvent({
      actor: session.user,
      action: "REPORT_EXPORTED",
      reason: `Exported ${reportType} (${result.rows.length} rows)`,
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate CSV export." }, { status: 500 });
  }
}
