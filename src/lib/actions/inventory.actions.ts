/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignore static generation store missing when running in CLI test context
  }
}
import { connectToDatabase } from "@/lib/db/mongoose";
import { PlotOption } from "@/models/PlotOption";
import { Property } from "@/models/Property";
import { requireAdminSession } from "@/lib/auth/guard";
import { logAuditEvent } from "@/lib/services/audit.service";
import {
  createPlotOptionSchema,
  updatePlotOptionSchema,
  changePlotStatusSchema,
  type CreatePlotOptionInput,
  type UpdatePlotOptionInput,
} from "@/lib/validations/property.schema";
import type { ActionResult } from "./types";
import type { PlotStatus } from "@/types/database";

/**
 * 1. Add discrete Plot Option to a Property
 */
export async function createPlotOptionAction(
  propertyId: string,
  input: CreatePlotOptionInput
): Promise<ActionResult<{ plotId: string }>> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    if (!Types.ObjectId.isValid(propertyId)) {
      return { success: false, code: "NOT_FOUND", message: "Invalid property ID format." };
    }

    const targetPropertyId = new Types.ObjectId(propertyId);
    const property = await Property.findById(targetPropertyId);
    if (!property) {
      return { success: false, code: "NOT_FOUND", message: "Parent property does not exist." };
    }

    const parsed = createPlotOptionSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const err of parsed.error.issues) {
        const field = err.path.join(".");
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      }
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Invalid plot data.",
        fieldErrors,
      };
    }

    // Check duplicate plotNumber inside the same property
    const duplicate = await PlotOption.findOne({
      propertyId: targetPropertyId,
      plotNumber: parsed.data.plotNumber.trim(),
    });
    if (duplicate) {
      return {
        success: false,
        code: "DUPLICATE_PLOT_NUMBER",
        message: `Plot Number "${parsed.data.plotNumber}" already exists in this property.`,
        fieldErrors: { plotNumber: ["Plot number must be unique within this property"] },
      };
    }

    const plot = await PlotOption.create({
      propertyId: targetPropertyId,
      plotNumber: parsed.data.plotNumber.trim(),
      label: parsed.data.label?.trim() || undefined,
      areaSqFt: parsed.data.areaSqFt,
      widthFeet: parsed.data.dimensions?.widthFt,
      lengthFeet: parsed.data.dimensions?.lengthFt,
      facing: parsed.data.facing as any,
      cornerPlot: Boolean(parsed.data.isCorner),
      basePricePaise: parsed.data.basePricePaise,
      ratePaisePerSqFt: parsed.data.ratePerSqYdPaise ? Math.round(parsed.data.ratePerSqYdPaise / 9) : undefined,
      status: parsed.data.status,
      publiclyVisible: parsed.data.publicVisibility !== false,
      sortOrder: parsed.data.sortOrder,
      lastVerifiedAt: new Date(),
    });

    const plotDoc = plot as unknown as { _id: Types.ObjectId; plotNumber: string; status: string };

    await logAuditEvent({
      actor: session.user,
      action: "PLOT_CREATED",
      targetPropertyId: targetPropertyId,
      targetPlotId: plotDoc._id,
      changes: [{ field: "plotNumber", to: plotDoc.plotNumber }, { field: "status", to: plotDoc.status }],
    });

    safeRevalidatePath(`/dashboard/properties/${propertyId}/inventory`);
    safeRevalidatePath(`/dashboard/properties/${propertyId}/edit`);
    safeRevalidatePath(`/properties/${property.slug}`);
    safeRevalidatePath("/dashboard");

    return {
      success: true,
      data: { plotId: plotDoc._id.toString() },
      message: `Plot unit "${plotDoc.plotNumber}" created successfully.`,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, code: "DATABASE_ERROR", message: err.message || "Failed to create plot." };
  }
}

/**
 * 2. Update existing Plot Option
 */
