# Ratiwal Dream Estates — Property Inventory, Units, Availability & Pricing Management

## 1. Architectural Architecture & Domain Overview

PRD 13 establishes a concurrency-safe, database-backed inventory layer for individual sellable units across residential towers, plotted developments, villas, and commercial spaces.

```
┌──────────────────────────────────────────────────────────────┐
│                    Inventory Hierarchy                       │
│    Property/Township  ──►  Phase (opt) ──► Tower/Block (opt) │
│                       ──►  Floor (opt)  ──► Unit/Plot Number │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    Inventory Unit Entity                     │
│    • Deterministic Key: PROP_ID::PHASE::TOWER::FLOOR::UNIT   │
│    • Unique Reference Code: RDE-UNT-XXXX / RDE-PLT-XXXX      │
│    • Physical Specs: Carpet/Super/Plot Areas, Facing, Corner │
│    • Integer Paise Pricing: Base, PLC, Floor Rise, Parking   │
│    • Optimistic Concurrency: Atomic version matching         │
└──────────────────────────────┬───────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│   Status Lifecycle Log    │         │     Price History Log     │
│ • Valid Transition Matrix │         │ • Previous/New Snapshots  │
│ • Append-Only Ledger      │         │ • Reason Code & Comments  │
│ • Reservation Readiness   │         │ • Discount Ceilings (RBAC)│
└───────────────────────────┘         └───────────────────────────┘
```

---

## 2. Supported Inventory Modes

In the `Property` model, `inventoryMode` defines how sellable assets are represented:

1. **`SINGLE_LISTING`**: Default for standalone properties. Zero forced artificial units; uses property-level availability.
2. **`MULTI_UNIT_PROJECT`**: Apartment towers and floor developments.
3. **`PLOT_INVENTORY`**: Plotted developments and township sectors.
4. **`COMMERCIAL_INVENTORY`**: Shops, offices, and showrooms.
5. **`MIXED_INVENTORY`**: Mixed-use commercial and residential developments.

---

## 3. Deterministic Identity & Concurrency Control

- **Compound Unique Index**: `{ propertyId: 1, inventoryKey: 1 }`
- **Key Generation Formula**:
  `PROPERTY_ID::PHASE::TOWER_BLOCK::FLOOR::UNIT_NUMBER`
- **Optimistic Concurrency Control**:
  All mutations check `{ _id: unitId, version: currentVersion }` and atomically apply `$inc: { version: 1 }`. If another user updated the unit in the interim, the operation fails safely with HTTP 409 conflict.

---

## 4. Status Lifecycle & Transition Matrix

```
DRAFT ────────► AVAILABLE ────────► ON_HOLD ────────► RESERVED ────────► BOOKED ────────► SOLD
  │                 │                  ▲                  │                │               │
  │                 ├──────────────────┘                  ├────────────────┘               │
  │                 ▼                                     ▼                                │
  │              BLOCKED / UNAVAILABLE ◄──────────────────┴────────────────────────────────┘
  ▼                 │
ARCHIVED ◄──────────┘
```

### Transition Guard Rules:
- Direct jumps like `DRAFT → SOLD` or `ARCHIVED → SOLD` are rejected.
- Status changes to `ON_HOLD`, `RESERVED`, `BOOKED`, `SOLD` require `SUPER_ADMIN` or `ADMIN` role and a mandatory reason code.
- Advisors (`EDITOR`) have read-only access to available inventory and cannot modify lifecycle status.

---

## 5. Pricing & Safe Money Handling

- **Integer Minor Units**: All monetary values are handled as integer paise (`basePricePaise`, `plcChargePaise`, `discountCeilingPaise`, etc.).
- **Derived Display Currency**: Rupee formatting (`paiseToRupees`) is computed deterministically.
- **Price on Request**: When enabled, hides numeric price tags from public listings while maintaining internal base price records.
- **Append-Only Price History**: Every price change records a timestamped snapshot in [`InventoryPriceHistory`](../src/models/InventoryPriceHistory.ts).

---

## 6. Bulk CSV Import & Export Protections

- **CSV Import Wizard**: Features versioned template download, server-side header normalization, row-level validation, intra-file duplicate detection, and batch execution.
- **Formula-Injection Escaping**: All CSV exports sanitize cells starting with `=`, `+`, `-`, `@`, `\t`, `\r`, or `%` with a prepended single quote `'`.
- **Rate-Limiting & Audit Logging**: 10 exports/minute maximum, logged with `INVENTORY_EXPORT_PERFORMED`.

---

## 7. PRD 14 Reservation Readiness Notes

PRD 13 establishes complete schema and lifecycle readiness for PRD 14 reservation and booking workflows:
- Concurrency holds can be acquired atomically without double-booking.
- Customer ownership, online checkout, payment gateways, and legal KYC remain strictly reserved for PRD 14.
