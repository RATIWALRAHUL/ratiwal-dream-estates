/**
 * @file analytics.service.ts
 * @description High-performance analytics query engine for Ratiwal Dream Estates.
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
import { LEAD_SOURCES, LOST_REASONS, LeadStatus, LeadSource, LostReason } from "@/types/lead";
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
    isPositiveWhenUp = true
  ): MetricValue {
    let formatted: string;
    if (format === "PERCENTAGE") {
      formatted = `${Math.round(currentVal)}%`;
    } else if (format === "HOURS") {
      formatted = `${currentVal.toFixed(1)}h`;
    } else {
      formatted = currentVal.toLocaleString("en-IN");
    }

    let previousFormatted: string | undefined;
    if (prevVal !== undefined) {
      if (format === "PERCENTAGE") previousFormatted = `${Math.round(prevVal)}%`;
      else if (format === "HOURS") previousFormatted = `${prevVal.toFixed(1)}h`;
      else previousFormatted = prevVal.toLocaleString("en-IN");
    }

    if (prevVal === undefined || prevVal === null) {
      return {
        value: currentVal,
        formatted,
        confidence: "HIGH",
      };
    }

    if (prevVal === 0) {
      return {
        value: currentVal,
        formatted,
        previousValue: 0,
        previousFormatted: format === "PERCENTAGE" ? "0%" : "0",
        changePercent: currentVal > 0 ? 100 : 0,
        trend: currentVal > 0 ? "UP" : "FLAT",
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
   * Pushes all counting, grouped aggregation, and time series bucketing to MongoDB.
   */
  public static async getOverviewAnalytics(
    params: AnalyticsFilterParams,
    session: AdminSession
  ): Promise<AnalyticsOverviewData> {
    await connectToDatabase();

    const { current, previous } = this.resolveDateRange(params);
    const now = new Date();

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

    // Parallel optimized aggregate pipelines
    const [
      leadMetricsFacet,
      siteVisitMetricsFacet,
      deliveryStats,
      topPropertiesList,
      topLocationsList,
      followUpHealthAgg,
      responseTimeLeads,
    ] = await Promise.all([
      // 1. Faceted Lead Aggregation (Current + Previous period summaries, sources, and daily series)
      Lead.aggregate<{
        currSummary: {
          total: number;
          valid: number;
          spam: number;
          qualified: number;
          activePipeline: number;
          unassigned: number;
          won: number;
          lost: number;
          overdueFollowUps: number;
          dueTodayFollowUps: number;
          upcoming7DaysFollowUps: number;
        }[];
        prevSummary: {
          total: number;
          valid: number;
          spam: number;
          qualified: number;
          activePipeline: number;
          unassigned: number;
          won: number;
          lost: number;
        }[];
        sources: { _id: LeadSource; count: number }[];
        propInquiries: { _id: Types.ObjectId; inqCount: number; qualCount: number }[];
        locInquiries: { _id: Types.ObjectId; inqCount: number; leadCount: number }[];
        timeSeries: { _id: string; totalInquiries: number; qualifiedLeads: number }[];
      }>([
        {
          $facet: {
            currSummary: [
              { $match: leadQuery },
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  valid: { $sum: { $cond: [{ $and: [{ $eq: ["$abuseStatus", "CLEAN"] }, { $ne: ["$status", "SPAM"] }] }, 1, 0] } },
                  spam: { $sum: { $cond: [{ $or: [{ $ne: ["$abuseStatus", "CLEAN"] }, { $eq: ["$status", "SPAM"] }] }, 1, 0] } },
                  qualified: { $sum: { $cond: [{ $in: ["$status", ["QUALIFIED", "NURTURING", "NEGOTIATING", "WON"]] }, 1, 0] } },
                  activePipeline: { $sum: { $cond: [{ $in: ["$status", ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "NEGOTIATING"]] }, 1, 0] } },
                  unassigned: { $sum: { $cond: [{ $and: [{ $or: [{ $eq: ["$assignedToId", null] }, { $eq: ["$assignedToId", ""] }, { $not: ["$assignedToId"] }] }, { $ne: ["$status", "SPAM"] }] }, 1, 0] } },
                  won: { $sum: { $cond: [{ $eq: ["$status", "WON"] }, 1, 0] } },
                  lost: { $sum: { $cond: [{ $eq: ["$status", "LOST"] }, 1, 0] } },
                  overdueFollowUps: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $ifNull: ["$nextFollowUpAt", false] },
                            { $lt: ["$nextFollowUpAt", now] },
                            { $not: [{ $in: ["$status", ["WON", "LOST", "SPAM", "ARCHIVED"]] }] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  dueTodayFollowUps: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $ifNull: ["$nextFollowUpAt", false] },
                            { $gte: ["$nextFollowUpAt", new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)] },
                            { $lte: ["$nextFollowUpAt", new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                  upcoming7DaysFollowUps: {
                    $sum: {
                      $cond: [
                        {
                          $and: [
                            { $ifNull: ["$nextFollowUpAt", false] },
                            { $gt: ["$nextFollowUpAt", now] },
                            { $lte: ["$nextFollowUpAt", new Date(now.getTime() + 7 * 86400000)] },
                          ],
                        },
                        1,
                        0,
                      ],
                    },
                  },
                },
              },
            ],
            prevSummary: [
              { $match: prevLeadQuery },
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  valid: { $sum: { $cond: [{ $and: [{ $eq: ["$abuseStatus", "CLEAN"] }, { $ne: ["$status", "SPAM"] }] }, 1, 0] } },
                  spam: { $sum: { $cond: [{ $or: [{ $ne: ["$abuseStatus", "CLEAN"] }, { $eq: ["$status", "SPAM"] }] }, 1, 0] } },
                  qualified: { $sum: { $cond: [{ $in: ["$status", ["QUALIFIED", "NURTURING", "NEGOTIATING", "WON"]] }, 1, 0] } },
                  activePipeline: { $sum: { $cond: [{ $in: ["$status", ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "NEGOTIATING"]] }, 1, 0] } },
                  unassigned: { $sum: { $cond: [{ $and: [{ $or: [{ $eq: ["$assignedToId", null] }, { $eq: ["$assignedToId", ""] }, { $not: ["$assignedToId"] }] }, { $ne: ["$status", "SPAM"] }] }, 1, 0] } },
                  won: { $sum: { $cond: [{ $eq: ["$status", "WON"] }, 1, 0] } },
                  lost: { $sum: { $cond: [{ $eq: ["$status", "LOST"] }, 1, 0] } },
                },
              },
            ],
            sources: [
              { $match: leadQuery },
              { $group: { _id: "$source", count: { $sum: 1 } } },
            ],
            propInquiries: [
              { $match: { ...leadQuery, propertyId: { $exists: true, $ne: null } } },
              {
                $group: {
                  _id: "$propertyId",
                  inqCount: { $sum: 1 },
                  qualCount: { $sum: { $cond: [{ $in: ["$status", ["QUALIFIED", "NURTURING", "NEGOTIATING", "WON"]] }, 1, 0] } },
                },
              },
            ],
            locInquiries: [
              { $match: { ...leadQuery, locationId: { $exists: true, $ne: null } } },
              {
                $group: {
                  _id: "$locationId",
                  inqCount: { $sum: 1 },
                  leadCount: { $sum: 1 },
                },
              },
            ],
            timeSeries: [
              { $match: leadQuery },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  totalInquiries: { $sum: 1 },
                  qualifiedLeads: { $sum: { $cond: [{ $in: ["$status", ["QUALIFIED", "NURTURING", "NEGOTIATING", "WON"]] }, 1, 0] } },
                },
              },
            ],
          },
        },
      ]),

      // 2. Faceted Site Visit Aggregation
      SiteVisit.aggregate<{
        currSummary: {
          total: number;
          completed: number;
          finished: number;
          cancelled: number;
          noShow: number;
        }[];
        prevSummary: {
          total: number;
          completed: number;
        }[];
        propVisits: { _id: Types.ObjectId; visitCount: number; compCount: number }[];
        locVisits: { _id: Types.ObjectId; visitCount: number }[];
        timeSeries: { _id: string; visits: number; completed: number }[];
      }>([
        {
          $facet: {
            currSummary: [
              {
                $match: {
                  createdAt: { $gte: current.from, $lte: current.to },
                  ...(session.user.role === "EDITOR" ? { assignedAdvisorId: session.user.id } : {}),
                },
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
                  finished: { $sum: { $cond: [{ $in: ["$status", ["COMPLETED", "CANCELLED", "NO_SHOW"]] }, 1, 0] } },
                  cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
                  noShow: { $sum: { $cond: [{ $eq: ["$status", "NO_SHOW"] }, 1, 0] } },
                },
              },
            ],
            prevSummary: [
              {
                $match: {
                  createdAt: { $gte: previous.from, $lte: previous.to },
                  ...(session.user.role === "EDITOR" ? { assignedAdvisorId: session.user.id } : {}),
                },
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
                },
              },
            ],
            propVisits: [
              {
                $match: {
                  createdAt: { $gte: current.from, $lte: current.to },
                  propertyId: { $exists: true, $ne: null },
                },
              },
              {
                $group: {
                  _id: "$propertyId",
                  visitCount: { $sum: 1 },
                  compCount: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
                },
              },
            ],
            locVisits: [
              {
                $match: {
                  createdAt: { $gte: current.from, $lte: current.to },
                  locationId: { $exists: true, $ne: null },
                },
              },
              {
                $group: {
                  _id: "$locationId",
                  visitCount: { $sum: 1 },
                },
              },
            ],
            timeSeries: [
              {
                $match: {
                  createdAt: { $gte: current.from, $lte: current.to },
                  ...(session.user.role === "EDITOR" ? { assignedAdvisorId: session.user.id } : {}),
                },
              },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  visits: { $sum: 1 },
                  completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
                },
              },
            ],
          },
        },
      ]),

      // 3. Notification Deliveries Aggregation
      NotificationDelivery.aggregate<{
        _id: null;
        delivered: number;
        failed: number;
      }>([
        { $match: { createdAt: { $gte: current.from, $lte: current.to } } },
        {
          $group: {
            _id: null,
            delivered: { $sum: { $cond: [{ $in: ["$status", ["DELIVERED", "READ"]] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $in: ["$status", ["FAILED", "BOUNCED"]] }, 1, 0] } },
          },
        },
      ]),

      // 4. Properties and Locations Metadata
      Property.find({ publicationStatus: "PUBLISHED" }).select("title slug locationId propertyType").lean(),
      Location.find({ publicationStatus: "PUBLISHED" }).select("name slug state").lean(),

      // 5. Active Pipeline FollowUp Summary
      Lead.aggregate<{ totalActive: number; withFollowUp: number }>([
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

      // 6. First Response Time Stream (Projected minimal fields only for responded leads)
      Lead.find(
        {
          ...leadQuery,
          "timeline.actorType": "ADMIN_USER",
          "timeline.eventType": { $in: ["LEAD_ASSIGNED", "CONTACT_ATTEMPTED", "STATUS_CHANGED"] },
        },
        { createdAt: 1, timeline: { $elemMatch: { actorType: "ADMIN_USER", eventType: { $in: ["LEAD_ASSIGNED", "CONTACT_ATTEMPTED", "STATUS_CHANGED"] } } } }
      ).limit(500).lean(),
    ]);

    const leadFacetData = leadMetricsFacet[0] || {
      currSummary: [],
      prevSummary: [],
      sources: [],
      propInquiries: [],
      locInquiries: [],
      timeSeries: [],
    };
    const currLeadSummary = leadFacetData.currSummary[0] || {
      total: 0,
      valid: 0,
      spam: 0,
      qualified: 0,
      activePipeline: 0,
      unassigned: 0,
      won: 0,
      lost: 0,
      overdueFollowUps: 0,
      dueTodayFollowUps: 0,
      upcoming7DaysFollowUps: 0,
    };
    const prevLeadSummary = leadFacetData.prevSummary[0] || {
      total: 0,
      valid: 0,
      spam: 0,
      qualified: 0,
      activePipeline: 0,
      unassigned: 0,
      won: 0,
      lost: 0,
    };

    const visitFacetData = siteVisitMetricsFacet[0] || {
      currSummary: [],
      prevSummary: [],
      propVisits: [],
      locVisits: [],
      timeSeries: [],
    };
    const currVisitSummary = visitFacetData.currSummary[0] || {
      total: 0,
      completed: 0,
      finished: 0,
      cancelled: 0,
      noShow: 0,
    };
    const prevVisitSummary = visitFacetData.prevSummary[0] || {
      total: 0,
      completed: 0,
    };

    // Response time calculation from projected records
    let totalResponseTimeHours = 0;
    let respondedLeadCount = 0;
    let metSlaCount = 0;
    const responseTimes: number[] = [];

    for (const l of responseTimeLeads) {
      const firstEvent = l.timeline && l.timeline[0];
      if (firstEvent && firstEvent.occurredAt) {
        const diffMs = Math.max(0, new Date(firstEvent.occurredAt).getTime() - new Date(l.createdAt).getTime());
        const diffHours = diffMs / 3600000;
        totalResponseTimeHours += diffHours;
        responseTimes.push(diffHours);
        respondedLeadCount++;
        if (diffHours <= 2.0) metSlaCount++;
      }
    }

    responseTimes.sort((a, b) => a - b);
    const avgResponseHours = respondedLeadCount > 0 ? totalResponseTimeHours / respondedLeadCount : 0;
    const medianResponseHours = responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length / 2)] : 0;
    const slaComplianceRate = respondedLeadCount > 0 ? (metSlaCount / respondedLeadCount) * 100 : 100;

    // Delivery stats
    const delivery = deliveryStats[0] || { delivered: 0, failed: 0 };
    const totalDeliveriesAttempted = delivery.delivered + delivery.failed;
    const commDeliveryRate = totalDeliveriesAttempted > 0 ? (delivery.delivered / totalDeliveriesAttempted) * 100 : 100;

    // Time Series mapping
    const inqSeriesMap = new Map(leadFacetData.timeSeries.map((t) => [t._id, t]));
    const visitSeriesMap = new Map(visitFacetData.timeSeries.map((v) => [v._id, v]));

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

      const inqItem = inqSeriesMap.get(dateStr);
      const visitItem = visitSeriesMap.get(dateStr);

      inqSeries.push(inqItem?.totalInquiries || 0);
      leadSeries.push(inqItem?.qualifiedLeads || 0);
      visitSeries.push(visitItem?.visits || 0);
      compVisitSeries.push(visitItem?.completed || 0);
    }

    // Source Distribution mapping
    const rawSourceCounts = new Map(leadFacetData.sources.map((s) => [s._id, s.count]));
    const totalInquiries = currLeadSummary.total;

    const sourceDistribution = LEAD_SOURCES.map((src) => {
      const count = rawSourceCounts.get(src) || 0;
      return {
        source: src,
        label: src.replace(/_/g, " "),
        count,
        percentage: totalInquiries > 0 ? Math.round((count / totalInquiries) * 100) : 0,
      };
    }).sort((a, b) => b.count - a.count);

    // Top Demand Properties
    const propInqMap = new Map(leadFacetData.propInquiries.map((p) => [p._id.toString(), p]));
    const propVisitMap = new Map(visitFacetData.propVisits.map((v) => [v._id.toString(), v]));
    const locMap = new Map(topLocationsList.map((l) => [l._id.toString(), l.name]));

    const topDemandProperties = topPropertiesList.map((p) => {
      const pid = p._id.toString();
      const inqData = propInqMap.get(pid);
      const visitData = propVisitMap.get(pid);

      const inq = inqData?.inqCount || 0;
      const qual = inqData?.qualCount || 0;
      const visits = visitData?.visitCount || 0;
      const comp = visitData?.compCount || 0;
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
    const locInqMap = new Map(leadFacetData.locInquiries.map((l) => [l._id.toString(), l]));
    const locVisitMap = new Map(visitFacetData.locVisits.map((v) => [v._id.toString(), v.visitCount]));

    const topDemandLocations = topLocationsList.map((l) => {
      const lid = l._id.toString();
      const inqData = locInqMap.get(lid);
      const visits = locVisitMap.get(lid) || 0;

      return {
        locationId: lid,
        name: l.name,
        slug: l.slug,
        inquiryCount: inqData?.inqCount || 0,
        leadCount: inqData?.leadCount || 0,
        siteVisitCount: visits,
      };
    }).sort((a, b) => b.inquiryCount - a.inquiryCount);

    const completionRate = currVisitSummary.finished > 0 ? (currVisitSummary.completed / currVisitSummary.finished) * 100 : 0;
    const leadToVisitRate = totalInquiries > 0 ? (currVisitSummary.total / totalInquiries) * 100 : 0;

    return {
      periodLabel: current.label,
      comparisonLabel: previous.label,
      dateRange: { from: current.from.toISOString(), to: current.to.toISOString() },
      comparisonRange: { from: previous.from.toISOString(), to: previous.to.toISOString() },
      metrics: {
        totalInquiries: this.computeMetricValue(currLeadSummary.total, prevLeadSummary.total, "INTEGER", true),
        validInquiries: this.computeMetricValue(currLeadSummary.valid, prevLeadSummary.valid, "INTEGER", true),
        spamInquiries: this.computeMetricValue(currLeadSummary.spam, prevLeadSummary.spam, "INTEGER", false),
        inquiryToLeadRate: this.computeMetricValue(
          currLeadSummary.total > 0 ? (currLeadSummary.qualified / currLeadSummary.total) * 100 : 0,
          prevLeadSummary.total > 0 ? (prevLeadSummary.qualified / prevLeadSummary.total) * 100 : 0,
          "PERCENTAGE",
          true
        ),
        totalLeads: this.computeMetricValue(currLeadSummary.total, prevLeadSummary.total, "INTEGER", true),
        qualifiedLeads: this.computeMetricValue(currLeadSummary.qualified, prevLeadSummary.qualified, "INTEGER", true),
        activePipelineLeads: this.computeMetricValue(currLeadSummary.activePipeline, prevLeadSummary.activePipeline, "INTEGER", true),
        unassignedLeads: this.computeMetricValue(currLeadSummary.unassigned, prevLeadSummary.unassigned, "INTEGER", false),
        wonLeads: this.computeMetricValue(currLeadSummary.won, prevLeadSummary.won, "INTEGER", true),
        lostLeads: this.computeMetricValue(currLeadSummary.lost, prevLeadSummary.lost, "INTEGER", false),
        overdueFollowUps: this.computeMetricValue(currLeadSummary.overdueFollowUps, undefined, "INTEGER", false),
        avgFirstResponseHours: this.computeMetricValue(avgResponseHours, undefined, "HOURS", false),
        medianFirstResponseHours: this.computeMetricValue(medianResponseHours, undefined, "HOURS", false),
        responseSlaComplianceRate: this.computeMetricValue(slaComplianceRate, undefined, "PERCENTAGE", true),
        totalSiteVisits: this.computeMetricValue(currVisitSummary.total, prevVisitSummary.total, "INTEGER", true),
        completedSiteVisits: this.computeMetricValue(currVisitSummary.completed, prevVisitSummary.completed, "INTEGER", true),
        siteVisitCompletionRate: this.computeMetricValue(completionRate, undefined, "PERCENTAGE", true),
        cancelledSiteVisits: this.computeMetricValue(currVisitSummary.cancelled, undefined, "INTEGER", false),
        noShowSiteVisits: this.computeMetricValue(currVisitSummary.noShow, undefined, "INTEGER", false),
        leadToVisitConversionRate: this.computeMetricValue(leadToVisitRate, undefined, "PERCENTAGE", true),
        communicationDeliveryRate: this.computeMetricValue(commDeliveryRate, undefined, "PERCENTAGE", true),
        communicationFailureCount: this.computeMetricValue(delivery.failed, undefined, "INTEGER", false),
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
        dueToday: currLeadSummary.dueTodayFollowUps,
        overdue: currLeadSummary.overdueFollowUps,
        upcomingNext7Days: currLeadSummary.upcoming7DaysFollowUps,
        withoutFollowUpScheduled: followUpHealthAgg[0] ? followUpHealthAgg[0].totalActive - followUpHealthAgg[0].withFollowUp : 0,
      },
      advisorWorkloadOverview: [],
      dataQualityAlertCount: currLeadSummary.unassigned + (followUpHealthAgg[0] ? followUpHealthAgg[0].totalActive - followUpHealthAgg[0].withFollowUp : 0),
      lastCalculatedAt: new Date().toISOString(),
    };
  }

  /**
   * 2. Funnel Analytics
   * Consolidated database-side aggregation for stage metrics and lost reasons.
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

    const [leadStageStats, stageHistories] = await Promise.all([
      Lead.aggregate<{
        _id: null;
        total: number;
        legacyCount: number;
        stageCounts: { status: LeadStatus; count: number }[];
        lostCounts: { reason: LostReason; count: number }[];
      }>([
        { $match: matchQuery },
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  legacyCount: { $sum: { $cond: [{ $lt: ["$createdAt", new Date(STAGE_HISTORY_COVERAGE_START)] }, 1, 0] } },
                },
              },
            ],
            stageCounts: [
              { $group: { _id: "$status", count: { $sum: 1 } } },
              { $project: { status: "$_id", count: 1, _id: 0 } },
            ],
            lostCounts: [
              { $match: { status: "LOST", lostReason: { $exists: true, $ne: null } } },
              { $group: { _id: "$lostReason", count: { $sum: 1 } } },
              { $project: { reason: "$_id", count: 1, _id: 0 } },
            ],
          },
        },
        {
          $project: {
            _id: null,
            total: { $ifNull: [{ $arrayElemAt: ["$summary.total", 0] }, 0] },
            legacyCount: { $ifNull: [{ $arrayElemAt: ["$summary.legacyCount", 0] }, 0] },
            stageCounts: 1,
            lostCounts: 1,
          },
        },
      ]),
      LeadStageHistory.find({ changedAt: { $gte: current.from, $lte: current.to } })
        .select("fromStage durationInPreviousStageMs")
        .lean(),
    ]);

    const stats = leadStageStats[0] || {
      total: 0,
      legacyCount: 0,
      stageCounts: [],
      lostCounts: [],
    };

    const totalEntered = stats.total;
    const stageMap = new Map<LeadStatus, number>(stats.stageCounts.map((s) => [s.status, s.count]));

    // Cumulative progression calculation for funnel order
    const orderedStages: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "NEGOTIATING", "WON"];
    const stages: FunnelStageMetric[] = [];

    // Duration mapping from append-only stage history
    const durationMap = new Map<LeadStatus, number[]>();
    for (const sh of stageHistories) {
      if (sh.durationInPreviousStageMs && sh.fromStage) {
        const list = durationMap.get(sh.fromStage) || [];
        list.push(sh.durationInPreviousStageMs / 3600000);
        durationMap.set(sh.fromStage, list);
      }
    }

    let prevCount = totalEntered;
    for (let i = 0; i < orderedStages.length; i++) {
      const st = orderedStages[i];
      const count = stageMap.get(st) || 0;
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
    const rawLostCounts = new Map(stats.lostCounts.map((l) => [l.reason, l.count]));
    const totalLost = stats.stageCounts.find((s) => s.status === "LOST")?.count || 0;

    const lostReasonBreakdown = LOST_REASONS.map((r) => {
      const count = rawLostCounts.get(r) || 0;
      return {
        reason: r,
        label: r.replace(/_/g, " "),
        count,
        percentage: totalLost > 0 ? Math.round((count / totalLost) * 100) : 0,
      };
    }).sort((a, b) => b.count - a.count);

    return {
      periodLabel: current.label,
      totalEntered,
      stages,
      lostReasonBreakdown,
      stageHistoryCoverageStartDate: STAGE_HISTORY_COVERAGE_START,
      legacyLeadCount: stats.legacyCount,
    };
  }

  /**
   * 3. Property & Location Demand Analytics
   * Database-side group by propertyId and locationId.
   */
  public static async getPropertyDemandAnalytics(
    params: AnalyticsFilterParams,
    session: AdminSession
  ): Promise<{ properties: PropertyDemandItem[]; locations: LocationDemandItem[] }> {
    await connectToDatabase();
    const { current } = this.resolveDateRange(params);

    const [leadAgg, visitAgg, properties, locations] = await Promise.all([
      // Lead demand breakdown
      Lead.aggregate<{
        propCounts: {
          _id: Types.ObjectId;
          inqCount: number;
          qualCount: number;
          activeCount: number;
          wonCount: number;
          sourceCounts: { source: LeadSource; count: number }[];
        }[];
        locCounts: { _id: Types.ObjectId; inqCount: number }[];
      }>([
        {
          $match: {
            createdAt: { $gte: current.from, $lte: current.to },
            status: { $ne: "SPAM" },
          },
        },
        {
          $facet: {
            propCounts: [
              { $match: { propertyId: { $exists: true, $ne: null } } },
              {
                $group: {
                  _id: { propertyId: "$propertyId", source: "$source" },
                  count: { $sum: 1 },
                  qualCount: { $sum: { $cond: [{ $in: ["$status", ["QUALIFIED", "NURTURING", "NEGOTIATING", "WON"]] }, 1, 0] } },
                  activeCount: { $sum: { $cond: [{ $in: ["$status", ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "NEGOTIATING"]] }, 1, 0] } },
                  wonCount: { $sum: { $cond: [{ $eq: ["$status", "WON"] }, 1, 0] } },
                },
              },
              {
                $group: {
                  _id: "$_id.propertyId",
                  inqCount: { $sum: "$count" },
                  qualCount: { $sum: "$qualCount" },
                  activeCount: { $sum: "$activeCount" },
                  wonCount: { $sum: "$wonCount" },
                  sourceCounts: { $push: { source: "$_id.source", count: "$count" } },
                },
              },
            ],
            locCounts: [
              { $match: { locationId: { $exists: true, $ne: null } } },
              {
                $group: {
                  _id: "$locationId",
                  inqCount: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]),

      // Site Visit demand breakdown
      SiteVisit.aggregate<{
        propVisits: { _id: Types.ObjectId; totalVisits: number; completedVisits: number }[];
        locVisits: { _id: Types.ObjectId; totalVisits: number }[];
      }>([
        {
          $match: {
            createdAt: { $gte: current.from, $lte: current.to },
          },
        },
        {
          $facet: {
            propVisits: [
              { $match: { propertyId: { $exists: true, $ne: null } } },
              {
                $group: {
                  _id: "$propertyId",
                  totalVisits: { $sum: 1 },
                  completedVisits: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
                },
              },
            ],
            locVisits: [
              { $match: { locationId: { $exists: true, $ne: null } } },
              {
                $group: {
                  _id: "$locationId",
                  totalVisits: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]),

      Property.find().select("title slug locationId propertyType publicationStatus").lean(),
      Location.find().select("name slug state publicationStatus").lean(),
    ]);

    const leadPropMap = new Map(
      (leadAgg[0]?.propCounts || []).map((p) => [p._id.toString(), p])
    );
    const leadLocMap = new Map(
      (leadAgg[0]?.locCounts || []).map((l) => [l._id.toString(), l.inqCount])
    );
    const visitPropMap = new Map(
      (visitAgg[0]?.propVisits || []).map((v) => [v._id.toString(), v])
    );
    const visitLocMap = new Map(
      (visitAgg[0]?.locVisits || []).map((v) => [v._id.toString(), v.totalVisits])
    );
    const locNameMap = new Map(locations.map((l) => [l._id.toString(), l.name]));

    const propertyItems: PropertyDemandItem[] = properties.map((p) => {
      const pid = p._id.toString();
      const lData = leadPropMap.get(pid);
      const vData = visitPropMap.get(pid);

      const inq = lData?.inqCount || 0;
      const visits = vData?.totalVisits || 0;
      const inqToVisit = inq > 0 ? Math.round((visits / inq) * 100) : 0;

      return {
        propertyId: pid,
        title: p.title,
        slug: p.slug,
        locationName: locNameMap.get(p.locationId?.toString() || "") || "Jaipur",
        propertyType: p.propertyType,
        inquiryCount: inq,
        qualifiedLeadCount: lData?.qualCount || 0,
        siteVisitRequestedCount: visits,
        siteVisitCompletedCount: vData?.completedVisits || 0,
        activeLeadsCount: lData?.activeCount || 0,
        wonLeadsCount: lData?.wonCount || 0,
        inquiryToVisitRate: inqToVisit,
        sourceMix: lData?.sourceCounts || [],
      };
    }).sort((a, b) => b.inquiryCount - a.inquiryCount);

    const locationItems: LocationDemandItem[] = locations.map((loc) => {
      const lid = loc._id.toString();
      const inq = leadLocMap.get(lid) || 0;
      const visits = visitLocMap.get(lid) || 0;
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
   * Aggregated advisor metrics.
   */
  public static async getAdvisorWorkloadAnalytics(
    params: AnalyticsFilterParams,
    session: AdminSession
  ): Promise<AdvisorAnalyticsItem[]> {
    await connectToDatabase();
    const { current } = this.resolveDateRange(params);
    const now = new Date();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const leadMatch: Record<string, any> = {
      createdAt: { $gte: current.from, $lte: current.to },
      assignedToId: { $exists: true, $ne: null, $nin: ["", null] },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const visitMatch: Record<string, any> = {
      createdAt: { $gte: current.from, $lte: current.to },
      assignedAdvisorId: { $exists: true, $ne: null, $nin: ["", null] },
    };

    if (session.user.role === "EDITOR") {
      leadMatch.assignedToId = session.user.id;
      visitMatch.assignedAdvisorId = session.user.id;
    }

    const [advisorLeads, advisorVisits] = await Promise.all([
      Lead.aggregate<{
        _id: string;
        name: string;
        email: string;
        newAssignments: number;
        activeLeads: number;
        wonCount: number;
        overdueFollowUps: number;
      }>([
        { $match: leadMatch },
        {
          $group: {
            _id: "$assignedToId",
            name: { $first: "$assignedToName" },
            email: { $first: "$assignedToEmail" },
            newAssignments: { $sum: 1 },
            activeLeads: { $sum: { $cond: [{ $in: ["$status", ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "NEGOTIATING"]] }, 1, 0] } },
            wonCount: { $sum: { $cond: [{ $eq: ["$status", "WON"] }, 1, 0] } },
            overdueFollowUps: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ifNull: ["$nextFollowUpAt", false] },
                      { $lt: ["$nextFollowUpAt", now] },
                      { $not: [{ $in: ["$status", ["WON", "LOST", "SPAM", "ARCHIVED"]] }] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      SiteVisit.aggregate<{
        _id: string;
        name: string;
        email: string;
        upcomingVisits: number;
        completedVisits: number;
      }>([
        { $match: visitMatch },
        {
          $group: {
            _id: "$assignedAdvisorId",
            name: { $first: "$assignedAdvisorName" },
            email: { $first: "$assignedAdvisorEmail" },
            upcomingVisits: { $sum: { $cond: [{ $in: ["$status", ["REQUESTED", "CONFIRMED"]] }, 1, 0] } },
            completedVisits: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const visitMap = new Map(advisorVisits.map((v) => [v._id, v]));
    const allAdvisorIds = Array.from(new Set([...advisorLeads.map((l) => l._id), ...advisorVisits.map((v) => v._id)]));

    return allAdvisorIds.map((aid) => {
      const leadItem = advisorLeads.find((l) => l._id === aid);
      const visitItem = visitMap.get(aid);

      const name = leadItem?.name || visitItem?.name || "Advisor";
      const email = leadItem?.email || visitItem?.email || "advisor@ratiwal.com";
      const newAssignments = leadItem?.newAssignments || 0;

      return {
        advisorId: aid,
        advisorName: name,
        advisorEmail: email,
        assignedActiveLeads: leadItem?.activeLeads || 0,
        newAssignmentsInPeriod: newAssignments,
        overdueFollowUps: leadItem?.overdueFollowUps || 0,
        completedFollowUpsInPeriod: 0,
        upcomingSiteVisits: visitItem?.upcomingVisits || 0,
        completedSiteVisitsInPeriod: visitItem?.completedVisits || 0,
        avgFirstResponseHours: null,
        medianFirstResponseHours: null,
        responseSlaMetCount: 0,
        responseSlaMissedCount: 0,
        slaCompliancePercent: null,
        wonLeadsCount: leadItem?.wonCount || 0,
        confidence: newAssignments >= 5 ? ("HIGH" as const) : ("LOW_SAMPLE" as const),
      };
    });
  }

  /**
   * 5. Site Visit Analytics
   * Database-side group for tour breakdown and cancellation reasons.
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

    const [summaryFacet] = await SiteVisit.aggregate<{
      summary: {
        totalRequested: number;
        totalScheduled: number;
        totalConfirmed: number;
        totalCompleted: number;
        totalCancelled: number;
        totalNoShow: number;
      }[];
      cancelReasons: { _id: CancellationReason; count: number }[];
      modes: { _id: string; count: number }[];
      avgInqHours: { avgHours: number }[];
    }>([
      { $match: matchQuery },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalRequested: { $sum: 1 },
                totalScheduled: { $sum: { $cond: [{ $ifNull: ["$scheduledStartAt", false] }, 1, 0] } },
                totalConfirmed: { $sum: { $cond: [{ $in: ["$status", ["CONFIRMED", "COMPLETED"]] }, 1, 0] } },
                totalCompleted: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
                totalCancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
                totalNoShow: { $sum: { $cond: [{ $eq: ["$status", "NO_SHOW"] }, 1, 0] } },
              },
            },
          ],
          cancelReasons: [
            { $match: { status: "CANCELLED", cancellationReason: { $exists: true, $ne: null } } },
            { $group: { _id: "$cancellationReason", count: { $sum: 1 } } },
          ],
          modes: [
            {
              $group: {
                _id: { $ifNull: ["$meetingMode", "IN_PERSON"] },
                count: { $sum: 1 },
              },
            },
          ],
          avgInqHours: [
            { $match: { scheduledStartAt: { $exists: true, $ne: null } } },
            {
              $project: {
                diffHours: {
                  $divide: [
                    { $max: [0, { $subtract: ["$scheduledStartAt", "$createdAt"] }] },
                    3600000,
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgHours: { $avg: "$diffHours" },
              },
            },
          ],
        },
      },
    ]);

    const sum = summaryFacet.summary[0] || {
      totalRequested: 0,
      totalScheduled: 0,
      totalConfirmed: 0,
      totalCompleted: 0,
      totalCancelled: 0,
      totalNoShow: 0,
    };

    const concluded = sum.totalCompleted + sum.totalCancelled + sum.totalNoShow;
    const completionRate = concluded > 0 ? Math.round((sum.totalCompleted / concluded) * 100) : 0;
    const cancellationRate = concluded > 0 ? Math.round((sum.totalCancelled / concluded) * 100) : 0;
    const noShowRate = concluded > 0 ? Math.round((sum.totalNoShow / concluded) * 100) : 0;

    const avgInqToVisit = summaryFacet.avgInqHours[0] ? Math.round(summaryFacet.avgInqHours[0].avgHours) : null;

    // Cancellation Reasons Breakdown
    const cancelMap = new Map(summaryFacet.cancelReasons.map((c) => [c._id, c.count]));
    const cancellationReasonBreakdown = CANCELLATION_REASONS.map((r) => {
      const count = cancelMap.get(r) || 0;
      return {
        reason: r,
        label: r.replace(/_/g, " "),
        count,
        percentage: sum.totalCancelled > 0 ? Math.round((count / sum.totalCancelled) * 100) : 0,
      };
    }).sort((a, b) => b.count - a.count);

    // Meeting Mode Breakdown
    const meetingModeBreakdown = summaryFacet.modes.map((m) => ({
      mode: m._id,
      label: m._id.replace(/_/g, " "),
      count: m.count,
    }));

    return {
      periodLabel: current.label,
      totalRequested: sum.totalRequested,
      totalScheduled: sum.totalScheduled,
      totalConfirmed: sum.totalConfirmed,
      totalCompleted: sum.totalCompleted,
      totalCancelled: sum.totalCancelled,
      totalRescheduled: 0,
      totalNoShow: sum.totalNoShow,
      completionRate,
      cancellationRate,
      noShowRate,
      avgHoursFromInquiryToVisit: avgInqToVisit,
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