export async function updatePlotOptionAction(
  propertyId: string,
  plotId: string,
  input: UpdatePlotOptionInput
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    if (!Types.ObjectId.isValid(propertyId) || !Types.ObjectId.isValid(plotId)) {
      return { success: false, code: "NOT_FOUND", message: "Invalid ID format." };
    }

    const targetPropertyId = new Types.ObjectId(propertyId);
    const targetPlotId = new Types.ObjectId(plotId);

    const [plot, property] = await Promise.all([
      PlotOption.findOne({ _id: targetPlotId, propertyId: targetPropertyId }),
      Property.findById(targetPropertyId),
    ]);

    if (!plot || !property) {
      return { success: false, code: "NOT_FOUND", message: "Plot or property record not found." };
    }

    const parsed = updatePlotOptionSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const err of parsed.error.issues) {
        const field = err.path.join(".");
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      }
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Invalid plot data.",
        fieldErrors,
      };
    }

    // Check duplicate plotNumber inside the same property (excluding self)
    if (parsed.data.plotNumber.trim() !== plot.plotNumber) {
      const duplicate = await PlotOption.findOne({
        propertyId: targetPropertyId,
        plotNumber: parsed.data.plotNumber.trim(),
        _id: { $ne: targetPlotId },
      });
      if (duplicate) {
        return {
          success: false,
          code: "DUPLICATE_PLOT_NUMBER",
          message: `Plot Number "${parsed.data.plotNumber}" already exists in this property.`,
          fieldErrors: { plotNumber: ["Plot number must be unique within this property"] },
        };
      }
    }

    const fromStatus = plot.status;

    plot.plotNumber = parsed.data.plotNumber.trim();
    plot.label = parsed.data.label?.trim() || undefined;
    plot.areaSqFt = parsed.data.areaSqFt;
    plot.widthFeet = parsed.data.dimensions?.widthFt;
    plot.lengthFeet = parsed.data.dimensions?.lengthFt;
    plot.facing = parsed.data.facing as any;
    plot.cornerPlot = Boolean(parsed.data.isCorner);
    plot.basePricePaise = parsed.data.basePricePaise;
    plot.ratePaisePerSqFt = parsed.data.ratePerSqYdPaise ? Math.round(parsed.data.ratePerSqYdPaise / 9) : undefined;
    plot.status = parsed.data.status;
    plot.publiclyVisible = parsed.data.publicVisibility !== false;
    plot.sortOrder = parsed.data.sortOrder;
    plot.increment();

    await plot.save();

    await logAuditEvent({
      actor: session.user,
      action: fromStatus !== plot.status ? "PLOT_STATUS_CHANGED" : "PLOT_UPDATED",
      targetPropertyId: targetPropertyId,
      targetPlotId: plot._id,
      changes: [{ field: "status", from: fromStatus, to: plot.status }],
    });

    safeRevalidatePath(`/dashboard/properties/${propertyId}/inventory`);
    safeRevalidatePath(`/dashboard/properties/${propertyId}/edit`);
    safeRevalidatePath(`/properties/${property.slug}`);
    safeRevalidatePath("/dashboard");

    return {
      success: true,
      message: `Plot "${plot.plotNumber}" updated successfully.`,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, code: "DATABASE_ERROR", message: err.message || "Failed to update plot." };
  }
}

/**
 * 3. Quick Status Toggle for Plot Option
 */
export async function changePlotOptionStatusAction(
  propertyId: string,
  plotId: string,
  newStatus: PlotStatus
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const parsed = changePlotStatusSchema.safeParse({ status: newStatus });
    if (!parsed.success) {
      return { success: false, code: "VALIDATION_ERROR", message: "Invalid plot status." };
    }

    const plot = await PlotOption.findOne({
      _id: new Types.ObjectId(plotId),
      propertyId: new Types.ObjectId(propertyId),
    });

    if (!plot) {
      return { success: false, code: "NOT_FOUND", message: "Plot record not found." };
    }

    const fromStatus = plot.status;
    plot.status = newStatus;
    plot.increment();
    await plot.save();

    await logAuditEvent({
      actor: session.user,
      action: "PLOT_STATUS_CHANGED",
      targetPropertyId: new Types.ObjectId(propertyId),
      targetPlotId: plot._id,
      changes: [{ field: "status", from: fromStatus, to: newStatus }],
    });

    safeRevalidatePath(`/dashboard/properties/${propertyId}/inventory`);
    safeRevalidatePath("/dashboard");

    return {
      success: true,
      message: `Plot ${plot.plotNumber} status updated to ${newStatus}.`,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, code: "DATABASE_ERROR", message: err.message || "Failed to change status." };
  }
}

/**
 * 4. Remove Plot Option (Soft archive to UNAVAILABLE status)
 */
export async function removePlotOptionAction(
  propertyId: string,
  plotId: string
): Promise<ActionResult> {
  try {
    const session = await requireAdminSession(["ADMIN", "SUPER_ADMIN"]);
    await connectToDatabase();

    const plot = await PlotOption.findOne({
      _id: new Types.ObjectId(plotId),
      propertyId: new Types.ObjectId(propertyId),
    });

    if (!plot) {
      return { success: false, code: "NOT_FOUND", message: "Plot not found." };
    }

    // Preserve historical reservations & sales by setting UNAVAILABLE instead of hard delete
    plot.status = "UNAVAILABLE";
    plot.publiclyVisible = false;
    plot.increment();
    await plot.save();

    await logAuditEvent({
      actor: session.user,
      action: "PLOT_STATUS_CHANGED",
      targetPropertyId: new Types.ObjectId(propertyId),
      targetPlotId: plot._id,
      reason: "Plot removed from active inventory and archived as UNAVAILABLE.",
      changes: [{ field: "status", to: "UNAVAILABLE" }],
    });

    safeRevalidatePath(`/dashboard/properties/${propertyId}/inventory`);
    safeRevalidatePath("/dashboard");

    return {
      success: true,
      message: `Plot ${plot.plotNumber} marked UNAVAILABLE and removed from active inventory.`,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, code: "DATABASE_ERROR", message: err.message || "Failed to remove plot." };
  }
}
