/**
 * @file inventory-import.service.ts
 * @description Bulk CSV import validation, preview, duplicate detection, batch execution,
 * and formula-injection-safe CSV export for PRD 11 Inventory.
 */

import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InventoryUnit } from "@/models/InventoryUnit";
import { InventoryImportJob, IRowValidationError, ImportMode } from "@/models/InventoryImportJob";
import { InventoryService } from "@/lib/services/inventory.service";
import { Property } from "@/models/Property";
import { AdminSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";
import {
  UnitCategory,
  UNIT_CATEGORIES,
  UnitConfiguration,
  UNIT_CONFIGURATIONS,
  UnitStatus,
  UNIT_STATUSES,
  UnitVisibility,
  UNIT_VISIBILITIES,
} from "@/types/inventory";

export interface ParsedCsvRow {
  rowNumber: number;
  phaseName?: string;
  towerBlockSector?: string;
  floorLevel?: string;
  unitNumber: string;
  unitCategory: UnitCategory;
  configuration: UnitConfiguration;
  areaSqFt: number;
  basePriceRupees?: number;
  status: UnitStatus;
  visibility: UnitVisibility;
  bedrooms?: number;
  bathrooms?: number;
  facing?: string;
  cornerUnit?: boolean;
  priceOnRequest?: boolean;
  internalNotes?: string;
}

export class InventoryImportService {
  /**
   * Escape spreadsheet formula prefixes (=, +, -, @, \t, \r, %) to prevent CSV Injection attacks.
   */
  public static sanitizeCsvCell(value: unknown): string {
    if (value === null || value === undefined) return "";
    let rawStr = String(value);

    // Escape formula triggers
    if (/^[=+\-@\t\r%]/.test(rawStr)) {
      rawStr = `'${rawStr.replace(/^[\t\r]+/, "")}`;
    }

    let str = rawStr.trim();
    if (/^[=+\-@%]/.test(str) && !str.startsWith("'")) {
      str = `'${str}`;
    }

    // Escape double quotes and enclose if needed
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      str = `"${str.replace(/"/g, '""')}"`;
    }

    return str;
  }

  /**
   * Generate downloadable standard CSV template with instructions header
   */
  public static generateCsvTemplate(): string {
    const headers = [
      "unitNumber",
      "phaseName",
      "towerBlockSector",
      "floorLevel",
      "unitCategory",
      "configuration",
      "areaSqFt",
      "basePriceRupees",
      "status",
      "visibility",
      "bedrooms",
      "bathrooms",
      "facing",
      "cornerUnit",
      "priceOnRequest",
      "internalNotes",
    ];

    const sampleRow1 = [
      "A-101",
      "Phase 1",
      "Tower A",
      "1st Floor",
      "APARTMENT",
      "3BHK",
      "1450",
      "8500000",
      "AVAILABLE",
      "PUBLIC_DETAIL",
      "3",
      "3",
      "NORTH_EAST",
      "TRUE",
      "FALSE",
      "Park facing premium unit",
    ];

    const sampleRow2 = [
      "PL-42",
      "Sector 4",
      "Block B",
      "",
      "RESIDENTIAL_PLOT",
      "PLOT",
      "2250",
      "6500000",
      "AVAILABLE",
      "PUBLIC_DETAIL",
      "",
      "",
      "EAST",
      "FALSE",
      "FALSE",
      "JDA Patta approved villa plot",
    ];

    const lines = [
      headers.join(","),
      sampleRow1.map((c) => this.sanitizeCsvCell(c)).join(","),
      sampleRow2.map((c) => this.sanitizeCsvCell(c)).join(","),
    ];

    return `\uFEFF${lines.join("\r\n")}`;
  }

  /**
   * Parse CSV content into structured rows with strict format checking
   */
  public static parseCsv(csvText: string): string[][] {
    const lines = csvText.split(/\r\n|\n|\r/);
    const rows: string[][] = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      // Simple CSV line parser taking quotes into account
      const cells: string[] = [];
      let insideQuote = false;
      let cellBuffer = "";

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (insideQuote && line[i + 1] === '"') {
            cellBuffer += '"';
            i++;
          } else {
            insideQuote = !insideQuote;
          }
        } else if (char === "," && !insideQuote) {
          cells.push(cellBuffer.trim());
          cellBuffer = "";
        } else {
          cellBuffer += char;
        }
      }
      cells.push(cellBuffer.trim());
      rows.push(cells);
    }

    return rows;
  }

  /**
   * Validate CSV rows and return parsed objects + row-specific validation errors
   */
  public static async validateImport(
    propertyId: string,
    csvContent: string,
    filename: string,
    importMode: ImportMode,
    session: AdminSession
  ): Promise<{
    jobId: string;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    rowErrors: IRowValidationError[];
    parsedRows: ParsedCsvRow[];
  }> {
    await connectToDatabase();

    const rawRows = this.parseCsv(csvContent);
    if (rawRows.length < 2) {
      throw new Error("The uploaded CSV is empty or missing a header row.");
    }

    const headers = rawRows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const unitNumberIdx = headers.indexOf("unitnumber");
    const categoryIdx = headers.indexOf("unitcategory");
    const configIdx = headers.indexOf("configuration");
    const areaIdx = headers.indexOf("areasqft");
    const priceIdx = headers.indexOf("basepricerupees");
    const statusIdx = headers.indexOf("status");
    const visibilityIdx = headers.indexOf("visibility");
    const phaseIdx = headers.indexOf("phasename");
    const towerIdx = headers.indexOf("towerblocksector");
    const floorIdx = headers.indexOf("floorlevel");
    const bedIdx = headers.indexOf("bedrooms");
    const bathIdx = headers.indexOf("bathrooms");
    const facingIdx = headers.indexOf("facing");
    const cornerIdx = headers.indexOf("cornerunit");
    const porIdx = headers.indexOf("priceonrequest");
    const notesIdx = headers.indexOf("internalnotes");

    if (unitNumberIdx === -1 || areaIdx === -1) {
      throw new Error("Missing required headers: 'unitNumber' and 'areaSqFt' are mandatory.");
    }

    const rowErrors: IRowValidationError[] = [];
    const parsedRows: ParsedCsvRow[] = [];
    const encounteredKeys = new Set<string>();

    const propId = new Types.ObjectId(propertyId);

    // Maximum 500 rows per batch upload
    const dataRows = rawRows.slice(1, 501);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2; // 1-indexed (header is 1)

      const unitNum = row[unitNumberIdx]?.trim();
      if (!unitNum) {
        rowErrors.push({ rowNumber: rowNum, field: "unitNumber", message: "Unit number is required" });
        continue;
      }

      const phase = phaseIdx >= 0 ? row[phaseIdx]?.trim() : undefined;
      const tower = towerIdx >= 0 ? row[towerIdx]?.trim() : undefined;
      const floor = floorIdx >= 0 ? row[floorIdx]?.trim() : undefined;

      const key = InventoryService.generateInventoryKey({
        propertyId,
        phaseName: phase,
        towerBlockSector: tower,
        floorLevel: floor,
        unitNumber: unitNum,
      });

      // Check intra-file duplicate
      if (encounteredKeys.has(key)) {
        rowErrors.push({
          rowNumber: rowNum,
          unitNumber: unitNum,
          field: "unitNumber",
          message: `Duplicate unit "${unitNum}" detected in the same uploaded CSV.`,
        });
        continue;
      }
      encounteredKeys.add(key);

      // Category validation
      let cat: UnitCategory = "RESIDENTIAL_PLOT";
      if (categoryIdx >= 0 && row[categoryIdx]) {
        const rawCat = row[categoryIdx].trim().toUpperCase() as UnitCategory;
        if (UNIT_CATEGORIES.includes(rawCat)) cat = rawCat;
        else rowErrors.push({ rowNumber: rowNum, field: "unitCategory", message: `Invalid category: ${row[categoryIdx]}` });
      }

      // Configuration validation
      let cfg: UnitConfiguration = "PLOT";
      if (configIdx >= 0 && row[configIdx]) {
        const rawCfg = row[configIdx].trim().toUpperCase() as UnitConfiguration;
        if (UNIT_CONFIGURATIONS.includes(rawCfg)) cfg = rawCfg;
        else rowErrors.push({ rowNumber: rowNum, field: "configuration", message: `Invalid configuration: ${row[configIdx]}` });
      }

      // Area validation
      const area = parseFloat(row[areaIdx] || "0");
      if (isNaN(area) || area <= 0) {
        rowErrors.push({ rowNumber: rowNum, field: "areaSqFt", message: "Area must be a positive number in square feet" });
      }

      // Price validation
      let priceRupees: number | undefined;
      if (priceIdx >= 0 && row[priceIdx]) {
        const p = parseFloat(row[priceIdx]);
        if (!isNaN(p) && p >= 0) priceRupees = p;
      }

      // Status
      let status: UnitStatus = "AVAILABLE";
      if (statusIdx >= 0 && row[statusIdx]) {
        const rawStatus = row[statusIdx].trim().toUpperCase() as UnitStatus;
        if (UNIT_STATUSES.includes(rawStatus)) status = rawStatus;
      }

      // Visibility
      let vis: UnitVisibility = "PUBLIC_DETAIL";
      if (visibilityIdx >= 0 && row[visibilityIdx]) {
        const rawVis = row[visibilityIdx].trim().toUpperCase() as UnitVisibility;
        if (UNIT_VISIBILITIES.includes(rawVis)) vis = rawVis;
      }

      // If mode is CREATE_NEW_ONLY, verify not existing in database
      if (importMode === "CREATE_NEW_ONLY") {
        const exists = await InventoryUnit.exists({ propertyId: propId, inventoryKey: key });
        if (exists) {
          rowErrors.push({
            rowNumber: rowNum,
            unitNumber: unitNum,
            field: "unitNumber",
            message: `Unit "${unitNum}" already exists in the database.`,
          });
          continue;
        }
      }

      parsedRows.push({
        rowNumber: rowNum,
        phaseName: phase,
        towerBlockSector: tower,
        floorLevel: floor,
        unitNumber: unitNum,
        unitCategory: cat,
        configuration: cfg,
        areaSqFt: area,
        basePriceRupees: priceRupees,
        status,
        visibility: vis,
        bedrooms: bedIdx >= 0 && row[bedIdx] ? parseInt(row[bedIdx], 10) : undefined,
        bathrooms: bathIdx >= 0 && row[bathIdx] ? parseInt(row[bathIdx], 10) : undefined,
        facing: facingIdx >= 0 ? row[facingIdx]?.trim().toUpperCase() : undefined,
        cornerUnit: cornerIdx >= 0 ? row[cornerIdx]?.trim().toUpperCase() === "TRUE" : false,
        priceOnRequest: porIdx >= 0 ? row[porIdx]?.trim().toUpperCase() === "TRUE" : false,
        internalNotes: notesIdx >= 0 ? row[notesIdx]?.trim() : undefined,
      });
    }

    const job = await InventoryImportJob.create({
      propertyId: propId,
      requestedBy: session.user.id,
      requestedByName: session.user.name,
      originalFilename: filename,
      status: rowErrors.length === 0 ? "READY" : "VALIDATING",
      importMode,
      totalRows: dataRows.length,
      validRows: parsedRows.length,
      invalidRows: rowErrors.length,
      rowErrors,
    });

    return {
      jobId: job._id.toString(),
      totalRows: dataRows.length,
      validRows: parsedRows.length,
      invalidRows: rowErrors.length,
      rowErrors,
      parsedRows,
    };
  }

  /**
   * Execute valid rows into database with batching and audit history
   */
  public static async executeImport(
    jobId: string,
    propertyId: string,
    rows: ParsedCsvRow[],
    session: AdminSession
  ): Promise<{ created: number; skipped: number; failed: number }> {
    await connectToDatabase();

    const job = await InventoryImportJob.findById(new Types.ObjectId(jobId));
    if (!job) throw new Error("Import job not found.");

    job.status = "PROCESSING";
    job.startedAt = new Date();
    await job.save();

    let created = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        const basePricePaise = row.basePriceRupees ? Math.round(row.basePriceRupees * 100) : undefined;
        await InventoryService.createUnit(
          {
            propertyId,
            phaseName: row.phaseName,
            towerBlockSector: row.towerBlockSector,
            floorLevel: row.floorLevel,
            unitNumber: row.unitNumber,
            unitCategory: row.unitCategory,
            configuration: row.configuration,
            plotAreaSqFt: row.unitCategory.includes("PLOT") ? row.areaSqFt : undefined,
            superBuiltUpAreaSqFt: !row.unitCategory.includes("PLOT") ? row.areaSqFt : undefined,
            basePricePaise,
            status: row.status,
            visibility: row.visibility,
            bedrooms: row.bedrooms,
            bathrooms: row.bathrooms,
            facing: row.facing,
            cornerUnit: row.cornerUnit,
            priceOnRequest: row.priceOnRequest,
            internalNotes: row.internalNotes,
          },
          session
        );
        created++;
      } catch (err) {
        failed++;
      }
    }

    job.createdRows = created;
    job.status = failed === 0 ? "COMPLETED" : "PARTIALLY_COMPLETED";
    job.completedAt = new Date();
    await job.save();

    await logAuditEvent({
      actor: session.user,
      action: "INVENTORY_BULK_IMPORT_COMPLETED",
      targetPropertyId: new Types.ObjectId(propertyId),
      reason: `Bulk imported ${created} units (${failed} failures) from ${job.originalFilename}`,
    });

    return { created, skipped: 0, failed };
  }
}
