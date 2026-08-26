/**
 * @file settings-team.ts
 * @description Central typed permission catalogue, roles, data scopes,
 * member statuses, and settings schemas for PRD 10: Settings & Team Management.
 */

// ─── 1. Functional Modules ───────────────────────────────────────────────────

export const SYSTEM_MODULES = [
  "DASHBOARD",
  "PROPERTIES",
  "LOCATIONS",
  "INVENTORY",
  "LEADS",
  "DEALS",
  "RESERVATIONS",
  "BOOKINGS",
  "SITE_VISITS",
  "LEGAL_VAULT",
  "COMMUNICATIONS",
  "ANALYTICS",
  "REPORTS",
  "TEAM",
  "ROLES",
  "SETTINGS",
  "AUDIT_LOGS",
  "KYC",
  "PAYMENTS",
] as const;

export type SystemModule = (typeof SYSTEM_MODULES)[number];

// ─── 2. Granular Actions ─────────────────────────────────────────────────────

export const PERMISSION_ACTIONS = [
  "VIEW",
  "CREATE",
  "UPDATE",
  "ASSIGN",
  "REVIEW",
  "APPROVE",
  "EXPORT",
  "ARCHIVE",
  "RESTORE",
  "MANAGE",
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

// ─── 3. Data Scopes ──────────────────────────────────────────────────────────

export const DATA_SCOPES = [
  "OWN",
  "ASSIGNED",
  "TEAM",
  "SELECTED_PROPERTIES",
  "SELECTED_LOCATIONS",
  "ALL_ORGANIZATION",
] as const;

export type DataScope = (typeof DATA_SCOPES)[number];

// ─── 4. Member Lifecycle Statuses ────────────────────────────────────────────

export const MEMBER_STATUSES = [
  "INVITED",
  "ACTIVE",
  "SUSPENDED",
  "DEACTIVATED",
  "INVITATION_EXPIRED",
  "INVITATION_REVOKED",
] as const;

export type MemberStatus = (typeof MEMBER_STATUSES)[number];

// ─── 5. Permission Definition & Catalogue ────────────────────────────────────

export interface PermissionDefinition {
  key: string;
  module: SystemModule;
  action: PermissionAction;
  displayName: string;
  description: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  supportedScopes: DataScope[];
  dependencies: string[]; // Other permission keys required
  isCustomAssignable: boolean;
}

export const PERMISSION_CATALOGUE: Record<string, PermissionDefinition> = {
  // ── DASHBOARD ──
  "DASHBOARD_VIEW": {
    key: "DASHBOARD_VIEW",
    module: "DASHBOARD",
    action: "VIEW",
    displayName: "View Dashboard Overview",
    description: "Access executive summary metrics and high-level KPIs.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED"],
    dependencies: [],
    isCustomAssignable: true,
  },

  // ── PROPERTIES ──
  "PROPERTIES_VIEW": {
    key: "PROPERTIES_VIEW",
    module: "PROPERTIES",
    action: "VIEW",
    displayName: "View Properties",
    description: "View published and draft property listings and layouts.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "SELECTED_PROPERTIES"],
    dependencies: [],
    isCustomAssignable: true,
  },
  "PROPERTIES_CREATE": {
    key: "PROPERTIES_CREATE",
    module: "PROPERTIES",
    action: "CREATE",
    displayName: "Create Properties",
    description: "Draft new township developments and property projects.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["PROPERTIES_VIEW"],
    isCustomAssignable: true,
  },
  "PROPERTIES_UPDATE": {
    key: "PROPERTIES_UPDATE",
    module: "PROPERTIES",
    action: "UPDATE",
    displayName: "Edit Properties",
    description: "Modify property specifications, pricing structures, and media.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION", "SELECTED_PROPERTIES"],
    dependencies: ["PROPERTIES_VIEW"],
    isCustomAssignable: true,
  },
  "PROPERTIES_PUBLISH": {
    key: "PROPERTIES_PUBLISH",
    module: "PROPERTIES",
    action: "APPROVE",
    displayName: "Publish Properties",
    description: "Publish or unpublish properties on the public website.",
    riskLevel: "HIGH",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["PROPERTIES_VIEW", "PROPERTIES_UPDATE"],
    isCustomAssignable: true,
  },

  // ── LOCATIONS ──
  "LOCATIONS_VIEW": {
    key: "LOCATIONS_VIEW",
    module: "LOCATIONS",
    action: "VIEW",
    displayName: "View Locations",
    description: "View regional micro-market nodes and infrastructure hubs.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "SELECTED_LOCATIONS"],
    dependencies: [],
    isCustomAssignable: true,
  },
  "LOCATIONS_MANAGE": {
    key: "LOCATIONS_MANAGE",
    module: "LOCATIONS",
    action: "MANAGE",
    displayName: "Manage Locations",
    description: "Create, edit, and publish regional nodes and connectivity milestones.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["LOCATIONS_VIEW"],
    isCustomAssignable: true,
  },

  // ── INVENTORY & PLOTS ──
  "INVENTORY_VIEW": {
    key: "INVENTORY_VIEW",
    module: "INVENTORY",
    action: "VIEW",
    displayName: "View Inventory & Plot Units",
    description: "Access plot inventory matrices, dimensions, and availability status.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "SELECTED_PROPERTIES"],
    dependencies: [],
    isCustomAssignable: true,
  },
  "INVENTORY_UPDATE": {
    key: "INVENTORY_UPDATE",
    module: "INVENTORY",
    action: "UPDATE",
    displayName: "Update Unit Status & Pricing",
    description: "Change plot availability (Hold, Booked, Sold) and unit price overrides.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION", "SELECTED_PROPERTIES"],
    dependencies: ["INVENTORY_VIEW"],
    isCustomAssignable: true,
  },
  "INVENTORY_IMPORT": {
    key: "INVENTORY_IMPORT",
    module: "INVENTORY",
    action: "CREATE",
    displayName: "Bulk Import Units",
    description: "Upload and batch process CSV inventory spreadsheets.",
    riskLevel: "HIGH",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["INVENTORY_VIEW", "INVENTORY_UPDATE"],
    isCustomAssignable: true,
  },
  "INVENTORY_EXPORT": {
    key: "INVENTORY_EXPORT",
    module: "INVENTORY",
    action: "EXPORT",
    displayName: "Export Inventory Data",
    description: "Export sanitized CSV unit lists and availability reports.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "SELECTED_PROPERTIES"],
    dependencies: ["INVENTORY_VIEW"],
    isCustomAssignable: true,
  },

  // ── LEADS & INQUIRIES ──
  "LEADS_VIEW": {
    key: "LEADS_VIEW",
    module: "LEADS",
    action: "VIEW",
    displayName: "View Inquiries & Leads",
    description: "View CRM prospects, inquiries, and stage progression.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: [],
    isCustomAssignable: true,
  },
  "LEADS_MANAGE": {
    key: "LEADS_MANAGE",
    module: "LEADS",
    action: "UPDATE",
    displayName: "Manage & Update Leads",
    description: "Update stage, log activity, record follow-ups, and add notes.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: ["LEADS_VIEW"],
    isCustomAssignable: true,
  },
  "LEADS_ASSIGN": {
    key: "LEADS_ASSIGN",
    module: "LEADS",
    action: "ASSIGN",
    displayName: "Assign & Reassign Leads",
    description: "Assign prospective buyers to advisors and reallocate pipelines.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION", "TEAM"],
    dependencies: ["LEADS_VIEW"],
    isCustomAssignable: true,
  },
  "LEADS_EXPORT": {
    key: "LEADS_EXPORT",
    module: "LEADS",
    action: "EXPORT",
    displayName: "Export Leads (Masked PII)",
    description: "Export sanitized lead spreadsheets with audit logging.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION", "TEAM"],
    dependencies: ["LEADS_VIEW"],
    isCustomAssignable: true,
  },

  // ── DEALS & OFFERS ──
  "DEALS_VIEW": {
    key: "DEALS_VIEW",
    module: "DEALS",
    action: "VIEW",
    displayName: "View Deals & Opportunities",
    description: "Inspect active deals, pipeline stages, and customer offers.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: [],
    isCustomAssignable: true,
  },
  "DEALS_CREATE": {
    key: "DEALS_CREATE",
    module: "DEALS",
    action: "CREATE",
    displayName: "Create Deals",
    description: "Convert qualified leads into active deal opportunities.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: ["DEALS_VIEW"],
    isCustomAssignable: true,
  },
  "DEALS_MANAGE": {
    key: "DEALS_MANAGE",
    module: "DEALS",
    action: "UPDATE",
    displayName: "Manage & Progress Deals",
    description: "Update deal stages, assign units, and record lost/won outcomes.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: ["DEALS_VIEW"],
    isCustomAssignable: true,
  },
  "OFFERS_MANAGE": {
    key: "OFFERS_MANAGE",
    module: "DEALS",
    action: "UPDATE",
    displayName: "Create & Revise Offers",
    description: "Draft and revise pricing offers for prospective buyers.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: ["DEALS_VIEW"],
    isCustomAssignable: true,
  },
  "DISCOUNT_APPROVE": {
    key: "DISCOUNT_APPROVE",
    module: "DEALS",
    action: "APPROVE",
    displayName: "Approve Discount Exceptions",
    description: "Grant approval for commercial discounts and fee waivers beyond advisor limits.",
    riskLevel: "HIGH",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["DEALS_VIEW"],
    isCustomAssignable: true,
  },
  "HOLDS_MANAGE": {
    key: "HOLDS_MANAGE",
    module: "DEALS",
    action: "MANAGE",
    displayName: "Place & Release Inventory Holds",
    description: "Acquire temporary atomic holds on sellable units.",
    riskLevel: "HIGH",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: ["DEALS_VIEW", "INVENTORY_VIEW"],
    isCustomAssignable: true,
  },

  // ── RESERVATIONS ──
  "RESERVATIONS_MANAGE": {
    key: "RESERVATIONS_MANAGE",
    module: "RESERVATIONS",
    action: "MANAGE",
    displayName: "Manage Reservations",
    description: "Convert holds into reservations and manage reservation lifecycle.",
    riskLevel: "HIGH",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: ["DEALS_VIEW", "HOLDS_MANAGE"],
    isCustomAssignable: true,
  },

  // ── BOOKINGS ──
  "BOOKINGS_CONFIRM": {
    key: "BOOKINGS_CONFIRM",
    module: "BOOKINGS",
    action: "APPROVE",
    displayName: "Confirm Operational Bookings",
    description: "Verify required documentation and confirm operational booking records.",
    riskLevel: "CRITICAL",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["RESERVATIONS_MANAGE"],
    isCustomAssignable: true,
  },
  "BOOKINGS_CANCEL": {
    key: "BOOKINGS_CANCEL",
    module: "BOOKINGS",
    action: "MANAGE",
    displayName: "Cancel Bookings & Release Inventory",
    description: "Authorize booking cancellations and manage post-cancellation inventory release.",
    riskLevel: "CRITICAL",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["BOOKINGS_CONFIRM"],
    isCustomAssignable: true,
  },

  // ── SITE VISITS ──
  "SITE_VISITS_VIEW": {
    key: "SITE_VISITS_VIEW",
    module: "SITE_VISITS",
    action: "VIEW",
    displayName: "View Site Visits",
    description: "Access visit schedules, calendars, and advisor availability.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: [],
    isCustomAssignable: true,
  },
  "SITE_VISITS_MANAGE": {
    key: "SITE_VISITS_MANAGE",
    module: "SITE_VISITS",
    action: "UPDATE",
    displayName: "Schedule & Manage Visits",
    description: "Confirm, reschedule, complete, or cancel property site visits.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: ["SITE_VISITS_VIEW"],
    isCustomAssignable: true,
  },
  "SITE_VISITS_ASSIGN": {
    key: "SITE_VISITS_ASSIGN",
    module: "SITE_VISITS",
    action: "ASSIGN",
    displayName: "Assign Visit Advisors",
    description: "Assign site visit requests to available property advisors.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION", "TEAM"],
    dependencies: ["SITE_VISITS_VIEW"],
    isCustomAssignable: true,
  },

  // ── LEGAL VAULT ──
  "LEGAL_VAULT_VIEW": {
    key: "LEGAL_VAULT_VIEW",
    module: "LEGAL_VAULT",
    action: "VIEW",
    displayName: "View Legal Documents",
    description: "View statutory documents, title deeds, and checklist readiness.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "SELECTED_PROPERTIES"],
    dependencies: [],
    isCustomAssignable: true,
  },
  "LEGAL_VAULT_UPLOAD": {
    key: "LEGAL_VAULT_UPLOAD",
    module: "LEGAL_VAULT",
    action: "CREATE",
    displayName: "Upload Legal Documents",
    description: "Register documents and upload new certified copy versions.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION", "SELECTED_PROPERTIES"],
    dependencies: ["LEGAL_VAULT_VIEW"],
    isCustomAssignable: true,
  },
  "LEGAL_VAULT_REVIEW": {
    key: "LEGAL_VAULT_REVIEW",
    module: "LEGAL_VAULT",
    action: "REVIEW",
    displayName: "Review & Verify Documents",
    description: "Transition documents to Internally Verified, Action Required, or Rejected.",
    riskLevel: "HIGH",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["LEGAL_VAULT_VIEW"],
    isCustomAssignable: true,
  },
  "LEGAL_VAULT_SHARE": {
    key: "LEGAL_VAULT_SHARE",
    module: "LEGAL_VAULT",
    action: "EXPORT",
    displayName: "Generate Expiring External Shares",
    description: "Create time-bounded, download-capped external share links.",
    riskLevel: "HIGH",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["LEGAL_VAULT_VIEW"],
    isCustomAssignable: true,
  },
  "LEGAL_HOLD_MANAGE": {
    key: "LEGAL_HOLD_MANAGE",
    module: "LEGAL_VAULT",
    action: "MANAGE",
    displayName: "Apply & Release Legal Holds",
    description: "Freeze document archival and modifications under statutory hold.",
    riskLevel: "CRITICAL",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["LEGAL_VAULT_VIEW", "LEGAL_VAULT_REVIEW"],
    isCustomAssignable: false,
  },

  // ── COMMUNICATIONS ──
  "COMMUNICATIONS_VIEW": {
    key: "COMMUNICATIONS_VIEW",
    module: "COMMUNICATIONS",
    action: "VIEW",
    displayName: "View Communication Deliveries",
    description: "Monitor email/SMS outbox, deliveries, and suppression lists.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: [],
    isCustomAssignable: true,
  },
  "COMMUNICATIONS_MANAGE": {
    key: "COMMUNICATIONS_MANAGE",
    module: "COMMUNICATIONS",
    action: "MANAGE",
    displayName: "Manage Notification Templates",
    description: "Edit transactional notification templates and delivery rules.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["COMMUNICATIONS_VIEW"],
    isCustomAssignable: true,
  },

  // ── ANALYTICS & REPORTS ──
  "ANALYTICS_VIEW": {
    key: "ANALYTICS_VIEW",
    module: "ANALYTICS",
    action: "VIEW",
    displayName: "View Business Analytics",
    description: "Access conversion funnels, SLA tracking, and team productivity.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: [],
    isCustomAssignable: true,
  },
  "REPORTS_EXPORT": {
    key: "REPORTS_EXPORT",
    module: "REPORTS",
    action: "EXPORT",
    displayName: "Export Analytics Reports",
    description: "Generate and download historical CSV business reports.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION", "TEAM"],
    dependencies: ["ANALYTICS_VIEW"],
    isCustomAssignable: true,
  },

  // ── TEAM & ACCESS CONTROL ──
  "TEAM_VIEW": {
    key: "TEAM_VIEW",
    module: "TEAM",
    action: "VIEW",
    displayName: "View Team Directory",
    description: "View team members, roles, departments, and active statuses.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: [],
    isCustomAssignable: true,
  },
  "TEAM_INVITE": {
    key: "TEAM_INVITE",
    module: "TEAM",
    action: "CREATE",
    displayName: "Invite Team Members",
    description: "Generate secure, hashed team invitation links.",
    riskLevel: "HIGH",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["TEAM_VIEW"],
    isCustomAssignable: true,
  },
  "TEAM_MANAGE": {
    key: "TEAM_MANAGE",
    module: "TEAM",
    action: "MANAGE",
    displayName: "Manage Members & Scopes",
    description: "Update member roles, assign data scopes, suspend, or reactivate.",
    riskLevel: "CRITICAL",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["TEAM_VIEW", "TEAM_INVITE"],
    isCustomAssignable: false,
  },
  "TEAM_HANDOVER": {
    key: "TEAM_HANDOVER",
    module: "TEAM",
    action: "ASSIGN",
    displayName: "Execute Work Handover",
    description: "Batch reassign active leads, site visits, and legal reviews.",
    riskLevel: "HIGH",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["TEAM_VIEW", "TEAM_MANAGE"],
    isCustomAssignable: false,
  },

  // ── ROLES ──
  "ROLES_VIEW": {
    key: "ROLES_VIEW",
    module: "ROLES",
    action: "VIEW",
    displayName: "View Roles & Permission Matrix",
    description: "Inspect system and custom roles and assigned permissions.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: [],
    isCustomAssignable: true,
  },
  "ROLES_MANAGE": {
    key: "ROLES_MANAGE",
    module: "ROLES",
    action: "MANAGE",
    displayName: "Manage Custom Roles",
    description: "Create, edit, clone, and archive custom permission roles.",
    riskLevel: "CRITICAL",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["ROLES_VIEW"],
    isCustomAssignable: false,
  },

  // ── SETTINGS ──
  "SETTINGS_VIEW": {
    key: "SETTINGS_VIEW",
    module: "SETTINGS",
    action: "VIEW",
    displayName: "View Organization Settings",
    description: "View organization profiles, regional formats, and integration health.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: [],
    isCustomAssignable: true,
  },
  "SETTINGS_MANAGE": {
    key: "SETTINGS_MANAGE",
    module: "SETTINGS",
    action: "MANAGE",
    displayName: "Manage System Settings",
    description: "Update general, regional, CRM SLA, site-visit, and security settings.",
    riskLevel: "CRITICAL",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["SETTINGS_VIEW"],
    isCustomAssignable: false,
  },

  // ── AUDIT LOGS ──
  "AUDIT_LOGS_VIEW": {
    key: "AUDIT_LOGS_VIEW",
    module: "AUDIT_LOGS",
    action: "VIEW",
    displayName: "View System Audit Logs",
    description: "Inspect immutable audit trails of all sensitive mutations.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: [],
    isCustomAssignable: true,
  },

  // ── KYC & CUSTOMER IDENTITY ──
  "KYC_VIEW": {
    key: "KYC_VIEW",
    module: "KYC",
    action: "VIEW",
    displayName: "View Customer KYC Cases",
    description: "Access safe, masked customer KYC cases, requirement checklists, and status progress.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: [],
    isCustomAssignable: true,
  },
  "KYC_CREATE": {
    key: "KYC_CREATE",
    module: "KYC",
    action: "CREATE",
    displayName: "Initiate Customer KYC Cases",
    description: "Create new KYC cases from Deals, Reservations, or Bookings and generate submission sessions.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: ["KYC_VIEW"],
    isCustomAssignable: true,
  },
  "KYC_REVIEW": {
    key: "KYC_REVIEW",
    module: "KYC",
    action: "REVIEW",
    displayName: "Review Identity Documents",
    description: "Inspect submitted document versions, request corrections, or flag action-required states.",
    riskLevel: "HIGH",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED"],
    dependencies: ["KYC_VIEW"],
    isCustomAssignable: true,
  },
  "KYC_VERIFY": {
    key: "KYC_VERIFY",
    module: "KYC",
    action: "APPROVE",
    displayName: "Verify & Approve KYC",
    description: "Record internal visual verification, authorized provider results, and complete KYC cases.",
    riskLevel: "CRITICAL",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["KYC_VIEW", "KYC_REVIEW"],
    isCustomAssignable: true,
  },
  "KYC_MANAGE": {
    key: "KYC_MANAGE",
    module: "KYC",
    action: "MANAGE",
    displayName: "Manage KYC Templates & Policy",
    description: "Configure requirement templates, retention rules, legal holds, and run integrity reconciliation.",
    riskLevel: "CRITICAL",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["KYC_VIEW", "KYC_VERIFY"],
    isCustomAssignable: false,
  },
  "KYC_PRIVACY_MANAGE": {
    key: "KYC_PRIVACY_MANAGE",
    module: "KYC",
    action: "MANAGE",
    displayName: "Manage Data-Subject Privacy Requests",
    description: "Review, assess, and execute DPDPA Data Principal access, correction, erasure, and grievance requests.",
    riskLevel: "CRITICAL",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["KYC_VIEW"],
    isCustomAssignable: false,
  },

  // ── PAYMENTS & FINANCIAL OPERATIONS (PRD 16) ──
  "PAYMENTS_VIEW": {
    key: "PAYMENTS_VIEW",
    module: "PAYMENTS",
    action: "VIEW",
    displayName: "View Payment Plans & Transactions",
    description: "Inspect customer payment plans, milestone schedules, transaction ledger, and payment receipts.",
    riskLevel: "LOW",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: [],
    isCustomAssignable: true,
  },
  "PAYMENTS_CREATE": {
    key: "PAYMENTS_CREATE",
    module: "PAYMENTS",
    action: "CREATE",
    displayName: "Create Payment Plans & Orders",
    description: "Draft new milestone payment plans, initiate online payment orders, and submit manual payments.",
    riskLevel: "MEDIUM",
    supportedScopes: ["ALL_ORGANIZATION", "ASSIGNED", "TEAM"],
    dependencies: ["PAYMENTS_VIEW"],
    isCustomAssignable: true,
  },
  "PAYMENTS_APPROVE_PLAN": {
    key: "PAYMENTS_APPROVE_PLAN",
    module: "PAYMENTS",
    action: "APPROVE",
    displayName: "Approve & Activate Payment Plans",
    description: "Validate financial consistency and activate versioned payment plans for bookings.",
    riskLevel: "HIGH",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["PAYMENTS_VIEW"],
    isCustomAssignable: true,
  },
  "PAYMENTS_VERIFY_MANUAL": {
    key: "PAYMENTS_VERIFY_MANUAL",
    module: "PAYMENTS",
    action: "REVIEW",
    displayName: "Verify Offline / Manual Payments",
    description: "Maker-checker verification of bank transfers, cheques, and demand drafts with evidence review.",
    riskLevel: "HIGH",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["PAYMENTS_VIEW"],
    isCustomAssignable: true,
  },
  "PAYMENTS_REFUND_MANAGE": {
    key: "PAYMENTS_REFUND_MANAGE",
    module: "PAYMENTS",
    action: "MANAGE",
    displayName: "Approve & Process Refunds",
    description: "Approve refund requests and trigger idempotent provider and manual refund executions.",
    riskLevel: "CRITICAL",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["PAYMENTS_VIEW"],
    isCustomAssignable: false,
  },
  "PAYMENTS_RECONCILE": {
    key: "PAYMENTS_RECONCILE",
    module: "PAYMENTS",
    action: "MANAGE",
    displayName: "Run Reconciliation Audits",
    description: "Execute automated payment reconciliation and resolve ledger discrepancies.",
    riskLevel: "HIGH",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["PAYMENTS_VIEW"],
    isCustomAssignable: true,
  },
  "PAYMENTS_MANAGE": {
    key: "PAYMENTS_MANAGE",
    module: "PAYMENTS",
    action: "MANAGE",
    displayName: "Manage Payment Settings & Policies",
    description: "Configure payment provider adapters, test modes, receipt disclaimers, and finance policies.",
    riskLevel: "CRITICAL",
    supportedScopes: ["ALL_ORGANIZATION"],
    dependencies: ["PAYMENTS_VIEW"],
    isCustomAssignable: false,
  },
};

