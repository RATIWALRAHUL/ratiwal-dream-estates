import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Lead, type LeadStatus, type LeadPriority, type LeadSource } from "@/models/Lead";
import { Property } from "@/models/Property";
import { Location } from "@/models/Location";
import { logger } from "@/lib/logger";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeadMetrics {
  newLeads: number;
  unassignedLeads: number;
  followUpsDue: number;
  qualifiedLeads: number;
  wonLeads: number;
}

export interface LeadListFilters {
  search?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource;
  assignedToId?: string;
  propertyId?: string;
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
  followUpStatus?: "overdue" | "due_today" | "has_followup" | "no_followup";
  page?: number;
  perPage?: number;
}

export interface LeadListItem {
  id: string;
  referenceNumber: string;
  fullName: string;
  maskedPhone: string;
  displayEmail?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  assignedToName?: string;
  assignedToEmail?: string;
  propertyTitle?: string;
  locationName?: string;
  nextFollowUpAt?: string;
  isFollowUpOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadListResult {
  items: LeadListItem[];
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface LeadDetail {
  id: string;
  referenceNumber: string;
  fullName: string;
  displayPhone: string;
  normalizedPhone: string;
  displayEmail?: string;
  preferredContactMethod: string;
  preferredLanguage?: string;
  source: LeadSource;
  propertyId?: string;
  propertyTitle?: string;
  locationId?: string;
  locationName?: string;
  propertyTypeInterest?: string;
  budgetMinimumPaise?: number;
  budgetMaximumPaise?: number;
  areaMinimumSqFt?: number;
  areaMaximumSqFt?: number;
  purchaseTimeline?: string;
  investmentPurpose?: string;
  message?: string;
  status: LeadStatus;
  priority: LeadPriority;
  assignedToId?: string;
  assignedToEmail?: string;
  assignedToName?: string;
  assignedAt?: string;
  nextFollowUpAt?: string;
  lastContactedAt?: string;
  lostReason?: string;
  lostExplanation?: string;
  archivedAt?: string;
  consentGranted: boolean;
  consentTextVersion: string;
  privacyPolicyVersion: string;
  consentTimestamp: string;
  consentSource: string;
  consentWithdrawnAt?: string;
  landingPath?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  abuseStatus: string;
  anonymizedAt?: string;
  retentionReviewAt: string;
  timeline: {
    id: string;
    eventType: string;
    actorType: string;
    actorName?: string;
    actorEmail?: string;
    summary: string;
    occurredAt: string;
  }[];
  notes: {
    id: string;
    body: string;
    authorName: string;
    authorEmail: string;
    createdAt: string;
    editedAt?: string;
  }[];
  contactAttempts: {
    id: string;
    type: string;
    outcome: string;
    note?: string;
    actorName: string;
    nextFollowUpAt?: string;
    occurredAt: string;
  }[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maskPhone(displayPhone: string): string {
  const parts = displayPhone.split(" ");
  if (parts.length < 2) return "●●●●●●●●";
  const visibleParts = parts.slice(0, -1);
  return `${visibleParts.join(" ")} ●●●●`;
}

function buildQuery(filters: LeadListFilters, role: string, userId?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {
    anonymizedAt: { $exists: false },
  };

  // EDITOR scope: only assigned leads
  if (role === "EDITOR" && userId) {
    query.assignedToId = userId;
  }

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.source) query.source = filters.source;
  if (filters.assignedToId) query.assignedToId = filters.assignedToId;
  if (filters.propertyId) query.propertyId = filters.propertyId;
  if (filters.locationId) query.locationId = filters.locationId;

  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }

  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  if (filters.followUpStatus === "overdue") {
    query.nextFollowUpAt = { $lt: now };
    query.status = { $nin: ["WON", "LOST", "SPAM", "ARCHIVED"] };
  } else if (filters.followUpStatus === "due_today") {
    query.nextFollowUpAt = { $gte: now, $lte: todayEnd };
  } else if (filters.followUpStatus === "has_followup") {
    query.nextFollowUpAt = { $exists: true };
  } else if (filters.followUpStatus === "no_followup") {
    query.nextFollowUpAt = { $exists: false };
    query.status = { $nin: ["WON", "LOST", "SPAM", "ARCHIVED"] };
  }

  // Text search on name, phone, email, reference (prefix safe)
  if (filters.search && filters.search.trim()) {
    const safe = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { fullName: { $regex: safe, $options: "i" } },
      { referenceNumber: { $regex: safe, $options: "i" } },
      { displayPhone: { $regex: safe, $options: "i" } },
      { displayEmail: { $regex: safe, $options: "i" } },
    ];
  }

  return query;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Returns dashboard-level lead metrics using parallel DB counts.
 * Respects role scoping.
 */
export async function getLeadMetrics(role: string, userId?: string): Promise<LeadMetrics> {
  await connectToDatabase();
  const now = new Date();

  const scopeFilter = role === "EDITOR" && userId ? { assignedToId: userId } : {};
  const activeFilter = { ...scopeFilter, anonymizedAt: { $exists: false } };

  const [newLeads, unassignedLeads, followUpsDue, qualifiedLeads, wonLeads] = await Promise.all([
    Lead.countDocuments({ ...activeFilter, status: "NEW" }),
    Lead.countDocuments({ ...activeFilter, assignedToId: { $exists: false }, status: { $nin: ["WON", "LOST", "SPAM", "ARCHIVED"] } }),
    Lead.countDocuments({ ...activeFilter, nextFollowUpAt: { $lt: now }, status: { $nin: ["WON", "LOST", "SPAM", "ARCHIVED"] } }),
    Lead.countDocuments({ ...activeFilter, status: "QUALIFIED" }),
    Lead.countDocuments({ ...activeFilter, status: "WON" }),
  ]);

  return { newLeads, unassignedLeads, followUpsDue, qualifiedLeads, wonLeads };
}

/**
 * Returns a paginated, filtered list of leads.
 * Selected fields only — never loads full embedded arrays.
 */
export async function getLeads(
  filters: LeadListFilters,
  role: string,
  userId?: string
): Promise<LeadListResult> {
  await connectToDatabase();

  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.min(50, Math.max(10, filters.perPage ?? 25));
  const skip = (page - 1) * perPage;
  const now = new Date();

  const query = buildQuery(filters, role, userId);

  const [items, totalCount] = await Promise.all([
    Lead.find(query, {
      referenceNumber: 1,
      fullName: 1,
      displayPhone: 1,
      displayEmail: 1,
      source: 1,
      status: 1,
      priority: 1,
      assignedToName: 1,
      assignedToEmail: 1,
      propertyId: 1,
      locationId: 1,
      nextFollowUpAt: 1,
      createdAt: 1,
      updatedAt: 1,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),
    Lead.countDocuments(query),
  ]);

  // Collect property and location IDs for name resolution
  const propertyIds = [...new Set(items.map((i) => i.propertyId?.toString()).filter(Boolean))];
  const locationIds = [...new Set(items.map((i) => i.locationId?.toString()).filter(Boolean))];

  const [properties, locations] = await Promise.all([
    propertyIds.length > 0
      ? Property.find({ _id: { $in: propertyIds.filter(Boolean) as string[] } }, { _id: 1, title: 1 }).lean()
      : Promise.resolve([]),
    locationIds.length > 0
      ? Location.find({ _id: { $in: locationIds.filter(Boolean) as string[] } }, { _id: 1, name: 1 }).lean()
      : Promise.resolve([]),
  ]);

  const propertyMap = new Map(properties.map((p) => [p._id.toString(), p.title]));
  const locationMap = new Map(locations.map((l) => [l._id.toString(), l.name]));

  const mapped: LeadListItem[] = items.map((lead) => ({
    id: lead._id.toString(),
    referenceNumber: lead.referenceNumber,
    fullName: lead.fullName,
    maskedPhone: maskPhone(lead.displayPhone),
    displayEmail: lead.displayEmail,
    source: lead.source as LeadSource,
    status: lead.status as LeadStatus,
    priority: lead.priority as LeadPriority,
    assignedToName: lead.assignedToName,
    assignedToEmail: lead.assignedToEmail,
    propertyTitle: lead.propertyId ? propertyMap.get(lead.propertyId.toString()) : undefined,
    locationName: lead.locationId ? locationMap.get(lead.locationId.toString()) : undefined,
    nextFollowUpAt: lead.nextFollowUpAt?.toISOString(),
    isFollowUpOverdue: lead.nextFollowUpAt ? lead.nextFollowUpAt < now : false,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }));

  return {
    items: mapped,
    totalCount,
    page,
    perPage,
    totalPages: Math.ceil(totalCount / perPage),
  };
}

/**
 * Returns full lead detail for the detail page.
 * Enforces scope for EDITOR role.
 */
export async function getLeadById(
  leadId: string,
  role: string,
  userId?: string
): Promise<LeadDetail | null> {
  await connectToDatabase();

  const lead = await Lead.findById(leadId).lean();
  if (!lead) return null;

  // EDITOR scope enforcement
  if (role === "EDITOR" && userId && lead.assignedToId !== userId) {
    return null;
  }

  // Resolve property and location names
  const [property, location] = await Promise.all([
    lead.propertyId
      ? Property.findById(lead.propertyId, { title: 1 }).lean()
      : Promise.resolve(null),
    lead.locationId
      ? Location.findById(lead.locationId, { name: 1 }).lean()
      : Promise.resolve(null),
  ]);

  return {
    id: lead._id.toString(),
    referenceNumber: lead.referenceNumber,
    fullName: lead.fullName,
    displayPhone: lead.displayPhone,
    normalizedPhone: lead.normalizedPhone,
    displayEmail: lead.displayEmail,
    preferredContactMethod: lead.preferredContactMethod,
    preferredLanguage: lead.preferredLanguage,
    source: lead.source as LeadSource,
    propertyId: lead.propertyId?.toString(),
    propertyTitle: property ? (property as { title: string }).title : undefined,
    locationId: lead.locationId?.toString(),
    locationName: location ? (location as { name: string }).name : undefined,
    propertyTypeInterest: lead.propertyTypeInterest,
    budgetMinimumPaise: lead.budgetMinimumPaise,
    budgetMaximumPaise: lead.budgetMaximumPaise,
    areaMinimumSqFt: lead.areaMinimumSqFt,
    areaMaximumSqFt: lead.areaMaximumSqFt,
    purchaseTimeline: lead.purchaseTimeline,
    investmentPurpose: lead.investmentPurpose,
    message: lead.message,
    status: lead.status as LeadStatus,
    priority: lead.priority as LeadPriority,
    assignedToId: lead.assignedToId,
    assignedToEmail: lead.assignedToEmail,
    assignedToName: lead.assignedToName,
    assignedAt: lead.assignedAt?.toISOString(),
    nextFollowUpAt: lead.nextFollowUpAt?.toISOString(),
    lastContactedAt: lead.lastContactedAt?.toISOString(),
    lostReason: lead.lostReason,
    lostExplanation: lead.lostExplanation,
    archivedAt: lead.archivedAt?.toISOString(),
    consentGranted: lead.consentGranted,
    consentTextVersion: lead.consentTextVersion,
    privacyPolicyVersion: lead.privacyPolicyVersion,
    consentTimestamp: lead.consentTimestamp.toISOString(),
    consentSource: lead.consentSource,
    consentWithdrawnAt: lead.consentWithdrawnAt?.toISOString(),
    landingPath: lead.landingPath,
    utmSource: lead.utmSource,
    utmMedium: lead.utmMedium,
    utmCampaign: lead.utmCampaign,
    abuseStatus: lead.abuseStatus,
    anonymizedAt: lead.anonymizedAt?.toISOString(),
    retentionReviewAt: lead.retentionReviewAt.toISOString(),
    timeline: (lead.timeline || []).map((t) => ({
      id: t._id?.toString() ?? "",
      eventType: t.eventType,
      actorType: t.actorType,
      actorName: t.actorName,
      actorEmail: t.actorEmail,
      summary: t.summary,
      occurredAt: t.occurredAt.toISOString(),
    })),
    notes: (lead.notes || []).map((n) => ({
      id: n._id?.toString() ?? "",
      body: n.body,
      authorName: n.authorName,
      authorEmail: n.authorEmail,
      createdAt: n.createdAt.toISOString(),
      editedAt: n.editedAt?.toISOString(),
    })),
    contactAttempts: (lead.contactAttempts || []).map((c) => ({
      id: c._id?.toString() ?? "",
      type: c.type,
      outcome: c.outcome,
      note: c.note,
      actorName: c.actorName,
      nextFollowUpAt: c.nextFollowUpAt?.toISOString(),
      occurredAt: c.occurredAt.toISOString(),
    })),
    version: lead.__v ?? 0,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}

/**
 * Retention dry-run report — lists leads approaching or past review date.
 * Does not delete or modify any data.
 */
export async function getRetentionReport(): Promise<{
  dueForReview: number;
  overdue: number;
  anonymized: number;
  oldest?: { referenceNumber: string; createdAt: string; retentionReviewAt: string };
}> {
  await connectToDatabase();
  const now = new Date();

  const [dueForReview, overdue, anonymized, oldest] = await Promise.all([
    Lead.countDocuments({
      retentionReviewAt: { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      anonymizedAt: { $exists: false },
    }),
    Lead.countDocuments({ retentionReviewAt: { $lt: now }, anonymizedAt: { $exists: false } }),
    Lead.countDocuments({ anonymizedAt: { $exists: true } }),
    Lead.findOne({ anonymizedAt: { $exists: false } }, { referenceNumber: 1, createdAt: 1, retentionReviewAt: 1 })
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  logger.info("[Retention] Dry-run report", { dueForReview, overdue, anonymized });

  return {
    dueForReview,
    overdue,
    anonymized,
    oldest: oldest
      ? {
          referenceNumber: oldest.referenceNumber,
          createdAt: oldest.createdAt.toISOString(),
          retentionReviewAt: oldest.retentionReviewAt.toISOString(),
        }
      : undefined,
  };
}
