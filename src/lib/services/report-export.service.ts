/**
 * @file report-export.service.ts
 * @description Report generation and CSV export service for Ratiwal Dream Estates.
 * Implements server-side pagination, strict column allowlists, and CSV formula-injection protection.
 */

import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Lead } from "@/models/Lead";
import { SiteVisit } from "@/models/SiteVisit";
import { Property } from "@/models/Property";

import { NotificationDelivery } from "@/models/NotificationDelivery";

import { AdminSession } from "@/lib/auth/session";
import { ReportType, ReportColumnDefinition, ReportExecutionResult } from "@/types/analytics";

// ─── Report Columns Registry ──────────────────────────────────────────────────

export const REPORT_COLUMN_CATALOG: Record<ReportType, ReportColumnDefinition[]> = {
  INQUIRY_REPORT: [
    { key: "referenceNumber", label: "Reference", description: "Inquiry identifier", category: "IDENTITY" },
    { key: "fullName", label: "Prospect Name", description: "Inquirer full name", category: "IDENTITY" },
    { key: "displayPhone", label: "Phone", description: "Contact number", category: "IDENTITY" },
    { key: "source", label: "Lead Source", description: "Capture origin", category: "METRIC" },
    { key: "propertyTitle", label: "Property Interest", description: "Associated property", category: "METRIC" },
    { key: "status", label: "Current Status", description: "CRM state", category: "STATUS" },
    { key: "createdAt", label: "Received At", description: "Submission date", category: "DATE" },
  ],
  LEAD_PIPELINE_REPORT: [
    { key: "referenceNumber", label: "Reference", description: "Lead code", category: "IDENTITY" },
    { key: "fullName", label: "Client Name", description: "Full client name", category: "IDENTITY" },
    { key: "status", label: "Stage", description: "Pipeline stage", category: "STATUS" },
    { key: "priority", label: "Priority", description: "Urgency level", category: "STATUS" },
    { key: "assignedToName", label: "Assigned Advisor", description: "Managing staff", category: "IDENTITY" },
    { key: "budgetRange", label: "Budget Range", description: "Budget specification", category: "METRIC" },
    { key: "nextFollowUpAt", label: "Next Follow-Up", description: "Scheduled follow-up", category: "DATE" },
    { key: "createdAt", label: "Created At", description: "Lead creation date", category: "DATE" },
  ],
  LEAD_FOLLOWUP_REPORT: [
    { key: "referenceNumber", label: "Reference", description: "Lead code", category: "IDENTITY" },
    { key: "fullName", label: "Client Name", description: "Client name", category: "IDENTITY" },
    { key: "assignedToName", label: "Advisor", description: "Assigned advisor", category: "IDENTITY" },
    { key: "status", label: "Status", description: "Lead stage", category: "STATUS" },
    { key: "nextFollowUpAt", label: "Follow-Up Due", description: "Due timestamp", category: "DATE" },
    { key: "followUpStatus", label: "Schedule Health", description: "Due / Overdue / Upcoming", category: "STATUS" },
  ],
  ADVISOR_WORKLOAD_REPORT: [
    { key: "advisorName", label: "Advisor Name", description: "Staff name", category: "IDENTITY" },
    { key: "advisorEmail", label: "Email", description: "Staff email", category: "IDENTITY" },
    { key: "activeLeads", label: "Active Leads", description: "Current active pipeline", category: "METRIC" },
    { key: "overdueFollowUps", label: "Overdue Follow-ups", description: "Missed follow-up count", category: "METRIC" },
    { key: "upcomingVisits", label: "Upcoming Tours", description: "Scheduled visits", category: "METRIC" },
    { key: "wonLeads", label: "Won Leads", description: "Closed client count", category: "METRIC" },
  ],
  SITE_VISIT_REPORT: [
    { key: "referenceNumber", label: "Visit Ref", description: "Visit identifier", category: "IDENTITY" },
    { key: "visitorName", label: "Visitor Name", description: "Prospect name", category: "IDENTITY" },
    { key: "propertyTitle", label: "Property", description: "Asset location", category: "METRIC" },
    { key: "meetingMode", label: "Tour Mode", description: "In-Person / Virtual", category: "METRIC" },
    { key: "assignedAdvisorName", label: "Advisor", description: "Staff conducting visit", category: "IDENTITY" },
    { key: "status", label: "Status", description: "Visit state", category: "STATUS" },
    { key: "scheduledStartAt", label: "Tour Date & Time", description: "Scheduled time", category: "DATE" },
  ],
  PROPERTY_DEMAND_REPORT: [
    { key: "title", label: "Property Title", description: "Property name", category: "IDENTITY" },
    { key: "locationName", label: "Location", description: "Macro area", category: "METRIC" },
    { key: "propertyType", label: "Type", description: "Asset type", category: "METRIC" },
    { key: "inquiryCount", label: "Total Inquiries", description: "Captured interest", category: "METRIC" },
    { key: "qualifiedLeadCount", label: "Qualified Leads", description: "Verified buyers", category: "METRIC" },
    { key: "siteVisitCount", label: "Site Visits", description: "Tours requested", category: "METRIC" },
    { key: "completedVisits", label: "Completed Tours", description: "Successful visits", category: "METRIC" },
  ],
  LOCATION_DEMAND_REPORT: [
    { key: "name", label: "Location Name", description: "Region name", category: "IDENTITY" },
    { key: "state", label: "State", description: "Territory", category: "IDENTITY" },
    { key: "inquiryCount", label: "Inquiries", description: "Inquiry volume", category: "METRIC" },
    { key: "siteVisitCount", label: "Tours", description: "Visit requests", category: "METRIC" },
    { key: "activePropertiesCount", label: "Active Properties", description: "Live listings", category: "METRIC" },
  ],
  COMMUNICATION_DELIVERY_REPORT: [
    { key: "eventType", label: "Event Type", description: "Transactional event", category: "IDENTITY" },
    { key: "channel", label: "Channel", description: "Email / WhatsApp", category: "METRIC" },
    { key: "maskedRecipient", label: "Recipient", description: "Privacy-masked target", category: "IDENTITY" },
    { key: "provider", label: "Provider", description: "Resend / Meta", category: "METRIC" },
    { key: "status", label: "Delivery Status", description: "Delivered / Bounced / Failed", category: "STATUS" },
    { key: "sentAt", label: "Dispatched At", description: "Send timestamp", category: "DATE" },
  ],
  DATA_QUALITY_REPORT: [
    { key: "category", label: "Domain", description: "Entity area", category: "METRIC" },
    { key: "severity", label: "Severity", description: "Critical / Warning / Info", category: "STATUS" },
    { key: "title", label: "Issue", description: "Data gap description", category: "IDENTITY" },
    { key: "affectedCount", label: "Affected Records", description: "Number of records", category: "METRIC" },
    { key: "impactOnAnalytics", label: "Analytics Impact", description: "Distortion effect", category: "METRIC" },
  ],
};

