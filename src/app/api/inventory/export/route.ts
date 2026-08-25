import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { InventoryService } from "@/lib/services/inventory.service";
import { InventoryImportService } from "@/lib/services/inventory-import.service";
import { logAuditEvent } from "@/lib/services/audit.service";
import { checkRateLimit } from "@/lib/rate-limit";
import { InventoryFilterParams } from "@/types/inventory";

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit(`inventory-export:${session.user.id}`, 10, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Export rate limit exceeded. Please wait a minute." }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const filterParams: InventoryFilterParams = {
      propertyId: searchParams.get("propertyId") || undefined,
      phaseName: searchParams.get("phaseName") || undefined,
      towerBlockSector: searchParams.get("towerBlockSector") || undefined,
      floorLevel: searchParams.get("floorLevel") || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      category: (searchParams.get("category") as any) || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: (searchParams.get("status") as any) || undefined,
      search: searchParams.get("search") || undefined,
      page: 1,
      perPage: 1000, // Maximum 1,000 units per synchronous export
    };

    const result = await InventoryService.queryUnits(filterParams, session);

    const headers = [
      "Reference Code",
      "Property",
      "Unit / Plot Number",
      "Category",
      "Configuration",
      "Phase / Sector",
      "Tower / Block",
      "Floor",
      "Area (Sq Ft)",
      "Area (Sq Yd)",
      "Base Price (INR)",
      "Display Price (INR)",
      "Status",
      "Visibility",
      "Facing",
      "Corner Unit",
      "Price On Request",
      "Last Updated",
    ];

    const rowLines = result.units.map((u) => {
      const row = [
        u.referenceCode,
        u.propertyName || "",
        u.unitNumber,
        u.unitCategory,
        u.configuration,
        u.phaseName || "",
        u.towerBlockSector || "",
        u.floorLevel || "",
        u.areaSqFt,
        u.areaSqYd || "",
        u.basePriceRupees ?? "",
        u.displayPriceRupees ?? "",
        u.status,
        u.visibility,
        u.facing || "",
        u.cornerUnit ? "TRUE" : "FALSE",
        u.priceOnRequest ? "TRUE" : "FALSE",
        u.updatedAt,
      ];
      return row.map((c) => InventoryImportService.sanitizeCsvCell(c)).join(",");
    });

    const csvContent = `\uFEFF${headers.map((h) => InventoryImportService.sanitizeCsvCell(h)).join(",")}\r\n${rowLines.join("\r\n")}`;
    const filename = `ratiwal_inventory_${new Date().toISOString().slice(0, 10)}.csv`;

    await logAuditEvent({
      actor: session.user,
      action: "INVENTORY_EXPORT_PERFORMED",
      reason: `Exported ${result.units.length} inventory units to CSV`,
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
    return NextResponse.json({ error: "Failed to generate inventory export." }, { status: 500 });
  }
}
