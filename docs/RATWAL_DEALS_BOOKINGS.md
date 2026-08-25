# Ratiwal Dream Estates — PRD 14: Deals, Inventory Holds, Reservations & Booking Management

## 1. Executive Summary

PRD 14 establishes an enterprise-grade sales-closure and transaction lifecycle system for Ratiwal Dream Estates. It orchestrates the progression from qualified prospective buyers into closed operational bookings while preventing concurrency conflicts, double holds, and double bookings across sellable units.

---

## 2. Core Entities & Lifecycle

### A. Deal (`Deal`)
- Unique identifier: `RDE-DL-XXXXXX`
- Associated with a Lead, Property, assigned Advisor, and optional Unit.
- 14 Structured Pipeline Stages:
  `DRAFT` → `QUALIFICATION` → `NEGOTIATION` → `OFFER_PENDING_APPROVAL` → `OFFER_APPROVED` → `HOLD_PENDING` → `ON_HOLD` → `RESERVED` → `BOOKING_REQUIREMENTS_PENDING` → `BOOKED` → `WON` (or `LOST` / `CANCELLED` / `ARCHIVED`).
- Optimistic Concurrency Control with atomic version increments.

### B. Versioned Pricing Offer (`DealOffer`)
- Unique identifier: `RDE-OFR-XXXXXX`
- Versioned snapshot of Base Price, PLC, Floor Rise, Parking, Club Charges, and Maintenance.
- Automated commercial discount evaluation: Discounts exceeding 5% or ₹2,00,000 require elevated approval (`DISCOUNT_APPROVE`).
- Customer acceptance tracking (`customerAcceptanceStatus: ACCEPTED`).

### C. Atomic Inventory Hold (`InventoryHold`)
- Unique identifier: `RDE-HLD-XXXXXX`
- Concurrency-safe atomic unit lock (`AVAILABLE → ON_HOLD`) via Mongoose conditional update.
- Concurrency conflict prevention returning HTTP 409 if a unit is concurrently held or modified.
- Standard 72-hour TTL with extension policy (up to 3 extensions) and automated worker expiration.

### D. Unit Reservation (`Reservation`)
- Unique identifier: `RDE-RSV-XXXXXX`
- Converts an active hold into a formal reservation (`ON_HOLD → RESERVED`).
- Freezes agreed contract pricing and verifies prerequisite buyer documentation.

### E. Operational Booking (`Booking`)
- Unique identifier: `RDE-BKG-XXXXXX`
- Locks unit inventory permanently as `SOLD` / `BOOKED`.
- Enforces a 4-point verification checklist (Photo ID, Address documentation, signed application form, and down payment acknowledgment).
- Closes the deal as `WON` while preserving complete audit history.

---

## 3. Concurrency & Data Integrity Guarantees

1. **Optimistic Locking**:
   - Every state transition on `Deal` and `InventoryUnit` checks the current version tag (`{ _id: id, version: expectedVersion }`).
2. **Double Hold / Booking Rejection**:
   - Compound indexes (`{ unitId: 1, status: 1 }`) combined with conditional updates ensure only one active hold or booking exists on a unit.
3. **Append-Only Deal Activity Ledger**:
   - All 22 transaction events (deal created, stage changes, advisor reassignments, hold extensions, cancellations) are appended to `DealActivity`.
4. **Reconciliation Service**:
   - An automated consistency scanner (`DealReconciliationService`) identifies and repairs any orphaned locks or expired holds.

---

## 4. Operational Boundaries & Disclaimers

> [!NOTE]
> Internal holds, reservations, and bookings are operational and commercial management milestones. They do **not** represent automated payment gateway captures, escrow fund settlements, statutory stamp duty registration, or legal title deed conveyance (which are handled in subsequent milestones).

---

## 5. Verification & Test Suite

Run the automated test suite:
```bash
npm run test:deals
```
