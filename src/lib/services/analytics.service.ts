/**
 * @file analytics.service.ts
 * @description Core analytics query engine for Ratiwal Dream Estates.
 * Executes optimized MongoDB aggregations for KPIs, sales funnels,
 * property demand, advisor workload, site visits, and data quality.
 */

import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Lead } from "@/models/Lead";
import { SiteVisit } from "@/models/SiteVisit";
import { Property } from "@/models/Property";
import { Location } from "@/models/Location";
import { NotificationDelivery } from "@/models/NotificationDelivery";
import { LeadStageHistory } from "@/models/LeadStageHistory";
import { AdminSession } from "@/lib/auth/session";
import {
  AnalyticsFilterParams,
  AnalyticsOverviewData,
  FunnelAnalyticsData,
  FunnelStageMetric,
  PropertyDemandItem,
  LocationDemandItem,
  AdvisorAnalyticsItem,
  SiteVisitAnalyticsData,
  DataQualityReport,
  MetricValue,
} from "@/types/analytics";
import { LEAD_STATUSES, LEAD_SOURCES, LOST_REASONS, LeadStatus, LeadSource, LostReason } from "@/types/lead";
import { CANCELLATION_REASONS, CancellationReason } from "@/types/site-visit";
import { Types } from "mongoose";

// Baseline start date for append-only stage history tracking
export const STAGE_HISTORY_COVERAGE_START = "2026-08-25T00:00:00.000Z";