export class ReportExportService {
  /**
   * Escape spreadsheet-formula prefixes to prevent CSV Injection attacks.
   * Prepends a single quote `'` if the cell begins with `=`, `+`, `-`, `@`, `\t`, or `\r`.
   */
  public static sanitizeCsvCell(value: unknown): string {
    if (value === null || value === undefined) return "";
    let rawStr = String(value);

    // Prevent formula injection on raw or trimmed string
    if (/^[=+\-@\t\r%]/.test(rawStr)) {
      rawStr = `'${rawStr.replace(/^[\t\r]+/, "")}`;
    }

    let str = rawStr.trim();
    if (/^[=+\-@%]/.test(str) && !str.startsWith("'")) {
      str = `'${str}`;
    }

    // Escape quotes and wrap in quotes if containing comma, quotes, or newlines
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      str = `"${str.replace(/"/g, '""')}"`;
    }

    return str;
  }

  /**
   * Generates sanitized UTF-8 CSV string from rows and allowed column headers
   */
  public static generateCsvContent(
    columns: ReportColumnDefinition[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows: Record<string, any>[]
  ): string {
    const headerLine = columns.map((c) => this.sanitizeCsvCell(c.label)).join(",");
    const rowLines = rows.map((row) =>
      columns.map((col) => this.sanitizeCsvCell(row[col.key])).join(",")
    );

    // UTF-8 BOM + CSV lines
    return `\uFEFF${headerLine}\r\n${rowLines.join("\r\n")}`;
  }

  /**
   * Fetch tabular report data with server pagination
   */
  public static async executeReport(
    reportType: ReportType,
    page: number = 1,
    perPage: number = 25,
    session: AdminSession
  ): Promise<ReportExecutionResult> {
    await connectToDatabase();

    const p = Math.max(1, page);
    const limit = Math.min(100, Math.max(1, perPage));
    const skip = (p - 1) * limit;

    const columns = REPORT_COLUMN_CATALOG[reportType] || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let rows: Record<string, any>[] = [];
    let totalRows = 0;

    const now = new Date();

    if (reportType === "INQUIRY_REPORT" || reportType === "LEAD_PIPELINE_REPORT" || reportType === "LEAD_FOLLOWUP_REPORT") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: Record<string, any> = { status: { $ne: "SPAM" } };
      if (session.user.role === "EDITOR") query.assignedToId = session.user.id;

      if (reportType === "LEAD_FOLLOWUP_REPORT") {
        query.nextFollowUpAt = { $exists: true, $ne: null };
      }

      const [count, items, properties] = await Promise.all([
        Lead.countDocuments(query),
        Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Property.find().select("title").lean(),
      ]);

      const propMap = new Map(properties.map((pr) => [pr._id.toString(), pr.title]));
      totalRows = count;

      rows = items.map((l) => {
        let followUpStatus = "No follow-up";
        if (l.nextFollowUpAt) {
          const fDate = new Date(l.nextFollowUpAt);
          if (fDate < now) followUpStatus = "OVERDUE";
          else if (fDate.toDateString() === now.toDateString()) followUpStatus = "DUE TODAY";
          else followUpStatus = "UPCOMING";
        }

        return {
          referenceNumber: l.referenceNumber,
          fullName: l.fullName,
          displayPhone: l.displayPhone,
          source: l.source,
          propertyTitle: l.propertyId ? propMap.get(l.propertyId.toString()) || "General" : "General Inquiry",
          status: l.status,
          priority: l.priority,
          assignedToName: l.assignedToName || "Unassigned",
          budgetRange: l.budgetMaximumPaise ? `Up to ₹${(l.budgetMaximumPaise / 10000000).toFixed(2)} Cr` : "Not specified",
          nextFollowUpAt: l.nextFollowUpAt ? new Date(l.nextFollowUpAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) : "—",
          followUpStatus,
          createdAt: new Date(l.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }),
        };
      });
    } else if (reportType === "SITE_VISIT_REPORT") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: Record<string, any> = {};
      if (session.user.role === "EDITOR") query.assignedAdvisorId = session.user.id;

      const [count, items, properties, leads] = await Promise.all([
        SiteVisit.countDocuments(query),
        SiteVisit.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Property.find().select("title").lean(),
        Lead.find().select("fullName").lean(),
      ]);

      const propMap = new Map(properties.map((p) => [p._id.toString(), p.title]));
      const leadMap = new Map(leads.map((l) => [l._id.toString(), l.fullName]));
      totalRows = count;

      rows = items.map((v) => ({
        referenceNumber: v.referenceNumber,
        visitorName: leadMap.get(v.leadId.toString()) || "Visitor",
        propertyTitle: propMap.get(v.propertyId.toString()) || "Property",
        meetingMode: (v.meetingMode || "IN_PERSON").replace(/_/g, " "),
        assignedAdvisorName: v.assignedAdvisorName || "Unassigned",
        status: v.status,
        scheduledStartAt: v.scheduledStartAt ? new Date(v.scheduledStartAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "Requested",
      }));
    } else if (reportType === "COMMUNICATION_DELIVERY_REPORT") {
      const [count, items] = await Promise.all([
        NotificationDelivery.countDocuments(),
        NotificationDelivery.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ]);
      totalRows = count;
      rows = items.map((d) => ({
        eventType: d.eventType,
        channel: d.channel,
        maskedRecipient: d.maskedRecipient,
        provider: d.provider,
        status: d.status,
        sentAt: d.sentAt ? new Date(d.sentAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "—",
      }));
    } else {
      // Fallback: general query
      totalRows = 0;
      rows = [];
    }

    return {
      reportType,
      columns,
      rows,
      totalRows,
      page: p,
      perPage: limit,
      totalPages: Math.ceil(totalRows / limit),
      generatedAt: new Date().toISOString(),
    };
  }
}
