/**
 * @file analytics.ts
 * @description Client-safe type definitions for PRD 10: Business Analytics,
 * Sales Funnel Intelligence, Report Centre, and Data Quality Auditing.
 */

import { LeadSource, LeadStatus, LostReason } from "@/types/lead";
import { SiteVisitStatus, CancellationReason } from "@/types/site-visit";
import { NotificationChannel, DeliveryStatus } from "@/types/communication";

// ─── Preset Date Ranges ───────────────────────────────────────────────────────

export const ANALYTICS_DATE_PRESETS = [
  "TODAY",
  "YESTERDAY",
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "THIS_MONTH",
  "LAST_MONTH",
  "LAST_QUARTER",
  "CUSTOM",
] as const;
export type AnalyticsDatePreset = (typeof ANALYTICS_DATE_PRESETS)[number];

export const COMPARISON_MODES = [
  "PREVIOUS_PERIOD", // Equal-duration period immediately preceding
  "PREVIOUS_MONTH",
  "PREVIOUS_YEAR",
  "NONE",
] as const;
export type ComparisonMode = (typeof COMPARISON_MODES)[number];

// ─── Filter Interfaces ────────────────────────────────────────────────────────

export interface AnalyticsFilterParams {
  preset?: AnalyticsDatePreset;
  dateFrom?: string; // ISO string / YYYY-MM-DD
  dateTo?: string; // ISO string / YYYY-MM-DD
  comparisonMode?: ComparisonMode;
  compareDateFrom?: string;
  compareDateTo?: string;
  propertyId?: string;
  locationId?: string;
  advisorId?: string;
  source?: LeadSource | "ALL";
  leadStatus?: LeadStatus | "ALL";
  siteVisitStatus?: SiteVisitStatus | "ALL";
  channel?: NotificationChannel | "ALL";
}

// ─── Metric Representation ────────────────────────────────────────────────────

export interface MetricValue {
  value: number;
  formatted: string;
  previousValue?: number;
  previousFormatted?: string;
  changePercent?: number | null; // null if previous is 0 or not available
  trend?: "UP" | "DOWN" | "FLAT" | "NEW";
  isPositiveChange?: boolean;
  confidence?: "HIGH" | "LOW_SAMPLE" | "UNAVAILABLE";
  subtitle?: string;
  disclaimer?: string;
}

// ─── Overview Analytics Data ──────────────────────────────────────────────────

export interface AnalyticsOverviewData {
  periodLabel: string;
  comparisonLabel: string;
  dateRange: { from: string; to: string };
  comparisonRange?: { from: string; to: string };
  metrics: {
    // Inquiry KPIs
    totalInquiries: MetricValue;
    validInquiries: MetricValue;
    spamInquiries: MetricValue;
    inquiryToLeadRate: MetricValue;

    // Lead KPIs
    totalLeads: MetricValue;
    qualifiedLeads: MetricValue;
    activePipelineLeads: MetricValue;
    unassignedLeads: MetricValue;
    wonLeads: MetricValue;
    lostLeads: MetricValue;
    overdueFollowUps: MetricValue;

    // Response Time KPIs (Human staff actions only)
    avgFirstResponseHours: MetricValue;
    medianFirstResponseHours: MetricValue;
    responseSlaComplianceRate: MetricValue;

    // Site Visit KPIs
    totalSiteVisits: MetricValue;
    completedSiteVisits: MetricValue;
    siteVisitCompletionRate: MetricValue;
    cancelledSiteVisits: MetricValue;
    noShowSiteVisits: MetricValue;
    leadToVisitConversionRate: MetricValue;

    // Communication Health
    communicationDeliveryRate: MetricValue;
    communicationFailureCount: MetricValue;
  };
  timeSeries: {
    dates: string[];
    inquiries: number[];
    leads: number[];
    siteVisits: number[];
    completedVisits: number[];
  };
  sourceDistribution: {
    source: LeadSource;
    label: string;
    count: number;
    percentage: number;
  }[];
  topDemandProperties: {
    propertyId: string;
    title: string;
    slug: string;
    locationName: string;
    inquiryCount: number;
    qualifiedCount: number;
    siteVisitCount: number;
    completedVisitCount: number;
    conversionRate: number;
  }[];
  topDemandLocations: {
    locationId: string;
    name: string;
    slug: string;
    inquiryCount: number;
    leadCount: number;
    siteVisitCount: number;
  }[];
  followUpHealth: {
    dueToday: number;
    overdue: number;
    upcomingNext7Days: number;
    withoutFollowUpScheduled: number;
  };
  advisorWorkloadOverview: {
    advisorId: string;
    advisorName: string;
    activeLeads: number;
    overdueFollowUps: number;
    upcomingVisits: number;
    avgResponseHours: number | null;
  }[];
  dataQualityAlertCount: number;
  lastCalculatedAt: string;
}

