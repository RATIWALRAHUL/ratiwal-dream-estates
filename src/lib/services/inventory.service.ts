/**
 * @file inventory.service.ts
 * @description Core business logic, status lifecycle transitions, optimistic concurrency control,
 * availability aggregation, and data quality scanner for Inventory Units.
 */

import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InventoryUnit, IInventoryUnit } from "@/models/InventoryUnit";
import { InventoryStatusHistory } from "@/models/InventoryStatusHistory";
import { InventoryPriceHistory, IPricingSnapshot } from "@/models/InventoryPriceHistory";
import { Property } from "@/models/Property";
import { Lead } from "@/models/Lead";
import { SiteVisit } from "@/models/SiteVisit";
import { AdminSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";
import {
  UnitStatus,
  UnitCategory,
  UnitConfiguration,
  UnitVisibility,
  InventoryFilterParams,
  InventoryUnitSummary,
  InventoryAvailabilitySummary,
  InventoryMatrixTower,
  isValidStatusTransition,
} from "@/types/inventory";
import { paiseToRupees } from "@/lib/utils/currency";

export interface CreateUnitInput {
  propertyId: string;
  phaseName?: string;
  towerBlockSector?: string;
  floorLevel?: string;
  unitNumber: string;
  unitCategory: UnitCategory;
  configuration: UnitConfiguration;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  facing?: any;
  viewType?: any;
  furnishingStatus?: any;
  cornerUnit?: boolean;

  // Areas
  carpetAreaSqFt?: number;
  builtUpAreaSqFt?: number;
  superBuiltUpAreaSqFt?: number;
  plotAreaSqFt?: number;
  balconyAreaSqFt?: number;
  terraceAreaSqFt?: number;
  chargeableAreaSqFt?: number;
  widthFeet?: number;
  lengthFeet?: number;

  // Status & Visibility
  status?: UnitStatus;
  visibility?: UnitVisibility;

  // Pricing
  basePricePaise?: number;
  ratePaisePerSqFt?: number;
  ratePaisePerSqYd?: number;
  plcChargePaise?: number;
  floorRiseChargePaise?: number;
  parkingChargePaise?: number;
  clubChargePaise?: number;
  maintenanceDepositPaise?: number;
  otherChargesPaise?: number;
  discountCeilingPaise?: number;
  estimatedTaxPaise?: number;
  displayPricePaise?: number;
  priceOnRequest?: boolean;

  floorPlanAssetId?: string;
  mediaAssetIds?: string[];
  internalNotes?: string;
}

export interface UpdateUnitInput extends Partial<CreateUnitInput> {
  version: number;
}

export class InventoryService {
  /**
   * Deterministically normalizes whitespace and builds the unique inventory key
   */
  public static generateInventoryKey(params: {
    propertyId: string;
    phaseName?: string;
    towerBlockSector?: string;
    floorLevel?: string;
    unitNumber: string;
  }): string {
    const clean = (str?: string) =>
      (str || "").trim().toUpperCase().replace(/[\s\-_]+/g, "_");

    const parts = [
      params.propertyId,
      clean(params.phaseName) || "BASE",
      clean(params.towerBlockSector) || "MAIN",
      clean(params.floorLevel) || "G",
      clean(params.unitNumber),
    ];

    return parts.join("::");
  }

  /**
   * Generates an immutable human-readable reference code e.g. RDE-UNT-8472
   */
  public static generateReferenceCode(category: UnitCategory): string {
    const prefix = category.includes("PLOT") ? "PLT" : "UNT";
    const random = Math.floor(100000 + Math.random() * 900000);
    return `RDE-${prefix}-${random}`;
  }

  /**
   * Create a new inventory unit with duplicate key check and version 1 initialization
   */
  public static async createUnit(
    input: CreateUnitInput,
    session: AdminSession
  ): Promise<IInventoryUnit> {
    await connectToDatabase();

    if (!Types.ObjectId.isValid(input.propertyId)) {
      throw new Error("Invalid property ID format.");
    }

    const propId = new Types.ObjectId(input.propertyId);
    const property = await Property.findById(propId);
    if (!property) {
      throw new Error("Parent property does not exist.");
    }

    const inventoryKey = this.generateInventoryKey({
      propertyId: input.propertyId,
      phaseName: input.phaseName,
      towerBlockSector: input.towerBlockSector,
      floorLevel: input.floorLevel,
      unitNumber: input.unitNumber,
    });

    const duplicate = await InventoryUnit.findOne({
      propertyId: propId,
      inventoryKey,
    });

    if (duplicate) {
      throw new Error(
        `A unit with number "${input.unitNumber}" already exists in this hierarchy (Phase/Tower/Floor).`
      );
    }

    let refCode = this.generateReferenceCode(input.unitCategory);
    while (await InventoryUnit.exists({ referenceCode: refCode })) {
      refCode = this.generateReferenceCode(input.unitCategory);
    }

    const unitStatus = input.status || "DRAFT";

    const unit = await InventoryUnit.create({
      propertyId: propId,
      phaseName: input.phaseName?.trim() || undefined,
      towerBlockSector: input.towerBlockSector?.trim() || undefined,
      floorLevel: input.floorLevel?.trim() || undefined,
      unitNumber: input.unitNumber.trim(),
      inventoryKey,
      referenceCode: refCode,
      unitCategory: input.unitCategory,
      configuration: input.configuration,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      balconies: input.balconies,
      facing: input.facing,
      viewType: input.viewType,
      furnishingStatus: input.furnishingStatus,
      cornerUnit: Boolean(input.cornerUnit),

      carpetAreaSqFt: input.carpetAreaSqFt,
      builtUpAreaSqFt: input.builtUpAreaSqFt,
      superBuiltUpAreaSqFt: input.superBuiltUpAreaSqFt,
      plotAreaSqFt: input.plotAreaSqFt,
      balconyAreaSqFt: input.balconyAreaSqFt,
      terraceAreaSqFt: input.terraceAreaSqFt,
      chargeableAreaSqFt: input.chargeableAreaSqFt,
      widthFeet: input.widthFeet,
      lengthFeet: input.lengthFeet,

      status: unitStatus,
      visibility: input.visibility || "PUBLIC_DETAIL",

      basePricePaise: input.basePricePaise,
      ratePaisePerSqFt: input.ratePaisePerSqFt,
      ratePaisePerSqYd: input.ratePaisePerSqYd,
      plcChargePaise: input.plcChargePaise,
      floorRiseChargePaise: input.floorRiseChargePaise,
      parkingChargePaise: input.parkingChargePaise,
      clubChargePaise: input.clubChargePaise,
      maintenanceDepositPaise: input.maintenanceDepositPaise,
      otherChargesPaise: input.otherChargesPaise,
      discountCeilingPaise: input.discountCeilingPaise,
      estimatedTaxPaise: input.estimatedTaxPaise,
      displayPricePaise: input.displayPricePaise ?? input.basePricePaise,
      priceOnRequest: Boolean(input.priceOnRequest),

      floorPlanAssetId: input.floorPlanAssetId ? new Types.ObjectId(input.floorPlanAssetId) : undefined,
      mediaAssetIds: (input.mediaAssetIds || []).map((id) => new Types.ObjectId(id)),
      internalNotes: input.internalNotes?.trim(),

      version: 1,
      publishedAt: unitStatus === "AVAILABLE" ? new Date() : undefined,
      createdBy: session.user.id,
      createdByName: session.user.name,
      updatedBy: session.user.id,
      updatedByName: session.user.name,
    });

    // Record initial status history
    await InventoryStatusHistory.create({
      unitId: unit._id,
      propertyId: propId,
      fromStatus: "DRAFT",
      toStatus: unitStatus,
      reasonCode: "UNIT_INITIAL_CREATION",
      sanitizedComment: "Initial unit registration in inventory",
      source: "MANUAL_DASHBOARD",
      changedBy: session.user.id,
      changedByName: session.user.name,
      changedByRole: session.user.role,
      unitVersion: 1,
      changedAt: new Date(),
    });

    // Record initial price history if price provided
    if (input.basePricePaise || input.priceOnRequest) {
      const snapshot: IPricingSnapshot = {
        basePricePaise: input.basePricePaise,
        ratePaisePerSqFt: input.ratePaisePerSqFt,
        ratePaisePerSqYd: input.ratePaisePerSqYd,
        plcChargePaise: input.plcChargePaise,
        floorRiseChargePaise: input.floorRiseChargePaise,
        parkingChargePaise: input.parkingChargePaise,
        clubChargePaise: input.clubChargePaise,
        maintenanceDepositPaise: input.maintenanceDepositPaise,
        discountCeilingPaise: input.discountCeilingPaise,
        displayPricePaise: input.displayPricePaise,
        priceOnRequest: Boolean(input.priceOnRequest),
      };

      await InventoryPriceHistory.create({
        unitId: unit._id,
        propertyId: propId,
        currency: "INR",
        previousPricing: snapshot,
        newPricing: snapshot,
        changedFields: ["INITIAL_CREATION"],
        reasonCode: "INITIAL_PRICE_SETUP",
        sanitizedComment: "Initial unit pricing configuration",
        changedBy: session.user.id,
        changedByName: session.user.name,
        changedByRole: session.user.role,
        source: "MANUAL_DASHBOARD",
      });
    }

    await logAuditEvent({
      actor: session.user,
      action: "INVENTORY_UNIT_CREATED",
      targetPropertyId: propId,
      targetUnitId: unit._id as Types.ObjectId,
      reason: `Created unit ${unit.unitNumber} (${unit.referenceCode})`,
    });

    return unit;
  }

  /**
   * Concurrency-safe unit update with optimistic version verification
   */
  public static async updateUnit(
    unitId: string,
    input: UpdateUnitInput,
    session: AdminSession
  ): Promise<IInventoryUnit> {
    await connectToDatabase();

    if (!Types.ObjectId.isValid(unitId)) {
      throw new Error("Invalid unit ID format.");
    }

    const uId = new Types.ObjectId(unitId);
    const existing = await InventoryUnit.findById(uId);
    if (!existing) {
      throw new Error("Unit not found.");
    }

    if (existing.version !== input.version) {
      throw new Error(
        "CONFLICT: This unit was modified by another user. Please refresh and try again."
      );
    }

    const newInventoryKey = this.generateInventoryKey({
      propertyId: existing.propertyId.toString(),
      phaseName: input.phaseName ?? existing.phaseName,
      towerBlockSector: input.towerBlockSector ?? existing.towerBlockSector,
      floorLevel: input.floorLevel ?? existing.floorLevel,
      unitNumber: input.unitNumber ?? existing.unitNumber,
    });

    if (newInventoryKey !== existing.inventoryKey) {
      const conflict = await InventoryUnit.findOne({
        propertyId: existing.propertyId,
        inventoryKey: newInventoryKey,
        _id: { $ne: uId },
      });
      if (conflict) {
        throw new Error(
          `A unit with number "${input.unitNumber}" already exists in this hierarchy.`
        );
      }
    }

    // Atomic update with optimistic concurrency condition
    const updated = await InventoryUnit.findOneAndUpdate(
      { _id: uId, version: input.version },
      {
        $set: {
          phaseName: input.phaseName?.trim() ?? existing.phaseName,
          towerBlockSector: input.towerBlockSector?.trim() ?? existing.towerBlockSector,
          floorLevel: input.floorLevel?.trim() ?? existing.floorLevel,
          unitNumber: (input.unitNumber ?? existing.unitNumber).trim(),
          inventoryKey: newInventoryKey,
          unitCategory: input.unitCategory ?? existing.unitCategory,
          configuration: input.configuration ?? existing.configuration,
          bedrooms: input.bedrooms ?? existing.bedrooms,
          bathrooms: input.bathrooms ?? existing.bathrooms,
          balconies: input.balconies ?? existing.balconies,
          facing: input.facing ?? existing.facing,
          viewType: input.viewType ?? existing.viewType,
          furnishingStatus: input.furnishingStatus ?? existing.furnishingStatus,
          cornerUnit: input.cornerUnit !== undefined ? Boolean(input.cornerUnit) : existing.cornerUnit,

          carpetAreaSqFt: input.carpetAreaSqFt ?? existing.carpetAreaSqFt,
          builtUpAreaSqFt: input.builtUpAreaSqFt ?? existing.builtUpAreaSqFt,
          superBuiltUpAreaSqFt: input.superBuiltUpAreaSqFt ?? existing.superBuiltUpAreaSqFt,
          plotAreaSqFt: input.plotAreaSqFt ?? existing.plotAreaSqFt,
          balconyAreaSqFt: input.balconyAreaSqFt ?? existing.balconyAreaSqFt,
          terraceAreaSqFt: input.terraceAreaSqFt ?? existing.terraceAreaSqFt,
          chargeableAreaSqFt: input.chargeableAreaSqFt ?? existing.chargeableAreaSqFt,
          widthFeet: input.widthFeet ?? existing.widthFeet,
          lengthFeet: input.lengthFeet ?? existing.lengthFeet,

          visibility: input.visibility ?? existing.visibility,
          internalNotes: input.internalNotes?.trim() ?? existing.internalNotes,

          floorPlanAssetId: input.floorPlanAssetId ? new Types.ObjectId(input.floorPlanAssetId) : existing.floorPlanAssetId,
          mediaAssetIds: input.mediaAssetIds ? input.mediaAssetIds.map((id) => new Types.ObjectId(id)) : existing.mediaAssetIds,

          updatedBy: session.user.id,
          updatedByName: session.user.name,
        },
        $inc: { version: 1 },
      },
      { new: true }
    );

    if (!updated) {
      throw new Error(
        "CONFLICT: Concurrent update detected. The unit was changed before your edit could be applied."
      );
    }

    await logAuditEvent({
      actor: session.user,
      action: "INVENTORY_UNIT_UPDATED",
      targetPropertyId: existing.propertyId,
      targetUnitId: uId,
      reason: `Updated specifications for unit ${updated.unitNumber} (${updated.referenceCode})`,
    });

    return updated;
  }

  /**
   * Change status with transition policy check, append-only history, and optimistic concurrency
   */
  public static async transitionStatus(params: {
    unitId: string;
    toStatus: UnitStatus;
    currentVersion: number;
    reasonCode: string;
    comment?: string;
    session: AdminSession;
  }): Promise<IInventoryUnit> {
    await connectToDatabase();

    const uId = new Types.ObjectId(params.unitId);
    const existing = await InventoryUnit.findById(uId);
    if (!existing) throw new Error("Unit not found.");

    if (existing.version !== params.currentVersion) {
      throw new Error("CONFLICT: Unit status was changed by another user. Please refresh.");
    }

    // Role-based transition guard: Advisors cannot change unit status
    if (params.session.user.role === "EDITOR") {
      throw new Error("Unauthorized: Advisors cannot change unit inventory status.");
    }

    // Reservation-ready status guard: require Admin role + reasonCode
    if (["ON_HOLD", "RESERVED", "BOOKED", "SOLD"].includes(params.toStatus)) {
      if (!params.reasonCode) {
        throw new Error("A specific reason code is required for reservation-state changes.");
      }
    }

    if (!isValidStatusTransition(existing.status, params.toStatus)) {
      throw new Error(
        `Invalid status transition from ${existing.status} to ${params.toStatus}.`
      );
    }

    const nextVersion = existing.version + 1;

    const updated = await InventoryUnit.findOneAndUpdate(
      { _id: uId, version: params.currentVersion },
      {
        $set: {
          status: params.toStatus,
          publishedAt: params.toStatus === "AVAILABLE" && !existing.publishedAt ? new Date() : existing.publishedAt,
          archivedAt: params.toStatus === "ARCHIVED" ? new Date() : undefined,
          updatedBy: params.session.user.id,
          updatedByName: params.session.user.name,
        },
        $inc: { version: 1 },
      },
      { new: true }
    );

    if (!updated) {
      throw new Error("CONFLICT: Status change failed due to a concurrent update.");
    }

    // Record append-only status history
    await InventoryStatusHistory.create({
      unitId: uId,
      propertyId: existing.propertyId,
      fromStatus: existing.status,
      toStatus: params.toStatus,
      reasonCode: params.reasonCode,
      sanitizedComment: params.comment?.trim(),
      source: "MANUAL_DASHBOARD",
      changedBy: params.session.user.id,
      changedByName: params.session.user.name,
      changedByRole: params.session.user.role,
      unitVersion: nextVersion,
      changedAt: new Date(),
    });

    await logAuditEvent({
      actor: params.session.user,
      action: "INVENTORY_STATUS_CHANGED",
      targetPropertyId: existing.propertyId,
      targetUnitId: uId,
      reason: `Changed status from ${existing.status} to ${params.toStatus}: ${params.reasonCode}`,
    });

    return updated;
  }

  /**
   * Update pricing with append-only price history snapshot
   */
  public static async updatePricing(params: {
    unitId: string;
    currentVersion: number;
    pricing: Partial<IPricingSnapshot>;
    reasonCode: string;
    comment?: string;
    session: AdminSession;
  }): Promise<IInventoryUnit> {
    await connectToDatabase();

    const uId = new Types.ObjectId(params.unitId);
    const existing = await InventoryUnit.findById(uId);
    if (!existing) throw new Error("Unit not found.");

    if (existing.version !== params.currentVersion) {
      throw new Error("CONFLICT: Pricing was modified by another user. Please refresh.");
    }

    if (params.session.user.role === "EDITOR") {
      throw new Error("Unauthorized: Advisors cannot edit unit pricing.");
    }

    const prevSnapshot: IPricingSnapshot = {
      basePricePaise: existing.basePricePaise,
      ratePaisePerSqFt: existing.ratePaisePerSqFt,
      ratePaisePerSqYd: existing.ratePaisePerSqYd,
      plcChargePaise: existing.plcChargePaise,
      floorRiseChargePaise: existing.floorRiseChargePaise,
      parkingChargePaise: existing.parkingChargePaise,
      clubChargePaise: existing.clubChargePaise,
      maintenanceDepositPaise: existing.maintenanceDepositPaise,
      discountCeilingPaise: existing.discountCeilingPaise,
      displayPricePaise: existing.displayPricePaise,
      priceOnRequest: existing.priceOnRequest,
    };

    const newSnapshot: IPricingSnapshot = {
      ...prevSnapshot,
      ...params.pricing,
    };

    const changedFields = Object.keys(params.pricing);

    const updated = await InventoryUnit.findOneAndUpdate(
      { _id: uId, version: params.currentVersion },
      {
        $set: {
          basePricePaise: newSnapshot.basePricePaise,
          ratePaisePerSqFt: newSnapshot.ratePaisePerSqFt,
          ratePaisePerSqYd: newSnapshot.ratePaisePerSqYd,
          plcChargePaise: newSnapshot.plcChargePaise,
          floorRiseChargePaise: newSnapshot.floorRiseChargePaise,
          parkingChargePaise: newSnapshot.parkingChargePaise,
          clubChargePaise: newSnapshot.clubChargePaise,
          maintenanceDepositPaise: newSnapshot.maintenanceDepositPaise,
          discountCeilingPaise: newSnapshot.discountCeilingPaise,
          displayPricePaise: newSnapshot.displayPricePaise ?? newSnapshot.basePricePaise,
          priceOnRequest: Boolean(newSnapshot.priceOnRequest),
          updatedBy: params.session.user.id,
          updatedByName: params.session.user.name,
        },
        $inc: { version: 1 },
      },
      { new: true }
    );

    if (!updated) {
      throw new Error("CONFLICT: Price change failed due to a concurrent update.");
    }

    await InventoryPriceHistory.create({
      unitId: uId,
      propertyId: existing.propertyId,
      currency: "INR",
      previousPricing: prevSnapshot,
      newPricing: newSnapshot,
      changedFields,
      reasonCode: params.reasonCode,
      sanitizedComment: params.comment?.trim(),
      changedBy: params.session.user.id,
      changedByName: params.session.user.name,
      changedByRole: params.session.user.role,
      source: "MANUAL_DASHBOARD",
    });

    await logAuditEvent({
      actor: params.session.user,
      action: "INVENTORY_PRICE_CHANGED",
      targetPropertyId: existing.propertyId,
      targetUnitId: uId,
      reason: `Updated pricing for unit ${updated.unitNumber}: ${params.reasonCode}`,
    });

    return updated;
  }

  /**
   * Fetch paginated list of inventory units with multi-criteria filters
   */
  public static async queryUnits(
    params: InventoryFilterParams,
    session: AdminSession
  ): Promise<{
    units: InventoryUnitSummary[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  }> {
    await connectToDatabase();

    const page = Math.max(1, params.page || 1);
    const perPage = Math.min(100, Math.max(1, params.perPage || 20));
    const skip = (page - 1) * perPage;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    // Do not show archived units by default unless explicitly asked
    if (params.status && params.status !== "ALL") {
      query.status = params.status;
    } else {
      query.status = { $ne: "ARCHIVED" };
    }

    // Role-based visibility scoping
    if (session.user.role === "EDITOR") {
      // Advisors only view permitted public/available units
      query.visibility = { $in: ["PUBLIC_DETAIL", "PUBLIC_SUMMARY"] };
    } else if (params.visibility && params.visibility !== "ALL") {
      query.visibility = params.visibility;
    }

    if (params.propertyId && Types.ObjectId.isValid(params.propertyId)) {
      query.propertyId = new Types.ObjectId(params.propertyId);
    }
    if (params.phaseName) query.phaseName = params.phaseName;
    if (params.towerBlockSector) query.towerBlockSector = params.towerBlockSector;
    if (params.floorLevel) query.floorLevel = params.floorLevel;
    if (params.category && params.category !== "ALL") query.unitCategory = params.category;
    if (params.configuration && params.configuration !== "ALL") query.configuration = params.configuration;

    if (params.minPricePaise || params.maxPricePaise) {
      query.basePricePaise = {};
      if (params.minPricePaise) query.basePricePaise.$gte = params.minPricePaise;
      if (params.maxPricePaise) query.basePricePaise.$lte = params.maxPricePaise;
    }

    if (params.minAreaSqFt || params.maxAreaSqFt) {
      query.plotAreaSqFt = {};
      if (params.minAreaSqFt) query.plotAreaSqFt.$gte = params.minAreaSqFt;
      if (params.maxAreaSqFt) query.plotAreaSqFt.$lte = params.maxAreaSqFt;
    }

    if (params.search) {
      const searchRegex = new RegExp(params.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { unitNumber: searchRegex },
        { referenceCode: searchRegex },
        { towerBlockSector: searchRegex },
        { phaseName: searchRegex },
      ];
    }

    const sortField = params.sortBy || "createdAt";
    const sortDir = params.sortOrder === "asc" ? 1 : -1;

    const [total, items, properties] = await Promise.all([
      InventoryUnit.countDocuments(query),
      InventoryUnit.find(query)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(perPage)
        .lean(),
      Property.find().select("title").lean(),
    ]);

    const propMap = new Map(properties.map((p) => [p._id.toString(), p.title]));

    const units: InventoryUnitSummary[] = items.map((u) => {
      const area = u.plotAreaSqFt || u.superBuiltUpAreaSqFt || u.builtUpAreaSqFt || u.carpetAreaSqFt || 0;
      return {
        _id: u._id.toString(),
        propertyId: u.propertyId.toString(),
        propertyName: propMap.get(u.propertyId.toString()) || "Property",
        referenceCode: u.referenceCode,
        inventoryKey: u.inventoryKey,
        phaseName: u.phaseName,
        towerBlockSector: u.towerBlockSector,
        floorLevel: u.floorLevel,
        unitNumber: u.unitNumber,
        unitCategory: u.unitCategory,
        configuration: u.configuration,
        status: u.status,
        visibility: u.visibility,
        areaSqFt: area,
        areaSqYd: area ? Math.round((area / 9) * 100) / 100 : undefined,
        basePricePaise: u.basePricePaise,
        basePriceRupees: u.basePricePaise ? paiseToRupees(u.basePricePaise) : null,
        displayPricePaise: u.displayPricePaise,
        displayPriceRupees: u.displayPricePaise ? paiseToRupees(u.displayPricePaise) : null,
        priceOnRequest: u.priceOnRequest,
        cornerUnit: u.cornerUnit,
        facing: u.facing,
        version: u.version,
        updatedAt: u.updatedAt.toISOString(),
        createdAt: u.createdAt.toISOString(),
      };
    });

    return {
      units,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  /**
   * Aggregate availability breakdown across all properties or for a specific property
   */
  public static async getAvailabilitySummary(
    propertyId?: string
  ): Promise<InventoryAvailabilitySummary[]> {
    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const propQuery: Record<string, any> = {};
    if (propertyId && Types.ObjectId.isValid(propertyId)) {
      propQuery._id = new Types.ObjectId(propertyId);
    }

    const properties = await Property.find(propQuery).select("title inventoryMode").lean();

    const summaries: InventoryAvailabilitySummary[] = [];

    for (const prop of properties) {
      const units = await InventoryUnit.find({ propertyId: prop._id }).lean();

      let available = 0;
      let onHold = 0;
      let reserved = 0;
      let booked = 0;
      let sold = 0;
      let blocked = 0;
      let unavailable = 0;
      let archived = 0;
      let publicVisible = 0;
      let minPricePaise: number | undefined;
      let minArea = Infinity;
      let maxArea = 0;

      const configMap = new Map<UnitConfiguration, { count: number; available: number }>();

      for (const u of units) {
        if (u.status === "AVAILABLE") available++;
        else if (u.status === "ON_HOLD") onHold++;
        else if (u.status === "RESERVED") reserved++;
        else if (u.status === "BOOKED") booked++;
        else if (u.status === "SOLD") sold++;
        else if (u.status === "BLOCKED") blocked++;
        else if (u.status === "UNAVAILABLE") unavailable++;
        else if (u.status === "ARCHIVED") archived++;

        if (u.visibility === "PUBLIC_DETAIL" || u.visibility === "PUBLIC_SUMMARY") {
          publicVisible++;
        }

        const price = u.displayPricePaise ?? u.basePricePaise;
        if (price && (!minPricePaise || price < minPricePaise)) {
          minPricePaise = price;
        }

        const area = u.plotAreaSqFt || u.superBuiltUpAreaSqFt || u.builtUpAreaSqFt || u.carpetAreaSqFt || 0;
        if (area > 0) {
          if (area < minArea) minArea = area;
          if (area > maxArea) maxArea = area;
        }

        const existingCfg = configMap.get(u.configuration) || { count: 0, available: 0 };
        existingCfg.count++;
        if (u.status === "AVAILABLE") existingCfg.available++;
        configMap.set(u.configuration, existingCfg);
      }

      summaries.push({
        propertyId: prop._id.toString(),
        propertyName: prop.title,
        inventoryMode: (prop.inventoryMode as any) || "SINGLE_LISTING",
        totalUnits: units.length,
        availableCount: available,
        onHoldCount: onHold,
        reservedCount: reserved,
        bookedCount: booked,
        soldCount: sold,
        blockedCount: blocked,
        unavailableCount: unavailable,
        archivedCount: archived,
        publiclyVisibleCount: publicVisible,
        startingPricePaise: minPricePaise,
        startingPriceRupees: minPricePaise ? paiseToRupees(minPricePaise) : null,
        areaRangeSqFt: {
          min: minArea === Infinity ? 0 : minArea,
          max: maxArea,
        },
        configurationBreakdown: Array.from(configMap.entries()).map(([cfg, data]) => ({
          configuration: cfg,
          count: data.count,
          available: data.available,
        })),
        updatedAt: new Date().toISOString(),
      });
    }

    return summaries;
  }

  /**
   * Build Tower x Floor matrix for apartment towers or commercial blocks
   */
  public static async getMatrixViewData(
    propertyId: string,
    towerBlockSector?: string
  ): Promise<InventoryMatrixTower[]> {
    await connectToDatabase();

    if (!Types.ObjectId.isValid(propertyId)) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {
      propertyId: new Types.ObjectId(propertyId),
      status: { $ne: "ARCHIVED" },
    };

    if (towerBlockSector) {
      query.towerBlockSector = towerBlockSector;
    }

    const units = await InventoryUnit.find(query)
      .sort({ towerBlockSector: 1, floorLevel: -1, unitNumber: 1 })
      .lean();

    const towerMap = new Map<string, Map<string, any[]>>();

    for (const u of units) {
      const tower = u.towerBlockSector || "Main Block";
      const floor = u.floorLevel || "Ground";

      if (!towerMap.has(tower)) {
        towerMap.set(tower, new Map());
      }
      const floorMap = towerMap.get(tower)!;
      if (!floorMap.has(floor)) {
        floorMap.set(floor, []);
      }

      const area = u.plotAreaSqFt || u.superBuiltUpAreaSqFt || u.builtUpAreaSqFt || u.carpetAreaSqFt || 0;
      const price = u.displayPricePaise ?? u.basePricePaise;

      floorMap.get(floor)!.push({
        unitId: u._id.toString(),
        unitNumber: u.unitNumber,
        referenceCode: u.referenceCode,
        configuration: u.configuration,
        category: u.unitCategory,
        status: u.status,
        visibility: u.visibility,
        displayPriceRupees: price ? paiseToRupees(price) : null,
        priceOnRequest: u.priceOnRequest,
        areaSqFt: area,
        version: u.version,
      });
    }

    const towers: InventoryMatrixTower[] = [];
    for (const [towerName, floorsMap] of towerMap.entries()) {
      towers.push({
        towerBlockSector: towerName,
        floors: Array.from(floorsMap.entries()).map(([floorName, cellList]) => ({
          floorLevel: floorName,
          units: cellList,
        })),
      });
    }

    return towers;
  }

  /**
   * Scan for inventory data quality gaps and reconciliation mismatches
   */
  public static async scanDataQuality() {
    await connectToDatabase();

    const [
      missingPropertyCount,
      missingPriceCount,
      missingAreaCount,
      availableWithoutDisplayPrice,
      totalUnitsCount,
    ] = await Promise.all([
      InventoryUnit.countDocuments({ propertyId: { $exists: false } }),
      InventoryUnit.countDocuments({
        status: "AVAILABLE",
        basePricePaise: { $exists: false },
        priceOnRequest: false,
      }),
      InventoryUnit.countDocuments({
        plotAreaSqFt: { $exists: false },
        carpetAreaSqFt: { $exists: false },
        builtUpAreaSqFt: { $exists: false },
        superBuiltUpAreaSqFt: { $exists: false },
      }),
      InventoryUnit.countDocuments({
        status: "AVAILABLE",
        visibility: { $in: ["PUBLIC_DETAIL", "PUBLIC_SUMMARY"] },
        displayPricePaise: { $exists: false },
        basePricePaise: { $exists: false },
        priceOnRequest: false,
      }),
      InventoryUnit.countDocuments(),
    ]);

    const issues = [];
    if (missingPriceCount > 0) {
      issues.push({
        title: "Available units without pricing or Price-on-Request flag",
        affectedCount: missingPriceCount,
        severity: "WARNING",
        impact: "Public listings will show missing price data.",
      });
    }
    if (missingAreaCount > 0) {
      issues.push({
        title: "Units missing all area specifications",
        affectedCount: missingAreaCount,
        severity: "CRITICAL",
        impact: "Rate calculations and dimension comparisons cannot be computed.",
      });
    }
    if (availableWithoutDisplayPrice > 0) {
      issues.push({
        title: "Publicly visible available units without display price",
        affectedCount: availableWithoutDisplayPrice,
        severity: "WARNING",
        impact: "Visitors see incomplete cards on public site.",
      });
    }

    return {
      totalUnits: totalUnitsCount,
      totalIssuesCount: issues.length,
      overallScore: Math.max(0, 100 - (missingPriceCount * 5 + missingAreaCount * 10)),
      issues,
    };
  }
}
