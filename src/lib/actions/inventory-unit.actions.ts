"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/guard";
import {
  InventoryService,
  CreateUnitInput,
  UpdateUnitInput,
} from "@/lib/services/inventory.service";
import {
  InventoryImportService,
  ParsedCsvRow,
} from "@/lib/services/inventory-import.service";
import {
  InventoryFilterParams,
  UnitStatus,
  UnitVisibility,
} from "@/types/inventory";
import { IPricingSnapshot } from "@/models/InventoryPriceHistory";
import { logger } from "@/lib/logger";

import { getErrorMessage } from "@/lib/api/errors";
function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignore in CLI test runner
  }
}

/**
 * Create a new inventory unit
 */
export async function createInventoryUnitAction(input: CreateUnitInput) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const unit = await InventoryService.createUnit(input, session);
    safeRevalidate("/dashboard/inventory");
    safeRevalidate(`/dashboard/properties/${input.propertyId}/inventory`);
    return { success: true as const, unitId: unit._id.toString(), referenceCode: unit.referenceCode };
  } catch (error) {
    logger.error("[Inventory] createInventoryUnitAction failed", { error: getErrorMessage(error) });
    return { success: false as const, message: getErrorMessage(error, "Failed to create unit.") };
  }
}

/**
 * Update an existing unit with optimistic concurrency verification
 */
export async function updateInventoryUnitAction(unitId: string, input: UpdateUnitInput) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const updated = await InventoryService.updateUnit(unitId, input, session);
    safeRevalidate("/dashboard/inventory");
    safeRevalidate(`/dashboard/inventory/${unitId}`);
    return { success: true as const, unit: updated };
  } catch (error) {
    logger.error("[Inventory] updateInventoryUnitAction failed", { error: getErrorMessage(error) });
    return { success: false as const, message: getErrorMessage(error, "Failed to update unit.") };
  }
}

/**
 * Transition unit status (with transition matrix validation & reason logging)
 */
export async function transitionUnitStatusAction(params: {
  unitId: string;
  toStatus: UnitStatus;
  currentVersion: number;
  reasonCode: string;
  comment?: string;
}) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const updated = await InventoryService.transitionStatus({
      ...params,
      session,
    });
    safeRevalidate("/dashboard/inventory");
    safeRevalidate(`/dashboard/inventory/${params.unitId}`);
    return { success: true as const, unit: updated };
  } catch (error) {
    logger.error("[Inventory] transitionUnitStatusAction failed", { error: getErrorMessage(error) });
    return { success: false as const, message: getErrorMessage(error, "Failed to change status.") };
  }
}

/**
 * Update unit pricing
 */
export async function updateUnitPricingAction(params: {
  unitId: string;
  currentVersion: number;
  pricing: Partial<IPricingSnapshot>;
  reasonCode: string;
  comment?: string;
}) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const updated = await InventoryService.updatePricing({
      ...params,
      session,
    });
    safeRevalidate("/dashboard/inventory");
    safeRevalidate(`/dashboard/inventory/${params.unitId}`);
    return { success: true as const, unit: updated };
  } catch (error) {
    logger.error("[Inventory] updateUnitPricingAction failed", { error: getErrorMessage(error) });
    return { success: false as const, message: getErrorMessage(error, "Failed to update pricing.") };
  }
}

/**
 * Bulk update selected units (Visibility, Status, Price adjustments)
 */
export async function bulkUpdateUnitsAction(params: {
  unitIds: string[];
  actionType: "CHANGE_STATUS" | "CHANGE_VISIBILITY" | "ARCHIVE";
  newStatus?: UnitStatus;
  newVisibility?: UnitVisibility;
  reasonCode: string;
  comment?: string;
}) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    let updatedCount = 0;
    const errors: string[] = [];

    for (const id of params.unitIds) {
      try {
        if (params.actionType === "CHANGE_STATUS" && params.newStatus) {
          const u = await InventoryService.queryUnits({ search: id, page: 1, perPage: 1 }, session);
          if (u.units[0]) {
            await InventoryService.transitionStatus({
              unitId: id,
              toStatus: params.newStatus,
              currentVersion: u.units[0].version,
              reasonCode: params.reasonCode,
              comment: params.comment,
              session,
            });
            updatedCount++;
          }
        }
      } catch (err) {
        errors.push(`Unit ${id}: ${getErrorMessage(err)}`);
      }
    }

    safeRevalidate("/dashboard/inventory");
    return { success: true as const, updatedCount, errors };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error, "Bulk update failed.") };
  }
}

/**
 * Query paginated inventory units
 */
export async function queryInventoryUnitsAction(params: InventoryFilterParams) {
  try {
    const session = await requireAdminSession();
    return await InventoryService.queryUnits(params, session);
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch availability summaries
 */
export async function getInventoryAvailabilitySummaryAction(propertyId?: string) {
  try {
    await requireAdminSession();
    return await InventoryService.getAvailabilitySummary(propertyId);
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch Tower x Floor matrix view
 */
export async function getInventoryMatrixViewAction(propertyId: string, towerBlockSector?: string) {
  try {
    await requireAdminSession();
    return await InventoryService.getMatrixViewData(propertyId, towerBlockSector);
  } catch (error) {
    throw error;
  }
}

/**
 * Scan data quality & hygiene
 */
export async function scanInventoryDataQualityAction() {
  try {
    await requireAdminSession();
    return await InventoryService.scanDataQuality();
  } catch (error) {
    throw error;
  }
}

/**
 * Validate CSV import rows
 */
export async function validateInventoryImportAction(
  propertyId: string,
  csvContent: string,
  filename: string,
  importMode: "CREATE_NEW_ONLY" | "UPDATE_EXISTING_ONLY" | "CREATE_AND_UPDATE"
) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const result = await InventoryImportService.validateImport(propertyId, csvContent, filename, importMode, session);
    return { success: true as const, ...result };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error, "Failed to validate CSV.") };
  }
}

/**
 * Execute validated CSV import
 */
export async function executeInventoryImportAction(
  jobId: string,
  propertyId: string,
  rows: ParsedCsvRow[]
) {
  try {
    const session = await requireAdminSession(["SUPER_ADMIN", "ADMIN"]);
    const result = await InventoryImportService.executeImport(jobId, propertyId, rows, session);
    safeRevalidate("/dashboard/inventory");
    safeRevalidate(`/dashboard/properties/${propertyId}/inventory`);
    return { success: true as const, ...result };
  } catch (error) {
    return { success: false as const, message: getErrorMessage(error, "Failed to execute import.") };
  }
}