// ─── Funnel Analytics Data ────────────────────────────────────────────────────

export interface FunnelStageMetric {
  stage: LeadStatus;
  label: string;
  count: number;
  conversionFromPrevious: number; // Percentage
  conversionFromFirst: number; // Percentage
  dropOffCount: number;
  dropOffPercentage: number;
  avgDurationHours: number | null; // null if legacy data without duration
  medianDurationHours: number | null;
  hasReliableDuration: boolean;
}

export interface FunnelAnalyticsData {
  periodLabel: string;
  totalEntered: number;
  stages: FunnelStageMetric[];
  lostReasonBreakdown: {
    reason: LostReason;
    label: string;
    count: number;
    percentage: number;
  }[];
  stageHistoryCoverageStartDate: string; // ISO date of append-only coverage
  legacyLeadCount: number;
}

// ─── Property & Location Analytics Data ───────────────────────────────────────

export interface PropertyDemandItem {
  propertyId: string;
  title: string;
  slug: string;
  locationName: string;
  propertyType: string;
  inquiryCount: number;
  qualifiedLeadCount: number;
  siteVisitRequestedCount: number;
  siteVisitCompletedCount: number;
  activeLeadsCount: number;
  wonLeadsCount: number;
  inquiryToVisitRate: number;
  latestActivityAt?: string;
  sourceMix: { source: LeadSource; count: number }[];
}

export interface LocationDemandItem {
  locationId: string;
  name: string;
  slug: string;
  state: string;
  inquiryCount: number;
  leadCount: number;
  siteVisitCount: number;
  activePropertiesCount: number;
}

// ─── Advisor Workload Data ────────────────────────────────────────────────────

export interface AdvisorAnalyticsItem {
  advisorId: string;
  advisorName: string;
  advisorEmail: string;
  assignedActiveLeads: number;
  newAssignmentsInPeriod: number;
  overdueFollowUps: number;
  completedFollowUpsInPeriod: number;
  upcomingSiteVisits: number;
  completedSiteVisitsInPeriod: number;
  avgFirstResponseHours: number | null;
  medianFirstResponseHours: number | null;
  responseSlaMetCount: number;
  responseSlaMissedCount: number;
  slaCompliancePercent: number | null;
  wonLeadsCount: number;
  confidence: "HIGH" | "LOW_SAMPLE";
}

// ─── Site Visit Analytics Data ────────────────────────────────────────────────

export interface SiteVisitAnalyticsData {
  periodLabel: string;
  totalRequested: number;
  totalScheduled: number;
  totalConfirmed: number;
  totalCompleted: number;
  totalCancelled: number;
  totalRescheduled: number;
  totalNoShow: number;
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
  avgHoursFromInquiryToVisit: number | null;
  avgHoursFromVisitToFollowUp: number | null;
  cancellationReasonBreakdown: {
    reason: CancellationReason;
    label: string;
    count: number;
    percentage: number;
  }[];
  meetingModeBreakdown: {
    mode: string;
    label: string;
    count: number;
  }[];
}

// ─── Data Quality & Hygiene Audit ─────────────────────────────────────────────

export interface DataQualityIssue {
  id: string;
  category: "LEAD" | "SITE_VISIT" | "PROPERTY" | "COMMUNICATION";
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  description: string;
  affectedCount: number;
  impactOnAnalytics: string;
  navigationHref?: string;
}

export interface DataQualityReport {
  lastScannedAt: string;
  overallScore: number; // 0-100
  totalIssuesCount: number;
  issues: DataQualityIssue[];
  stageHistoryCoverageStartDate: string;
}

// ─── Report Centre & CSV Export ───────────────────────────────────────────────

export const REPORT_TYPES = [
  "INQUIRY_REPORT",
  "LEAD_PIPELINE_REPORT",
  "LEAD_FOLLOWUP_REPORT",
  "ADVISOR_WORKLOAD_REPORT",
  "SITE_VISIT_REPORT",
  "PROPERTY_DEMAND_REPORT",
  "LOCATION_DEMAND_REPORT",
  "COMMUNICATION_DELIVERY_REPORT",
  "DATA_QUALITY_REPORT",
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export interface ReportColumnDefinition {
  key: string;
  label: string;
  description: string;
  category: "IDENTITY" | "METRIC" | "STATUS" | "DATE";
}

export interface ReportExecutionResult {
  reportType: ReportType;
  columns: ReportColumnDefinition[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Record<string, any>[];
  totalRows: number;
  page: number;
  perPage: number;
  totalPages: number;
  generatedAt: string;
}
