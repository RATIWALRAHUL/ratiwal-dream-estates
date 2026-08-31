"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UnitCategory,
  UNIT_CATEGORIES,
  UnitConfiguration,
  UNIT_CONFIGURATIONS,
  UnitStatus,
  UNIT_STATUSES,
  UnitVisibility,
  UNIT_VISIBILITIES,
  FACING_DIRECTIONS,
  VIEW_TYPES,
  FURNISHING_STATUSES,
} from "@/types/inventory";
import {
  createInventoryUnitAction,
  updateInventoryUnitAction,
} from "@/lib/actions/inventory-unit.actions";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface UnitFormProps {
  properties: { _id: string; title: string }[];
  initialData?: any;
  isEdit?: boolean;
}

export function UnitForm({ properties, initialData, isEdit = false }: UnitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [propertyId, setPropertyId] = useState<string>(initialData?.propertyId || properties[0]?._id || "");
  const [phaseName, setPhaseName] = useState<string>(initialData?.phaseName || "");
  const [towerBlockSector, setTowerBlockSector] = useState<string>(initialData?.towerBlockSector || "");
  const [floorLevel, setFloorLevel] = useState<string>(initialData?.floorLevel || "");
  const [unitNumber, setUnitNumber] = useState<string>(initialData?.unitNumber || "");
  const [unitCategory, setUnitCategory] = useState<UnitCategory>(initialData?.unitCategory || "RESIDENTIAL_PLOT");
  const [configuration, setConfiguration] = useState<UnitConfiguration>(initialData?.configuration || "PLOT");

  // Areas
  const [plotAreaSqFt, setPlotAreaSqFt] = useState<string>(initialData?.plotAreaSqFt ? String(initialData.plotAreaSqFt) : "");
  const [superBuiltUpAreaSqFt, setSuperBuiltUpAreaSqFt] = useState<string>(
    initialData?.superBuiltUpAreaSqFt ? String(initialData.superBuiltUpAreaSqFt) : ""
  );
  const [carpetAreaSqFt, setCarpetAreaSqFt] = useState<string>(
    initialData?.carpetAreaSqFt ? String(initialData.carpetAreaSqFt) : ""
  );
  const [terraceAreaSqFt, setTerraceAreaSqFt] = useState<string>(
    initialData?.terraceAreaSqFt ? String(initialData.terraceAreaSqFt) : ""
  );
  const [chargeableAreaSqFt, setChargeableAreaSqFt] = useState<string>(
    initialData?.chargeableAreaSqFt ? String(initialData.chargeableAreaSqFt) : ""
  );

  // Specs
  const [bedrooms, setBedrooms] = useState<string>(initialData?.bedrooms ? String(initialData.bedrooms) : "");
  const [bathrooms, setBathrooms] = useState<string>(initialData?.bathrooms ? String(initialData.bathrooms) : "");
  const [facing, setFacing] = useState<string>(initialData?.facing || "");
  const [viewType, setViewType] = useState<string>(initialData?.viewType || "");
  const [cornerUnit, setCornerUnit] = useState<boolean>(initialData?.cornerUnit || false);

  // Pricing
  const [basePriceRupees, setBasePriceRupees] = useState<string>(
    initialData?.basePricePaise ? String(initialData.basePricePaise / 100) : ""
  );
  const [priceOnRequest, setPriceOnRequest] = useState<boolean>(initialData?.priceOnRequest || false);

  // Status & Visibility
  const [status, setStatus] = useState<UnitStatus>(initialData?.status || "AVAILABLE");
  const [visibility, setVisibility] = useState<UnitVisibility>(initialData?.visibility || "PUBLIC_DETAIL");
  const [internalNotes, setInternalNotes] = useState<string>(initialData?.internalNotes || "");

  const isPlot = unitCategory.includes("PLOT");
  const isResidentialBuilding = ["APARTMENT", "PENTHOUSE", "STUDIO", "INDEPENDENT_FLOOR", "VILLA"].includes(unitCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!unitNumber.trim()) {
      setError("Unit or Plot Number is required.");
      return;
    }

    startTransition(async () => {
      const basePricePaise = basePriceRupees ? Math.round(parseFloat(basePriceRupees) * 100) : undefined;
      const plotArea = plotAreaSqFt ? parseFloat(plotAreaSqFt) : undefined;
      const superArea = superBuiltUpAreaSqFt ? parseFloat(superBuiltUpAreaSqFt) : undefined;
      const carpetArea = carpetAreaSqFt ? parseFloat(carpetAreaSqFt) : undefined;
      const terraceArea = terraceAreaSqFt ? parseFloat(terraceAreaSqFt) : undefined;
      const chargeableArea = chargeableAreaSqFt ? parseFloat(chargeableAreaSqFt) : undefined;

      if (isEdit) {
        const res = await updateInventoryUnitAction(initialData._id, {
          version: initialData.version,
          phaseName,
          towerBlockSector,
          floorLevel,
          unitNumber,
          unitCategory,
          configuration,
          plotAreaSqFt: plotArea,
          superBuiltUpAreaSqFt: superArea,
          carpetAreaSqFt: carpetArea,
          terraceAreaSqFt: terraceArea,
          chargeableAreaSqFt: chargeableArea,
          bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
          bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
          facing: facing || undefined,
          viewType: viewType || undefined,
          cornerUnit,
          visibility,
          internalNotes,
        });

        if (!res.success) {
          setError(res.message);
        } else {
          router.push(`/dashboard/inventory/${initialData._id}`);
        }
      } else {
        const res = await createInventoryUnitAction({
          propertyId,
          phaseName,
          towerBlockSector,
          floorLevel,
          unitNumber,
          unitCategory,
          configuration,
          plotAreaSqFt: plotArea,
          superBuiltUpAreaSqFt: superArea,
          carpetAreaSqFt: carpetArea,
          terraceAreaSqFt: terraceArea,
          chargeableAreaSqFt: chargeableArea,
          bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
          bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
          facing: facing || undefined,
          viewType: viewType || undefined,
          cornerUnit,
          basePricePaise,
          priceOnRequest,
          status,
          visibility,
          internalNotes,
        });

        if (!res.success) {
          setError(res.message);
        } else {
          router.push(`/dashboard/inventory/${res.unitId}`);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 1. Hierarchy & Identification */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold font-serif text-[#071a28] pb-3 border-b border-[rgba(7,26,40,0.06)]">
          1. Property Hierarchy & Unit Identification
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Parent Property / Township *</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              disabled={isEdit || isPending}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28]"
            >
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Unit / Plot Number *</label>
            <input
              type="text"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              placeholder="e.g. A-402 or Plot-84"
              required
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-bold text-[#071a28]"
            />
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Phase / Sector (Optional)</label>
            <input
              type="text"
              value={phaseName}
              onChange={(e) => setPhaseName(e.target.value)}
              placeholder="e.g. Phase 1 or Sector 4"
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Tower / Block (Optional)</label>
            <input
              type="text"
              value={towerBlockSector}
              onChange={(e) => setTowerBlockSector(e.target.value)}
              placeholder="e.g. Tower A or Block C"
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs"
            />
          </div>

          {!isPlot && (
            <div>
              <label className="font-bold text-[#071a28] block mb-1.5">Floor / Level (Optional)</label>
              <input
                type="text"
                value={floorLevel}
                onChange={(e) => setFloorLevel(e.target.value)}
                placeholder="e.g. 4th Floor or Ground"
                disabled={isPending}
                className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Category & Physical Specs */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold font-serif text-[#071a28] pb-3 border-b border-[rgba(7,26,40,0.06)]">
          2. Category, Configuration & Dimensions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Unit Category *</label>
            <select
              value={unitCategory}
              onChange={(e) => setUnitCategory(e.target.value as UnitCategory)}
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28]"
            >
              {UNIT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Configuration *</label>
            <select
              value={configuration}
              onChange={(e) => setConfiguration(e.target.value as UnitConfiguration)}
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28]"
            >
              {UNIT_CONFIGURATIONS.map((cfg) => (
                <option key={cfg} value={cfg}>
                  {cfg.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Facing Direction</label>
            <select
              value={facing}
              onChange={(e) => setFacing(e.target.value)}
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28]"
            >
              <option value="">Unspecified</option>
              {FACING_DIRECTIONS.map((f) => (
                <option key={f} value={f}>
                  {f.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {isPlot ? (
            <div>
              <label className="font-bold text-[#071a28] block mb-1.5">Plot Area (Sq.Ft) *</label>
              <input
                type="number"
                value={plotAreaSqFt}
                onChange={(e) => setPlotAreaSqFt(e.target.value)}
                placeholder="e.g. 1800"
                required
                disabled={isPending}
                className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-bold"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="font-bold text-[#071a28] block mb-1.5">Super Built-up Area (Sq.Ft)</label>
                <input
                  type="number"
                  value={superBuiltUpAreaSqFt}
                  onChange={(e) => setSuperBuiltUpAreaSqFt(e.target.value)}
                  placeholder="e.g. 1450"
                  disabled={isPending}
                  className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#071a28] block mb-1.5">Carpet Area (Sq.Ft)</label>
                <input
                  type="number"
                  value={carpetAreaSqFt}
                  onChange={(e) => setCarpetAreaSqFt(e.target.value)}
                  placeholder="e.g. 1100"
                  disabled={isPending}
                  className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#071a28] block mb-1.5">Terrace Area (Sq.Ft)</label>
                <input
                  type="number"
                  value={terraceAreaSqFt}
                  onChange={(e) => setTerraceAreaSqFt(e.target.value)}
                  placeholder="e.g. 180"
                  disabled={isPending}
                  className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#071a28] block mb-1.5">Chargeable Area (Sq.Ft)</label>
                <input
                  type="number"
                  value={chargeableAreaSqFt}
                  onChange={(e) => setChargeableAreaSqFt(e.target.value)}
                  placeholder="e.g. 1550"
                  disabled={isPending}
                  className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs"
                />
              </div>
            </>
          )}

          {isResidentialBuilding && (
            <>
              <div>
                <label className="font-bold text-[#071a28] block mb-1.5">Bedrooms</label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="e.g. 3"
                  disabled={isPending}
                  className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#071a28] block mb-1.5">Bathrooms</label>
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  placeholder="e.g. 3"
                  disabled={isPending}
                  className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="cornerUnit"
            checked={cornerUnit}
            onChange={(e) => setCornerUnit(e.target.checked)}
            disabled={isPending}
            className="rounded border-[rgba(7,26,40,0.2)] text-[#087fc3] focus:ring-[#087fc3]"
          />
          <label htmlFor="cornerUnit" className="text-xs font-semibold text-[#071a28]">
            Corner Plot / Unit (Two or more open sides)
          </label>
        </div>
      </div>

      {/* 3. Pricing & Public Visibility */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold font-serif text-[#071a28] pb-3 border-b border-[rgba(7,26,40,0.06)]">
          3. Pricing & Public Visibility
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Base Price (INR Rupees)</label>
            <input
              type="number"
              value={basePriceRupees}
              onChange={(e) => setBasePriceRupees(e.target.value)}
              placeholder="e.g. 6500000"
              disabled={isPending || priceOnRequest}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Public Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as UnitVisibility)}
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold"
            >
              {UNIT_VISIBILITIES.map((v) => (
                <option key={v} value={v}>
                  {v.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <div>
              <label className="font-bold text-[#071a28] block mb-1.5">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UnitStatus)}
                disabled={isPending}
                className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold"
              >
                {UNIT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="priceOnRequest"
            checked={priceOnRequest}
            onChange={(e) => setPriceOnRequest(e.target.checked)}
            disabled={isPending}
            className="rounded border-[rgba(7,26,40,0.2)] text-[#087fc3] focus:ring-[#087fc3]"
          />
          <label htmlFor="priceOnRequest" className="text-xs font-semibold text-[#071a28]">
            Price on Request (Do not publish numeric price publicly)
          </label>
        </div>

        <div>
          <label className="font-bold text-[#071a28] block mb-1.5 text-xs">Internal Notes (Confidential)</label>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={3}
            placeholder="Confidential notes, registry status, or specific buyer constraints…"
            disabled={isPending}
            className="w-full p-3 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-medium text-[#071a28]"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/inventory"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#647581] hover:text-[#071a28] text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isEdit ? "Save Changes" : "Create Inventory Unit"}</span>
        </button>
      </div>
    </form>
  );
}