export class AnalyticsService {
  /**
   * Resolves date boundaries (ISO UTC) for presets and calculates equal-duration comparison range.
   */
  public static resolveDateRange(params: AnalyticsFilterParams): {
    current: { from: Date; to: Date; label: string };
    previous: { from: Date; to: Date; label: string };
  } {
    const now = new Date();
    const preset = params.preset || "LAST_30_DAYS";

    let from: Date;
    let to: Date = new Date(now);
    let label = "Last 30 Days";

    if (preset === "TODAY") {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      label = "Today";
    } else if (preset === "YESTERDAY") {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
      to = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      label = "Yesterday";
    } else if (preset === "LAST_7_DAYS") {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      label = "Last 7 Days";
    } else if (preset === "LAST_30_DAYS") {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      label = "Last 30 Days";
    } else if (preset === "THIS_MONTH") {
      from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      label = "This Month";
    } else if (preset === "LAST_MONTH") {
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      label = "Last Month";
    } else if (preset === "LAST_QUARTER") {
      from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      label = "Last 90 Days";
    } else if (preset === "CUSTOM" && params.dateFrom && params.dateTo) {
      from = new Date(params.dateFrom);
      to = new Date(`${params.dateTo}T23:59:59.999Z`);
      label = `${params.dateFrom} to ${params.dateTo}`;
    } else {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Calculate equal-duration preceding period
    const durationMs = to.getTime() - from.getTime();
    const prevTo = new Date(from.getTime() - 1);
    const prevFrom = new Date(prevTo.getTime() - durationMs);
    const prevLabel = "Previous Period";

    return {
      current: { from, to, label },
      previous: { from: prevFrom, to: prevTo, label: prevLabel },
    };
  }

  /**
   * Helper to compute percentage change and trend direction honestly
   */
  private static computeMetricValue(
    currentVal: number,
    prevVal: number | undefined,
    format: "INTEGER" | "PERCENTAGE" | "HOURS" = "INTEGER",
    isPositiveWhenUp: boolean = true
  ): MetricValue {
    let formatted: string;
    if (format === "PERCENTAGE") formatted = `${Math.round(currentVal)}%`;
    else if (format === "HOURS") formatted = `${(Math.round(currentVal * 10) / 10).toFixed(1)} hrs`;
    else formatted = currentVal.toLocaleString("en-IN");

    if (prevVal === undefined) {
      return {
        value: currentVal,
        formatted,
        confidence: "HIGH",
      };
    }

    let previousFormatted: string;
    if (format === "PERCENTAGE") previousFormatted = `${Math.round(prevVal)}%`;
    else if (format === "HOURS") previousFormatted = `${(Math.round(prevVal * 10) / 10).toFixed(1)} hrs`;
    else previousFormatted = prevVal.toLocaleString("en-IN");

    if (prevVal === 0) {
      return {
        value: currentVal,
        formatted,
        previousValue: prevVal,
        previousFormatted,
        changePercent: null,
        trend: currentVal > 0 ? "NEW" : "FLAT",
        isPositiveChange: currentVal > 0 ? isPositiveWhenUp : true,
        confidence: "HIGH",
        disclaimer: "No prior period data",
      };
    }

    const changePercent = Math.round(((currentVal - prevVal) / prevVal) * 100);
    let trend: "UP" | "DOWN" | "FLAT" = "FLAT";
    if (changePercent > 0) trend = "UP";
    else if (changePercent < 0) trend = "DOWN";

    const isPositiveChange = trend === "UP" ? isPositiveWhenUp : !isPositiveWhenUp;

    return {
      value: currentVal,
      formatted,
      previousValue: prevVal,
      previousFormatted,
      changePercent,
      trend,
      isPositiveChange,
      confidence: "HIGH",
    };
  }

  /**
   * 1. Overview Analytics
   */
  public static async getOverviewAnalytics(
    params: AnalyticsFilterParams,
    session: AdminSession
  ): Promise<AnalyticsOverviewData> {
    await connectToDatabase();

    const { current, previous } = this.resolveDateRange(params);

    // Scoping query based on RBAC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const leadQuery: Record<string, any> = {
      createdAt: { $gte: current.from, $lte: current.to },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prevLeadQuery: Record<string, any> = {
      createdAt: { $gte: previous.from, $lte: previous.to },
    };

    if (session.user.role === "EDITOR") {
      leadQuery.assignedToId = session.user.id;
      prevLeadQuery.assignedToId = session.user.id;
    } else if (params.advisorId && params.advisorId !== "ALL") {
      leadQuery.assignedToId = params.advisorId;
      prevLeadQuery.assignedToId = params.advisorId;
    }

    if (params.propertyId && params.propertyId !== "ALL") {
      leadQuery.propertyId = new Types.ObjectId(params.propertyId);
      prevLeadQuery.propertyId = new Types.ObjectId(params.propertyId);
    }

    if (params.locationId && params.locationId !== "ALL") {
      leadQuery.locationId = new Types.ObjectId(params.locationId);
      prevLeadQuery.locationId = new Types.ObjectId(params.locationId);
    }

    if (params.source && params.source !== "ALL") {
      leadQuery.source = params.source;
      prevLeadQuery.source = params.source;
    }

    // Parallel aggregate queries for current and previous period
    const [
      currLeads,
      prevLeads,
      currSiteVisits,
      prevSiteVisits,
      currDeliveries,
      topPropertiesAgg,
      topLocationsAgg,
      followUpHealthAgg,
    ] = await Promise.all([
      Lead.find(leadQuery).lean(),
      Lead.find(prevLeadQuery).lean(),
      SiteVisit.find({
        createdAt: { $gte: current.from, $lte: current.to },
        ...(session.user.role === "EDITOR" ? { assignedAdvisorId: session.user.id } : {}),
      }).lean(),
      SiteVisit.find({
        createdAt: { $gte: previous.from, $lte: previous.to },
        ...(session.user.role === "EDITOR" ? { assignedAdvisorId: session.user.id } : {}),
      }).lean(),
      NotificationDelivery.find({ createdAt: { $gte: current.from, $lte: current.to } }).lean(),
      Property.find({ publicationStatus: "PUBLISHED" }).select("title slug locationId propertyType").lean(),
      Location.find({ publicationStatus: "PUBLISHED" }).select("name slug state").lean(),
      Lead.aggregate([
        {
          $match: {
            status: { $in: ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "NEGOTIATING"] },
            ...(session.user.role === "EDITOR" ? { assignedToId: session.user.id } : {}),
          },
        },
        {
          $group: {
            _id: null,
            totalActive: { $sum: 1 },
            withFollowUp: { $sum: { $cond: [{ $ifNull: ["$nextFollowUpAt", false] }, 1, 0] } },
          },
        },
      ]),
    ]);

    // Inquiry & Lead Metrics Calculation
    const totalInquiries = currLeads.length;
    const prevTotalInquiries = prevLeads.length;

    const validInquiries = currLeads.filter((l) => l.abuseStatus === "CLEAN" && l.status !== "SPAM").length;
    const prevValidInquiries = prevLeads.filter((l) => l.abuseStatus === "CLEAN" && l.status !== "SPAM").length;

    const spamInquiries = currLeads.filter((l) => l.abuseStatus !== "CLEAN" || l.status === "SPAM").length;
    const prevSpamInquiries = prevLeads.filter((l) => l.abuseStatus !== "CLEAN" || l.status === "SPAM").length;

    const qualifiedLeads = currLeads.filter((l) => ["QUALIFIED", "NURTURING", "NEGOTIATING", "WON"].includes(l.status)).length;
    const prevQualifiedLeads = prevLeads.filter((l) => ["QUALIFIED", "NURTURING", "NEGOTIATING", "WON"].includes(l.status)).length;

    const activePipeline = currLeads.filter((l) => ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "NEGOTIATING"].includes(l.status)).length;
    const prevActivePipeline = prevLeads.filter((l) => ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "NEGOTIATING"].includes(l.status)).length;

    const unassigned = currLeads.filter((l) => !l.assignedToId && l.status !== "SPAM").length;
    const prevUnassigned = prevLeads.filter((l) => !l.assignedToId && l.status !== "SPAM").length;

    const wonLeads = currLeads.filter((l) => l.status === "WON").length;
    const prevWonLeads = prevLeads.filter((l) => l.status === "WON").length;

    const lostLeads = currLeads.filter((l) => l.status === "LOST").length;
    const prevLostLeads = prevLeads.filter((l) => l.status === "LOST").length;

    const now = new Date();
    const overdueFollowUps = currLeads.filter((l) => l.nextFollowUpAt && new Date(l.nextFollowUpAt) < now && !["WON", "LOST", "SPAM", "ARCHIVED"].includes(l.status)).length;

    // Response time calculation (Human staff events)
    let totalResponseTimeHours = 0;
    let respondedLeadCount = 0;
    let metSlaCount = 0;
    const responseTimes: number[] = [];

    for (const l of currLeads) {
      const humanEvents = (l.timeline || []).filter(
        (t) => t.actorType === "ADMIN_USER" && ["LEAD_ASSIGNED", "CONTACT_ATTEMPTED", "STATUS_CHANGED"].includes(t.eventType)
      );
      if (humanEvents.length > 0 && humanEvents[0].occurredAt) {
        const diffMs = Math.max(0, new Date(humanEvents[0].occurredAt).getTime() - new Date(l.createdAt).getTime());
        const diffHours = diffMs / (1000 * 60 * 60);
        totalResponseTimeHours += diffHours;
        responseTimes.push(diffHours);
        respondedLeadCount++;
        if (diffHours <= 2.0) metSlaCount++; // 2 hour standard SLA
      }
    }

    responseTimes.sort((a, b) => a - b);
    const avgResponseHours = respondedLeadCount > 0 ? totalResponseTimeHours / respondedLeadCount : 0;
    const medianResponseHours = responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length / 2)] : 0;
    const slaComplianceRate = respondedLeadCount > 0 ? (metSlaCount / respondedLeadCount) * 100 : 100;

    // Site Visit Metrics
    const totalVisits = currSiteVisits.length;
    const prevTotalVisits = prevSiteVisits.length;

    const completedVisits = currSiteVisits.filter((v) => v.status === "COMPLETED").length;
    const prevCompletedVisits = prevSiteVisits.filter((v) => v.status === "COMPLETED").length;

    const finishedVisits = currSiteVisits.filter((v) => ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(v.status)).length;
    const completionRate = finishedVisits > 0 ? (completedVisits / finishedVisits) * 100 : 0;

    const cancelledVisits = currSiteVisits.filter((v) => v.status === "CANCELLED").length;
    const noShowVisits = currSiteVisits.filter((v) => v.status === "NO_SHOW").length;

    const leadToVisitRate = totalInquiries > 0 ? (totalVisits / totalInquiries) * 100 : 0;

    // Communication Delivery Metrics
    const deliveredCount = currDeliveries.filter((d) => ["DELIVERED", "READ"].includes(d.status)).length;
    const failedCount = currDeliveries.filter((d) => ["FAILED", "BOUNCED"].includes(d.status)).length;
    const totalDeliveriesAttempted = deliveredCount + failedCount;
    const commDeliveryRate = totalDeliveriesAttempted > 0 ? (deliveredCount / totalDeliveriesAttempted) * 100 : 100;

    // Time Series Breakdown (Group by day)
    const daysCount = Math.max(1, Math.min(31, Math.ceil((current.to.getTime() - current.from.getTime()) / 86400000)));
    const dateLabels: string[] = [];
    const inqSeries: number[] = [];
    const leadSeries: number[] = [];
    const visitSeries: number[] = [];
    const compVisitSeries: number[] = [];

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(current.from.getTime() + i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      dateLabels.push(d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }));

      const dayInq = currLeads.filter((l) => l.createdAt.toISOString().slice(0, 10) === dateStr).length;
      const dayQualified = currLeads.filter((l) => l.createdAt.toISOString().slice(0, 10) === dateStr && ["QUALIFIED", "NURTURING", "NEGOTIATING", "WON"].includes(l.status)).length;
      const dayVisits = currSiteVisits.filter((v) => v.createdAt.toISOString().slice(0, 10) === dateStr).length;
      const dayComp = currSiteVisits.filter((v) => v.createdAt.toISOString().slice(0, 10) === dateStr && v.status === "COMPLETED").length;

      inqSeries.push(dayInq);
      leadSeries.push(dayQualified);
      visitSeries.push(dayVisits);
      compVisitSeries.push(dayComp);
    }

    // Source Distribution
    const sourceMap = new Map<LeadSource, number>();
    for (const src of LEAD_SOURCES) sourceMap.set(src, 0);
    for (const l of currLeads) {
      sourceMap.set(l.source, (sourceMap.get(l.source) || 0) + 1);
    }
    const sourceDistribution = Array.from(sourceMap.entries()).map(([source, count]) => ({
      source,
      label: source.replace(/_/g, " "),
      count,
      percentage: totalInquiries > 0 ? Math.round((count / totalInquiries) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    // Top Demand Properties
    const propInquiryMap = new Map<string, number>();
    const propQualifiedMap = new Map<string, number>();
    const propVisitMap = new Map<string, number>();
    const propCompletedMap = new Map<string, number>();

    for (const l of currLeads) {
      if (l.propertyId) {
        const pid = l.propertyId.toString();
        propInquiryMap.set(pid, (propInquiryMap.get(pid) || 0) + 1);
        if (["QUALIFIED", "NURTURING", "NEGOTIATING", "WON"].includes(l.status)) {
          propQualifiedMap.set(pid, (propQualifiedMap.get(pid) || 0) + 1);
        }
      }
    }
    for (const v of currSiteVisits) {
      const pid = v.propertyId.toString();
      propVisitMap.set(pid, (propVisitMap.get(pid) || 0) + 1);
      if (v.status === "COMPLETED") {
        propCompletedMap.set(pid, (propCompletedMap.get(pid) || 0) + 1);
      }
    }

    const locMap = new Map(topLocationsAgg.map((l) => [l._id.toString(), l.name]));

    const topDemandProperties = topPropertiesAgg.map((p) => {
      const pid = p._id.toString();
      const inq = propInquiryMap.get(pid) || 0;
      const qual = propQualifiedMap.get(pid) || 0;
      const visits = propVisitMap.get(pid) || 0;
      const comp = propCompletedMap.get(pid) || 0;
      const conv = inq > 0 ? Math.round((visits / inq) * 100) : 0;
      return {
        propertyId: pid,
        title: p.title,
        slug: p.slug,
        locationName: locMap.get(p.locationId?.toString() || "") || "Jaipur",
        inquiryCount: inq,
        qualifiedCount: qual,
        siteVisitCount: visits,
        completedVisitCount: comp,
        conversionRate: conv,
      };
    }).sort((a, b) => b.inquiryCount - a.inquiryCount).slice(0, 5);

    // Top Demand Locations
    const locInqMap = new Map<string, number>();
    const locLeadMap = new Map<string, number>();
    const locVisitMap = new Map<string, number>();

    for (const l of currLeads) {
      if (l.locationId) {
        const lid = l.locationId.toString();
        locInqMap.set(lid, (locInqMap.get(lid) || 0) + 1);
        locLeadMap.set(lid, (locLeadMap.get(lid) || 0) + 1);
      }
    }
    for (const v of currSiteVisits) {
      if (v.locationId) {
        const lid = v.locationId.toString();
        locVisitMap.set(lid, (locVisitMap.get(lid) || 0) + 1);
      }
    }

    const topDemandLocations = topLocationsAgg.map((l) => {
      const lid = l._id.toString();
      return {
        locationId: lid,
        name: l.name,
        slug: l.slug,
        inquiryCount: locInqMap.get(lid) || 0,
        leadCount: locLeadMap.get(lid) || 0,
        siteVisitCount: locVisitMap.get(lid) || 0,
      };
    }).sort((a, b) => b.inquiryCount - a.inquiryCount);

    return {
      periodLabel: current.label,
      comparisonLabel: previous.label,
      dateRange: { from: current.from.toISOString(), to: current.to.toISOString() },
      comparisonRange: { from: previous.from.toISOString(), to: previous.to.toISOString() },
      metrics: {
        totalInquiries: this.computeMetricValue(totalInquiries, prevTotalInquiries, "INTEGER", true),
        validInquiries: this.computeMetricValue(validInquiries, prevValidInquiries, "INTEGER", true),
        spamInquiries: this.computeMetricValue(spamInquiries, prevSpamInquiries, "INTEGER", false),
        inquiryToLeadRate: this.computeMetricValue(totalInquiries > 0 ? (qualifiedLeads / totalInquiries) * 100 : 0, prevTotalInquiries > 0 ? (prevQualifiedLeads / prevTotalInquiries) * 100 : 0, "PERCENTAGE", true),
        totalLeads: this.computeMetricValue(currLeads.length, prevLeads.length, "INTEGER", true),
        qualifiedLeads: this.computeMetricValue(qualifiedLeads, prevQualifiedLeads, "INTEGER", true),
        activePipelineLeads: this.computeMetricValue(activePipeline, prevActivePipeline, "INTEGER", true),
        unassignedLeads: this.computeMetricValue(unassigned, prevUnassigned, "INTEGER", false),
        wonLeads: this.computeMetricValue(wonLeads, prevWonLeads, "INTEGER", true),
        lostLeads: this.computeMetricValue(lostLeads, prevLostLeads, "INTEGER", false),
        overdueFollowUps: this.computeMetricValue(overdueFollowUps, undefined, "INTEGER", false),
        avgFirstResponseHours: this.computeMetricValue(avgResponseHours, undefined, "HOURS", false),
        medianFirstResponseHours: this.computeMetricValue(medianResponseHours, undefined, "HOURS", false),
        responseSlaComplianceRate: this.computeMetricValue(slaComplianceRate, undefined, "PERCENTAGE", true),
        totalSiteVisits: this.computeMetricValue(totalVisits, prevTotalVisits, "INTEGER", true),
        completedSiteVisits: this.computeMetricValue(completedVisits, prevCompletedVisits, "INTEGER", true),
        siteVisitCompletionRate: this.computeMetricValue(completionRate, undefined, "PERCENTAGE", true),
        cancelledSiteVisits: this.computeMetricValue(cancelledVisits, undefined, "INTEGER", false),
        noShowSiteVisits: this.computeMetricValue(noShowVisits, undefined, "INTEGER", false),
        leadToVisitConversionRate: this.computeMetricValue(leadToVisitRate, undefined, "PERCENTAGE", true),
        communicationDeliveryRate: this.computeMetricValue(commDeliveryRate, undefined, "PERCENTAGE", true),
        communicationFailureCount: this.computeMetricValue(failedCount, undefined, "INTEGER", false),
      },
      timeSeries: {
        dates: dateLabels,
        inquiries: inqSeries,
        leads: leadSeries,
        siteVisits: visitSeries,
        completedVisits: compVisitSeries,
      },
      sourceDistribution,
      topDemandProperties,
      topDemandLocations,
      followUpHealth: {
        dueToday: currLeads.filter((l) => l.nextFollowUpAt && new Date(l.nextFollowUpAt).toDateString() === now.toDateString()).length,
        overdue: overdueFollowUps,
        upcomingNext7Days: currLeads.filter((l) => {
          if (!l.nextFollowUpAt) return false;
          const fut = new Date(l.nextFollowUpAt).getTime();
          return fut > now.getTime() && fut <= now.getTime() + 7 * 86400000;
        }).length,
        withoutFollowUpScheduled: followUpHealthAgg[0] ? followUpHealthAgg[0].totalActive - followUpHealthAgg[0].withFollowUp : 0,
      },
      advisorWorkloadOverview: [],
      dataQualityAlertCount: unassigned + (followUpHealthAgg[0] ? followUpHealthAgg[0].totalActive - followUpHealthAgg[0].withFollowUp : 0),
      lastCalculatedAt: new Date().toISOString(),
    };
  }

  /**
   * 2. Funnel Analytics
   */
  public static async getFunnelAnalytics(
    params: AnalyticsFilterParams,
    session: AdminSession
  ): Promise<FunnelAnalyticsData> {
    await connectToDatabase();
    const { current } = this.resolveDateRange(params);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchQuery: Record<string, any> = {
      createdAt: { $gte: current.from, $lte: current.to },
      status: { $ne: "SPAM" },
    };

    if (session.user.role === "EDITOR") matchQuery.assignedToId = session.user.id;

    const [leads, stageHistories] = await Promise.all([
      Lead.find(matchQuery).lean(),
      LeadStageHistory.find({ changedAt: { $gte: current.from, $lte: current.to } }).lean(),
    ]);

    const totalEntered = leads.length;
    const stageCounts: Record<LeadStatus, number> = {
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      NURTURING: 0,
      NEGOTIATING: 0,
      WON: 0,
      LOST: 0,
      SPAM: 0,
      ARCHIVED: 0,
    };

    // Aggregate counts
    for (const l of leads) {
      stageCounts[l.status] = (stageCounts[l.status] || 0) + 1;
    }

    // Cumulative progression calculation for funnel order
    const orderedStages: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "NEGOTIATING", "WON"];
    const stages: FunnelStageMetric[] = [];

    // Duration mapping from append-only stage history
    const durationMap = new Map<LeadStatus, number[]>();
    for (const sh of stageHistories) {
      if (sh.durationInPreviousStageMs && sh.fromStage) {
        const list = durationMap.get(sh.fromStage) || [];
        list.push(sh.durationInPreviousStageMs / (1000 * 60 * 60)); // Convert to hours
        durationMap.set(sh.fromStage, list);
      }
    }

    let prevCount = totalEntered;
    for (let i = 0; i < orderedStages.length; i++) {
      const st = orderedStages[i];
      const count = stageCounts[st] || 0;
      const conversionFromPrev = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;
      const conversionFromFirst = totalEntered > 0 ? Math.round((count / totalEntered) * 100) : 0;
      const dropOff = Math.max(0, prevCount - count);
      const dropOffPct = prevCount > 0 ? Math.round((dropOff / prevCount) * 100) : 0;

      const durations = durationMap.get(st) || [];
      durations.sort((a, b) => a - b);
      const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : null;
      const medianDuration = durations.length > 0 ? durations[Math.floor(durations.length / 2)] : null;

      stages.push({
        stage: st,
        label: st.replace(/_/g, " "),
        count,
        conversionFromPrevious: i === 0 ? 100 : conversionFromPrev,
        conversionFromFirst,
        dropOffCount: i === 0 ? 0 : dropOff,
        dropOffPercentage: i === 0 ? 0 : dropOffPct,
        avgDurationHours: avgDuration,
        medianDurationHours: medianDuration,
        hasReliableDuration: durations.length > 0,
      });

      prevCount = count;
    }

    // Lost Reasons Breakdown
    const lostMap = new Map<LostReason, number>();
    for (const r of LOST_REASONS) lostMap.set(r, 0);
    const lostLeads = leads.filter((l) => l.status === "LOST");
    for (const l of lostLeads) {
      if (l.lostReason) {
        lostMap.set(l.lostReason, (lostMap.get(l.lostReason) || 0) + 1);
      }
    }

    const lostReasonBreakdown = Array.from(lostMap.entries()).map(([reason, count]) => ({
      reason,
      label: reason.replace(/_/g, " "),
      count,
      percentage: lostLeads.length > 0 ? Math.round((count / lostLeads.length) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    return {
      periodLabel: current.label,
      totalEntered,
      stages,
      lostReasonBreakdown,
      stageHistoryCoverageStartDate: STAGE_HISTORY_COVERAGE_START,
      legacyLeadCount: leads.filter((l) => new Date(l.createdAt) < new Date(STAGE_HISTORY_COVERAGE_START)).length,
    };
  }

  /**
   * 3. Property & Location Demand Analytics
   */
  public static async getPropertyDemandAnalytics(
    params: AnalyticsFilterParams,
    session: AdminSession
  ): Promise<{ properties: PropertyDemandItem[]; locations: LocationDemandItem[] }> {
    await connectToDatabase();
    const { current } = this.resolveDateRange(params);

    const [leads, siteVisits, properties, locations] = await Promise.all([
      Lead.find({ createdAt: { $gte: current.from, $lte: current.to }, status: { $ne: "SPAM" } }).lean(),
      SiteVisit.find({ createdAt: { $gte: current.from, $lte: current.to } }).lean(),
      Property.find().select("title slug locationId propertyType publicationStatus").lean(),
      Location.find().select("name slug state publicationStatus").lean(),
    ]);

    const locNameMap = new Map(locations.map((l) => [l._id.toString(), l.name]));

    // Property Demand Map
    const propMap = new Map<string, PropertyDemandItem>();
    for (const p of properties) {
      const pid = p._id.toString();
      propMap.set(pid, {
        propertyId: pid,
        title: p.title,
        slug: p.slug,
        locationName: locNameMap.get(p.locationId?.toString() || "") || "Jaipur",
        propertyType: p.propertyType,
        inquiryCount: 0,
        qualifiedLeadCount: 0,
        siteVisitRequestedCount: 0,
        siteVisitCompletedCount: 0,
        activeLeadsCount: 0,
        wonLeadsCount: 0,
        inquiryToVisitRate: 0,
        sourceMix: [],
      });
    }

    const propSourceCounts = new Map<string, Map<LeadSource, number>>();

    for (const l of leads) {
      if (l.propertyId) {
        const pid = l.propertyId.toString();
        const item = propMap.get(pid);
        if (item) {
          item.inquiryCount++;
          if (["QUALIFIED", "NURTURING", "NEGOTIATING", "WON"].includes(l.status)) item.qualifiedLeadCount++;
          if (["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "NEGOTIATING"].includes(l.status)) item.activeLeadsCount++;
          if (l.status === "WON") item.wonLeadsCount++;

          const srcMap = propSourceCounts.get(pid) || new Map<LeadSource, number>();
          srcMap.set(l.source, (srcMap.get(l.source) || 0) + 1);
          propSourceCounts.set(pid, srcMap);
        }
      }
    }

    for (const v of siteVisits) {
      const pid = v.propertyId.toString();
      const item = propMap.get(pid);
      if (item) {
        item.siteVisitRequestedCount++;
        if (v.status === "COMPLETED") item.siteVisitCompletedCount++;
      }
    }

    const propertyItems = Array.from(propMap.values()).map((item) => {
      const srcMap = propSourceCounts.get(item.propertyId);
      const sourceMix = srcMap
        ? Array.from(srcMap.entries()).map(([source, count]) => ({ source, count }))
        : [];
      const inqToVisit = item.inquiryCount > 0 ? Math.round((item.siteVisitRequestedCount / item.inquiryCount) * 100) : 0;
      return {
        ...item,
        inquiryToVisitRate: inqToVisit,
        sourceMix,
      };
    }).sort((a, b) => b.inquiryCount - a.inquiryCount);

    // Location Demand Items
    const locationItems = locations.map((loc) => {
      const lid = loc._id.toString();
      const inq = leads.filter((l) => l.locationId?.toString() === lid).length;
      const visits = siteVisits.filter((v) => v.locationId?.toString() === lid).length;
      const activeProps = properties.filter((p) => p.locationId?.toString() === lid && p.publicationStatus === "PUBLISHED").length;
      return {
        locationId: lid,
        name: loc.name,
        slug: loc.slug,
        state: loc.state,
        inquiryCount: inq,
        leadCount: inq,
        siteVisitCount: visits,
        activePropertiesCount: activeProps,
      };
    }).sort((a, b) => b.inquiryCount - a.inquiryCount);

    return {
      properties: propertyItems,
      locations: locationItems,
    };
  }

  /**
   * 4. Advisor Workload & SLAs
   */
  public static async getAdvisorWorkloadAnalytics(
    params: AnalyticsFilterParams,
    session: AdminSession
  ): Promise<AdvisorAnalyticsItem[]> {
    await connectToDatabase();
    const { current } = this.resolveDateRange(params);

    const [leads, siteVisits] = await Promise.all([
      Lead.find({
        createdAt: { $gte: current.from, $lte: current.to },
        assignedToId: { $exists: true, $ne: null },
      }).lean(),
      SiteVisit.find({
        createdAt: { $gte: current.from, $lte: current.to },
        assignedAdvisorId: { $exists: true, $ne: null },
      }).lean(),
    ]);

    const advisorMap = new Map<string, {
      id: string;
      name: string;
      email: string;
      activeLeads: number;
      newAssignments: number;
      overdueFollowUps: number;
      completedFollowUps: number;
      upcomingVisits: number;
      completedVisits: number;
      responseTimes: number[];
      slaMet: number;
      slaMissed: number;
      wonCount: number;
    }>();

    const now = new Date();

    for (const l of leads) {
      if (!l.assignedToId) continue;
      // RBAC check: EDITOR can only see their own row
      if (session.user.role === "EDITOR" && l.assignedToId !== session.user.id) continue;

      const aid = l.assignedToId;
      const existing = advisorMap.get(aid) || {
        id: aid,
        name: l.assignedToName || "Advisor",
        email: l.assignedToEmail || "advisor@ratiwal.com",
        activeLeads: 0,
        newAssignments: 0,
        overdueFollowUps: 0,
        completedFollowUps: 0,
        upcomingVisits: 0,
        completedVisits: 0,
        responseTimes: [],
        slaMet: 0,
        slaMissed: 0,
        wonCount: 0,
      };

      existing.newAssignments++;
      if (["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "NEGOTIATING"].includes(l.status)) {
        existing.activeLeads++;
      }
      if (l.status === "WON") existing.wonCount++;

      if (l.nextFollowUpAt && new Date(l.nextFollowUpAt) < now && !["WON", "LOST", "SPAM", "ARCHIVED"].includes(l.status)) {
        existing.overdueFollowUps++;
      }

      const humanEvents = (l.timeline || []).filter(
        (t) => t.actorType === "ADMIN_USER" && ["LEAD_ASSIGNED", "CONTACT_ATTEMPTED", "STATUS_CHANGED"].includes(t.eventType)
      );
      if (humanEvents.length > 0 && humanEvents[0].occurredAt) {
        const diffHours = Math.max(0, new Date(humanEvents[0].occurredAt).getTime() - new Date(l.createdAt).getTime()) / 3600000;
        existing.responseTimes.push(diffHours);
        if (diffHours <= 2.0) existing.slaMet++;
        else existing.slaMissed++;
      }

      advisorMap.set(aid, existing);
    }

    for (const v of siteVisits) {
      if (!v.assignedAdvisorId) continue;
      if (session.user.role === "EDITOR" && v.assignedAdvisorId !== session.user.id) continue;

      const aid = v.assignedAdvisorId;
      const existing = advisorMap.get(aid) || {
        id: aid,
        name: v.assignedAdvisorName || "Advisor",
        email: v.assignedAdvisorEmail || "advisor@ratiwal.com",
        activeLeads: 0,
        newAssignments: 0,
        overdueFollowUps: 0,
        completedFollowUps: 0,
        upcomingVisits: 0,
        completedVisits: 0,
        responseTimes: [],
        slaMet: 0,
        slaMissed: 0,
        wonCount: 0,
      };

      if (["REQUESTED", "CONFIRMED"].includes(v.status)) existing.upcomingVisits++;
      if (v.status === "COMPLETED") existing.completedVisits++;

      advisorMap.set(aid, existing);
    }

    return Array.from(advisorMap.values()).map((adv) => {
      adv.responseTimes.sort((a, b) => a - b);
      const avgResp = adv.responseTimes.length > 0 ? adv.responseTimes.reduce((a, b) => a + b, 0) / adv.responseTimes.length : null;
      const medResp = adv.responseTimes.length > 0 ? adv.responseTimes[Math.floor(adv.responseTimes.length / 2)] : null;
      const totalSla = adv.slaMet + adv.slaMissed;
      const slaPct = totalSla > 0 ? Math.round((adv.slaMet / totalSla) * 100) : null;

      return {
        advisorId: adv.id,
        advisorName: adv.name,
        advisorEmail: adv.email,
        assignedActiveLeads: adv.activeLeads,
        newAssignmentsInPeriod: adv.newAssignments,
        overdueFollowUps: adv.overdueFollowUps,
        completedFollowUpsInPeriod: adv.completedFollowUps,
        upcomingSiteVisits: adv.upcomingVisits,
        completedSiteVisitsInPeriod: adv.completedVisits,
        avgFirstResponseHours: avgResp,
        medianFirstResponseHours: medResp,
        responseSlaMetCount: adv.slaMet,
        responseSlaMissedCount: adv.slaMissed,
        slaCompliancePercent: slaPct,
        wonLeadsCount: adv.wonCount,
        confidence: adv.newAssignments >= 5 ? "HIGH" : "LOW_SAMPLE",
      };
    });
  }

  /**
   * 5. Site Visit Analytics
   */
  public static async getSiteVisitAnalytics(
    params: AnalyticsFilterParams,
    session: AdminSession
  ): Promise<SiteVisitAnalyticsData> {
    await connectToDatabase();
    const { current } = this.resolveDateRange(params);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchQuery: Record<string, any> = {
      createdAt: { $gte: current.from, $lte: current.to },
    };
    if (session.user.role === "EDITOR") matchQuery.assignedAdvisorId = session.user.id;

    const visits = await SiteVisit.find(matchQuery).lean();

    const totalRequested = visits.length;
    const totalScheduled = visits.filter((v) => !!v.scheduledStartAt).length;
    const totalConfirmed = visits.filter((v) => v.status === "CONFIRMED" || v.status === "COMPLETED").length;
    const totalCompleted = visits.filter((v) => v.status === "COMPLETED").length;
    const totalCancelled = visits.filter((v) => v.status === "CANCELLED").length;
    const totalRescheduled = visits.filter((v) => (v.timeline || []).some((t) => t.eventType === "VISIT_RESCHEDULED")).length;
    const totalNoShow = visits.filter((v) => v.status === "NO_SHOW").length;

    const concluded = totalCompleted + totalCancelled + totalNoShow;
    const completionRate = concluded > 0 ? Math.round((totalCompleted / concluded) * 100) : 0;
    const cancellationRate = concluded > 0 ? Math.round((totalCancelled / concluded) * 100) : 0;
    const noShowRate = concluded > 0 ? Math.round((totalNoShow / concluded) * 100) : 0;

    // Time from inquiry/request to visit
    let totalInqToVisitHours = 0;
    let scheduledCount = 0;
    for (const v of visits) {
      if (v.scheduledStartAt) {
        const diffHours = Math.max(0, new Date(v.scheduledStartAt).getTime() - new Date(v.createdAt).getTime()) / 3600000;
        totalInqToVisitHours += diffHours;
        scheduledCount++;
      }
    }
    const avgHoursFromInquiryToVisit = scheduledCount > 0 ? Math.round(totalInqToVisitHours / scheduledCount) : null;

    // Cancellation Reasons Breakdown
    const cancelMap = new Map<CancellationReason, number>();
    for (const r of CANCELLATION_REASONS) cancelMap.set(r, 0);
    const cancelledList = visits.filter((v) => v.status === "CANCELLED");
    for (const v of cancelledList) {
      if (v.cancellationReason) {
        cancelMap.set(v.cancellationReason, (cancelMap.get(v.cancellationReason) || 0) + 1);
      }
    }

    const cancellationReasonBreakdown = Array.from(cancelMap.entries()).map(([reason, count]) => ({
      reason,
      label: reason.replace(/_/g, " "),
      count,
      percentage: cancelledList.length > 0 ? Math.round((count / cancelledList.length) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    // Meeting Mode Breakdown
    const modeMap = new Map<string, number>();
    for (const v of visits) {
      const mode = v.meetingMode || "IN_PERSON";
      modeMap.set(mode, (modeMap.get(mode) || 0) + 1);
    }
    const meetingModeBreakdown = Array.from(modeMap.entries()).map(([mode, count]) => ({
      mode,
      label: mode.replace(/_/g, " "),
      count,
    }));

    return {
      periodLabel: current.label,
      totalRequested,
      totalScheduled,
      totalConfirmed,
      totalCompleted,
      totalCancelled,
      totalRescheduled,
      totalNoShow,
      completionRate,
      cancellationRate,
      noShowRate,
      avgHoursFromInquiryToVisit,
      avgHoursFromVisitToFollowUp: null,
      cancellationReasonBreakdown,
      meetingModeBreakdown,
    };
  }

  /**
   * 6. Data Quality & Hygiene Audit
   */
  public static async getDataQualityReport(session: AdminSession): Promise<DataQualityReport> {
    await connectToDatabase();

    const now = new Date();

    const [
      unassignedLeadsCount,
      leadsWithoutFollowUpCount,
      leadsWithoutPropertyCount,
      suspectedSpamLeadsCount,
      unassignedVisitsCount,
      inconsistentDatesVisitsCount,
    ] = await Promise.all([
      Lead.countDocuments({
        status: { $in: ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "NEGOTIATING"] },
        assignedToId: { $in: [null, ""] },
      }),
      Lead.countDocuments({
        status: { $in: ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "NEGOTIATING"] },
        nextFollowUpAt: null,
      }),
      Lead.countDocuments({
        propertyId: null,
        status: { $ne: "SPAM" },
      }),
      Lead.countDocuments({
        abuseStatus: { $in: ["SUSPECTED_SPAM", "CONFIRMED_SPAM"] },
        status: { $ne: "SPAM" },
      }),
      SiteVisit.countDocuments({
        status: { $in: ["REQUESTED", "CONFIRMED"] },
        assignedAdvisorId: { $in: [null, ""] },
      }),
      SiteVisit.countDocuments({
        scheduledStartAt: { $exists: true },
        scheduledEndAt: { $exists: true },
        $expr: { $gte: ["$scheduledStartAt", "$scheduledEndAt"] },
      }),
    ]);

    const issues = [
      {
        id: "dq-unassigned-leads",
        category: "LEAD" as const,
        severity: unassignedLeadsCount > 5 ? ("CRITICAL" as const) : ("WARNING" as const),
        title: "Active Leads Without Assigned Advisor",
        description: `${unassignedLeadsCount} active CRM lead(s) are unassigned, leading to delayed customer follow-up.`,
        affectedCount: unassignedLeadsCount,
        impactOnAnalytics: "First-response times and advisor conversion metrics will be omitted for these prospects.",
        navigationHref: "/dashboard/leads?status=NEW",
      },
      {
        id: "dq-missing-followup",
        category: "LEAD" as const,
        severity: leadsWithoutFollowUpCount > 10 ? ("CRITICAL" as const) : ("WARNING" as const),
        title: "Active Leads Without Next Follow-Up Date",
        description: `${leadsWithoutFollowUpCount} lead(s) currently lack a scheduled next contact date in their CRM profile.`,
        affectedCount: leadsWithoutFollowUpCount,
        impactOnAnalytics: "Understates the Overdue Follow-up alert metrics and daily advisor agenda scheduling.",
        navigationHref: "/dashboard/leads",
      },
      {
        id: "dq-missing-property",
        category: "PROPERTY" as const,
        severity: "INFO" as const,
        title: "General Inquiries Not Tied to a Property",
        description: `${leadsWithoutPropertyCount} inquiry submission(s) originated from global contact forms rather than specific properties.`,
        affectedCount: leadsWithoutPropertyCount,
        impactOnAnalytics: "These leads are excluded from property-level demand charts and attributed to general lead volume.",
        navigationHref: "/dashboard/leads",
      },
      {
        id: "dq-unassigned-visits",
        category: "SITE_VISIT" as const,
        severity: unassignedVisitsCount > 0 ? ("CRITICAL" as const) : ("INFO" as const),
        title: "Site Visits Without Assigned Advisor",
        description: `${unassignedVisitsCount} scheduled or requested tour(s) have no dedicated staff member assigned.`,
        affectedCount: unassignedVisitsCount,
        impactOnAnalytics: "Advisor workload benchmarks will not reflect these upcoming tour appointments.",
        navigationHref: "/dashboard/site-visits",
      },
    ];

    const penalty = unassignedLeadsCount * 5 + leadsWithoutFollowUpCount * 2 + unassignedVisitsCount * 10;
    const overallScore = Math.max(0, 100 - penalty);

    return {
      lastScannedAt: now.toISOString(),
      overallScore,
      totalIssuesCount: unassignedLeadsCount + leadsWithoutFollowUpCount + unassignedVisitsCount,
      issues,
      stageHistoryCoverageStartDate: STAGE_HISTORY_COVERAGE_START,
    };
  }
}
