import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { InventoryImportService } from "@/lib/services/inventory-import.service";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templateContent = InventoryImportService.generateCsvTemplate();
    const filename = `ratiwal_inventory_template_v1.0.csv`;

    return new NextResponse(templateContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate CSV template." }, { status: 500 });
  }
}