// ─── 6. System Roles & Predefined Permission Sets ────────────────────────────

export const SYSTEM_ROLE_KEYS = [
  "SUPER_ADMIN",
  "ADMIN",
  "SALES_MANAGER",
  "ADVISOR",
  "LEGAL_MANAGER",
  "INVENTORY_MANAGER",
] as const;

export type SystemRoleKey = (typeof SYSTEM_ROLE_KEYS)[number];

export const SYSTEM_ROLE_DEFINITIONS: Record<
  SystemRoleKey,
  {
    displayName: string;
    description: string;
    defaultDataScope: DataScope;
    permissions: string[];
  }
> = {
  SUPER_ADMIN: {
    displayName: "Super Administrator",
    description: "Unrestricted master administration across all platform features, settings, and team controls.",
    defaultDataScope: "ALL_ORGANIZATION",
    permissions: Object.keys(PERMISSION_CATALOGUE),
  },

  ADMIN: {
    displayName: "Administrator",
    description: "Full management across properties, inventory, CRM, communications, and reporting.",
    defaultDataScope: "ALL_ORGANIZATION",
    permissions: Object.keys(PERMISSION_CATALOGUE).filter(
      (k) => !["LEGAL_HOLD_MANAGE", "SETTINGS_MANAGE", "ROLES_MANAGE"].includes(k)
    ),
  },

  SALES_MANAGER: {
    displayName: "Sales & CRM Manager",
    description: "Lead assignment, inquiry pipeline tracking, site-visit coordination, and sales analytics.",
    defaultDataScope: "ALL_ORGANIZATION",
    permissions: [
      "DASHBOARD_VIEW",
      "PROPERTIES_VIEW",
      "LOCATIONS_VIEW",
      "INVENTORY_VIEW",
      "LEADS_VIEW",
      "LEADS_MANAGE",
      "LEADS_ASSIGN",
      "LEADS_EXPORT",
      "DEALS_VIEW",
      "DEALS_CREATE",
      "DEALS_MANAGE",
      "OFFERS_MANAGE",
      "DISCOUNT_APPROVE",
      "HOLDS_MANAGE",
      "RESERVATIONS_MANAGE",
      "BOOKINGS_CONFIRM",
      "SITE_VISITS_VIEW",
      "SITE_VISITS_MANAGE",
      "SITE_VISITS_ASSIGN",
      "ANALYTICS_VIEW",
      "REPORTS_EXPORT",
      "TEAM_VIEW",
    ],
  },

  ADVISOR: {
    displayName: "Property Advisor",
    description: "Direct prospect interaction, assigned lead follow-ups, and scheduled site-visit execution.",
    defaultDataScope: "ASSIGNED",
    permissions: [
      "DASHBOARD_VIEW",
      "PROPERTIES_VIEW",
      "LOCATIONS_VIEW",
      "INVENTORY_VIEW",
      "LEADS_VIEW",
      "LEADS_MANAGE",
      "DEALS_VIEW",
      "DEALS_CREATE",
      "DEALS_MANAGE",
      "OFFERS_MANAGE",
      "HOLDS_MANAGE",
      "SITE_VISITS_VIEW",
      "SITE_VISITS_MANAGE",
      "ANALYTICS_VIEW",
    ],
  },

  LEGAL_MANAGER: {
    displayName: "Legal & Compliance Manager",
    description: "Statutory title chain verification, JDA/RERA compliance checklists, and secure external sharing.",
    defaultDataScope: "ALL_ORGANIZATION",
    permissions: [
      "DASHBOARD_VIEW",
      "PROPERTIES_VIEW",
      "LOCATIONS_VIEW",
      "LEGAL_VAULT_VIEW",
      "LEGAL_VAULT_UPLOAD",
      "LEGAL_VAULT_REVIEW",
      "LEGAL_VAULT_SHARE",
      "LEGAL_HOLD_MANAGE",
      "AUDIT_LOGS_VIEW",
    ],
  },

  INVENTORY_MANAGER: {
    displayName: "Inventory & Plotting Manager",
    description: "Plot matrix management, unit dimension overrides, pricing sheets, and bulk spreadsheet imports.",
    defaultDataScope: "ALL_ORGANIZATION",
    permissions: [
      "DASHBOARD_VIEW",
      "PROPERTIES_VIEW",
      "LOCATIONS_VIEW",
      "INVENTORY_VIEW",
      "INVENTORY_UPDATE",
      "INVENTORY_IMPORT",
      "INVENTORY_EXPORT",
      "REPORTS_EXPORT",
    ],
  },
};

