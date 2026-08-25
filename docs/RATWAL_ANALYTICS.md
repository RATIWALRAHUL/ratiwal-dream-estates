# Ratiwal Dream Estates — Business Analytics, Sales Funnel Intelligence & Reporting

## 1. Architectural Principles & Integrity Invariants

PRD 10 establishes a database-backed, privacy-safe, and verifiable analytics, sales funnel intelligence, and reporting engine for Ratiwal Dream Estates.

```
┌─────────────────────────────────────────────────────────────┐
│                   Source of Truth Data                      │
│   (Lead, SiteVisit, Property, Location, Delivery, Audit)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Analytics Query Service                     │
│    • Bounded Date-Range Aggregations                        │
│    • Real-time Conversions & Sales Funnel Drop-offs         │
│    • Human First-Response Time (Excludes Auto-Bots)         │
│    • Equal-Duration Period Comparison with Honest Trends    │
│    • Append-Only Stage Duration Tracking                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────┐         ┌───────────────────────────┐
│     Analytics Hub UIs     │         │   Report Export Engine    │
│ • Executive Overview      │         │ • Tabular Paginated Views │
│ • Sales Funnel Breakdown  │         │ • Allowlisted Columns     │
│ • Property & Region Demand│         │ • Formula-Injection Safe  │
│ • Advisor Workload & SLAs │         │ • Rate-Limited CSV Stream │
│ • Site Visit Outcomes     │         └───────────────────────────┘
│ • Data Quality Scanner    │
└───────────────────────────┘
```

---

## 2. Central Metric Dictionary

| Metric Key | Name | Business Formula / Definition | Included Statuses | Excluded Statuses |
|---|---|---|---|---|
| `TOTAL_INQUIRIES` | Total Inquiries | Count of all raw inquiries captured in date range | `ALL` | None |
| `VALID_INQUIRIES` | Valid Inquiries | Non-spam legitimate prospect inquiries | `NEW`, `CONTACTED`, `QUALIFIED`, `NURTURING`, `NEGOTIATING`, `WON`, `LOST` | `SPAM` |
| `QUALIFIED_LEADS` | Qualified Prospects | Verified budget and location intent | `QUALIFIED`, `NURTURING`, `NEGOTIATING`, `WON` | `NEW`, `CONTACTED`, `LOST`, `SPAM` |
| `AVG_FIRST_RESPONSE_TIME` | Avg Human First Response | Hours from inquiry to first human staff interaction | `ALL` | Automated bot events |
| `SITE_VISIT_COMPLETION_RATE` | Tour Completion Rate | Completed tours / Concluded tours (Completed + Cancelled + No Show) | `COMPLETED` | `REQUESTED`, `CONFIRMED` |
| `LEAD_TO_VISIT_CONVERSION` | Lead to Tour Conversion | Unique leads with $\ge 1$ SiteVisit / Total Valid Leads | `ALL` | `SPAM` |
| `COMMUNICATION_DELIVERY_RATE` | Delivery Success Rate | Delivered + Read / Total Attempted dispatches | `DELIVERED`, `READ` | `CANCELLED`, `QUEUED` |

---

## 3. Human Response-Time Definition

First-response time is computed **strictly from human staff actions**:
1. `LEAD_ASSIGNED` / Staff Allocation
2. `CONTACT_ATTEMPTED` (Logged call, message, or email in CRM)
3. `STATUS_CHANGED` (Staff updating stage from `NEW` to active)
4. `VISIT_CONFIRMED`

> **Critical Rule**: Automated customer acknowledgements and transactional delivery webhooks are **excluded** from response-time SLAs.

---

## 4. Sales Funnel & Stage Duration Protocol

- **Append-Only History Model**: [`LeadStageHistory`](../src/models/LeadStageHistory.ts) records every stage transition with microsecond precision.
- **Stage Progression Order**: `NEW` $\rightarrow$ `CONTACTED` $\rightarrow$ `QUALIFIED` $\rightarrow$ `NURTURING` $\rightarrow$ `NEGOTIATING` $\rightarrow$ `WON`.
- **Honest Historical Boundaries**: Stage duration coverage active from baseline `2026-08-25`. Historical records prior to this timestamp display `Not available` with a visible baseline badge.

---

## 5. Security, RBAC & CSV Export Protection

### 5.1 Role-Based Access Control (RBAC)
- **Super Admin & Admin**: Complete visibility across organizational metrics, all advisor workloads, and full report exports.
- **Editor (Advisor)**: Scoped strictly to their own assigned prospects, follow-up calendar, and tours.

### 5.2 CSV Injection Protection
All tabular CSV exports sanitize every cell against spreadsheet formula injection:
```typescript
if (/^[=+\-@\t\r]/.test(cellValue)) {
  cellValue = `'${cellValue}`;
}
```
Exports enforce column allowlists, rate limiting (10 exports/min), and audit logging.

---

## 6. Report Catalogue

Accessible at `/dashboard/reports`:
1. **Inquiry Register** (`INQUIRY_REPORT`)
2. **Lead Pipeline Report** (`LEAD_PIPELINE_REPORT`)
3. **Follow-Up Health** (`LEAD_FOLLOWUP_REPORT`)
4. **Advisor Workload** (`ADVISOR_WORKLOAD_REPORT`)
5. **Site Visit Register** (`SITE_VISIT_REPORT`)
6. **Property Demand** (`PROPERTY_DEMAND_REPORT`)
7. **Location Demand** (`LOCATION_DEMAND_REPORT`)
8. **Communication Deliveries** (`COMMUNICATION_DELIVERY_REPORT`)
9. **Data Quality Exceptions** (`DATA_QUALITY_REPORT`)
