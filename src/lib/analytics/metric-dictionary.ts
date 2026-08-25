/**
 * @file metric-dictionary.ts
 * @description Centralized, typed metric catalogue for Ratiwal Dream Estates.
 * Defines business formulas, numerators, denominators, inclusion rules,
 * date fields, empty-data handling, and RBAC permissions.
 */

export interface MetricDefinition {
  key: string;
  name: string;
  category: "INQUIRY" | "LEAD" | "SITE_VISIT" | "COMMUNICATION" | "TEAM" | "QUALITY";
  businessDefinition: string;
  numerator: string;
  denominator: string | null;
  includedStatuses: string[];
  excludedStatuses: string[];
  dateFieldUsed: string;
  requiredFilters: string[];
  permissionRequirement: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
  comparisonSupported: boolean;
  emptyDataBehavior: string;
  formatRule: "INTEGER" | "PERCENTAGE" | "HOURS" | "CURRENCY" | "TEXT";
  dataFreshness: "REAL_TIME" | "BATCH_5M";
  knownLimitations: string;
}

export const METRIC_DICTIONARY: Record<string, MetricDefinition> = {
  TOTAL_INQUIRIES: {
    key: "TOTAL_INQUIRIES",
    name: "Total Inquiries Captured",
    category: "INQUIRY",
    businessDefinition: "Total public inquiry submissions captured within the specified period.",
    numerator: "Count of all Lead documents created in date range",
    denominator: null,
    includedStatuses: ["ALL"],
    excludedStatuses: [],
    dateFieldUsed: "createdAt",
    requiredFilters: [],
    permissionRequirement: "EDITOR",
    comparisonSupported: true,
    emptyDataBehavior: "Displays 0",
    formatRule: "INTEGER",
    dataFreshness: "REAL_TIME",
    knownLimitations: "Includes raw unverified submissions before spam filtering.",
  },
  VALID_INQUIRIES: {
    key: "VALID_INQUIRIES",
    name: "Valid Inquiries",
    category: "INQUIRY",
    businessDefinition: "Inquiries validated as legitimate prospect inquiries excluding confirmed/suspected spam.",
    numerator: "Count of Leads with abuseStatus == 'CLEAN' and status != 'SPAM'",
    denominator: null,
    includedStatuses: ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "NEGOTIATING", "WON", "LOST"],
    excludedStatuses: ["SPAM"],
    dateFieldUsed: "createdAt",
    requiredFilters: [],
    permissionRequirement: "EDITOR",
    comparisonSupported: true,
    emptyDataBehavior: "Displays 0",
    formatRule: "INTEGER",
    dataFreshness: "REAL_TIME",
    knownLimitations: "Spam classification relies on heuristic honeypots and link density.",
  },
  QUALIFIED_LEADS: {
    key: "QUALIFIED_LEADS",
    name: "Qualified Leads",
    category: "LEAD",
    businessDefinition: "Leads that have passed initial advisor screening and have verified budget/location intent.",
    numerator: "Count of Leads in QUALIFIED status or advanced beyond QUALIFIED",
    denominator: null,
    includedStatuses: ["QUALIFIED", "NURTURING", "NEGOTIATING", "WON"],
    excludedStatuses: ["NEW", "CONTACTED", "LOST", "SPAM", "ARCHIVED"],
    dateFieldUsed: "createdAt / stageHistory.changedAt",
    requiredFilters: [],
    permissionRequirement: "EDITOR",
    comparisonSupported: true,
    emptyDataBehavior: "Displays 0",
    formatRule: "INTEGER",
    dataFreshness: "REAL_TIME",
    knownLimitations: "Reflects advisor qualification judgment.",
  },
  AVG_FIRST_RESPONSE_TIME: {
    key: "AVG_FIRST_RESPONSE_TIME",
    name: "Average First Human Response Time",
    category: "TEAM",
    businessDefinition: "Average duration in hours from inquiry creation until the first human advisor action (contact logged, assignment, or status update).",
    numerator: "Sum of (firstHumanActionTimestamp - inquiryCreatedAt) in hours",
    denominator: "Total leads with at least one human interaction",
    includedStatuses: ["ALL"],
    excludedStatuses: ["SPAM", "ARCHIVED"],
    dateFieldUsed: "createdAt",
    requiredFilters: [],
    permissionRequirement: "EDITOR",
    comparisonSupported: true,
    emptyDataBehavior: "Displays 'Not available'",
    formatRule: "HOURS",
    dataFreshness: "REAL_TIME",
    knownLimitations: "Automated acknowledgements (emails, SMS) are strictly excluded from response time.",
  },
  SITE_VISIT_COMPLETION_RATE: {
    key: "SITE_VISIT_COMPLETION_RATE",
    name: "Site Visit Completion Rate",
    category: "SITE_VISIT",
    businessDefinition: "Percentage of confirmed site visits that were successfully completed with a documented outcome.",
    numerator: "Count of SiteVisits with status == 'COMPLETED'",
    denominator: "Count of SiteVisits with status in ['COMPLETED', 'CANCELLED', 'NO_SHOW']",
    includedStatuses: ["COMPLETED", "CANCELLED", "NO_SHOW"],
    excludedStatuses: ["REQUESTED", "PENDING_CONFIRMATION", "CONFIRMED"],
    dateFieldUsed: "scheduledStartAt",
    requiredFilters: [],
    permissionRequirement: "EDITOR",
    comparisonSupported: true,
    emptyDataBehavior: "Displays 'No visits in period'",
    formatRule: "PERCENTAGE",
    dataFreshness: "REAL_TIME",
    knownLimitations: "Requires staff to log visit outcomes in the site-visit manager.",
  },
  LEAD_TO_VISIT_CONVERSION_RATE: {
    key: "LEAD_TO_VISIT_CONVERSION_RATE",
    name: "Lead to Site Visit Conversion",
    category: "LEAD",
    businessDefinition: "Percentage of valid captured leads that resulted in at least one requested or confirmed site visit.",
    numerator: "Count of unique Leads associated with at least one SiteVisit",
    denominator: "Count of valid Leads created in the specified period",
    includedStatuses: ["ALL"],
    excludedStatuses: ["SPAM"],
    dateFieldUsed: "createdAt",
    requiredFilters: [],
    permissionRequirement: "EDITOR",
    comparisonSupported: true,
    emptyDataBehavior: "Displays '0%'",
    formatRule: "PERCENTAGE",
    dataFreshness: "REAL_TIME",
    knownLimitations: "Multiple visits by the same lead count once towards the lead conversion denominator.",
  },
  COMMUNICATION_DELIVERY_RATE: {
    key: "COMMUNICATION_DELIVERY_RATE",
    name: "Communication Delivery Success Rate",
    category: "COMMUNICATION",
    businessDefinition: "Percentage of transactional outbox dispatches confirmed as successfully delivered by provider webhooks.",
    numerator: "Count of NotificationDelivery records with status in ['DELIVERED', 'READ']",
    denominator: "Count of NotificationDelivery records with status in ['SENT', 'DELIVERED', 'READ', 'FAILED', 'BOUNCED']",
    includedStatuses: ["DELIVERED", "READ", "FAILED", "BOUNCED"],
    excludedStatuses: ["QUEUED", "SENDING", "CANCELLED"],
    dateFieldUsed: "createdAt",
    requiredFilters: [],
    permissionRequirement: "ADMIN",
    comparisonSupported: true,
    emptyDataBehavior: "Displays '100%'",
    formatRule: "PERCENTAGE",
    dataFreshness: "REAL_TIME",
    knownLimitations: "Email read receipts require provider support; WhatsApp read statuses rely on user read receipts enabled.",
  },
};