/**
 * Validates permission dependencies (e.g. checking that UPDATE implies VIEW).
 */
export function validatePermissionDependencies(permissionKeys: string[]): {
  isValid: boolean;
  missingDependencies: { permission: string; requires: string }[];
} {
  const currentSet = new Set(permissionKeys);
  const missing: { permission: string; requires: string }[] = [];

  for (const key of permissionKeys) {
    const def = PERMISSION_CATALOGUE[key];
    if (def) {
      for (const dep of def.dependencies) {
        if (!currentSet.has(dep)) {
          missing.push({ permission: key, requires: dep });
        }
      }
    }
  }

  return {
    isValid: missing.length === 0,
    missingDependencies: missing,
  };
}

// ─── 7. Organization Settings Interfaces ─────────────────────────────────────

export interface GeneralSettings {
  orgDisplayName: string;
  legalBusinessName: string;
  supportEmail: string;
  supportPhone: string;
  registeredOfficeAddress: string;
  websiteUrl: string;
  companyRegistrationNumber?: string;
  gstNumber?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export interface RegionalSettings {
  businessTimezone: string; // e.g. "Asia/Kolkata"
  locale: string; // e.g. "en-IN"
  defaultCurrency: string; // "INR"
  areaMeasurementUnit: "SQ_YD" | "SQ_FT" | "SQ_M" | "ACRES" | "BIGHA";
  phoneCountryDefault: string; // "+91"
  businessWorkingDays: string[]; // ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
  businessWorkingHoursStart: string; // "09:00"
  businessWorkingHoursEnd: string; // "19:00"
}

export interface LeadCrmSettings {
  defaultAssignmentStrategy: "ROUND_ROBIN" | "MANUAL" | "LEAST_ACTIVE";
  firstResponseSlaHours: number;
  followUpReminderHours: number;
  inactivityThresholdDays: number;
  duplicateDetectionWindowDays: number;
  unassignedLeadEscalationHours: number;
}

export interface SiteVisitSettings {
  defaultDurationMinutes: number; // 60
  minSchedulingNoticeHours: number; // 4
  maxAdvanceBookingDays: number; // 30
  rescheduleLimitPerVisit: number; // 3
  reminderWindowHours: number; // 24
}

export interface LegalVaultSettings {
  maxUploadSizeBytes: number; // 26214400 (25MB)
  defaultClassification: "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  reviewDueWindowDays: number; // 14
  expiryReminderDays: number; // 30
  externalSharingEnabled: boolean;
  maxShareDurationHours: number; // 168 (7 days)
  maxShareDownloads: number; // 10
}

export interface SecuritySettings {
  invitationTtlHours: number; // 72
  invitationResendCooldownSeconds: number; // 60
  maxLoginAttempts: number; // 5
  sessionDurationDays: number; // 7
  requireReauthForSensitiveActions: boolean;
}

export interface IntegrationStatusSummary {
  providerKey: string;
  displayName: string;
  category: "EMAIL" | "STORAGE" | "DATABASE" | "MESSAGING" | "MAPS";
  status: "CONFIGURED" | "PARTIALLY_CONFIGURED" | "NOT_CONFIGURED" | "SIMULATOR";
  safeDescription: string;
  lastCheckedAt: string;
}
