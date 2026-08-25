import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { SiteVisit, type SiteVisitStatus, type SiteVisitPriority, type MeetingMode, type VisitSource } from "@/models/SiteVisit";
import { Lead } from "@/models/Lead";
import { Property } from "@/models/Property";
import { Location } from "@/models/Location";
import { Types } from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteVisitMetrics {
  requested: number;
  awaitingConfirmation: number;
  confirmedToday: number;
  upcoming: number;
  completed: number;
  noShow: number;
}

export interface SiteVisitListFilters {
  search?: string;
  status?: SiteVisitStatus;
  priority?: SiteVisitPriority;
  meetingMode?: MeetingMode;
  source?: VisitSource;
  assignedAdvisorId?: string;
  propertyId?: string;
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
}

export interface SiteVisitListItem {
  id: string;
  referenceNumber: string;
  leadId: string;
  visitorName: string;
  maskedPhone: string;
  visitorEmail?: string;
  propertyId: string;
  propertyTitle: string;
  locationName?: string;
  meetingMode: MeetingMode;
  visitorCount: number;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  requestedStartAt: string;
  requestedEndAt: string;
  timezone: string;
  durationMinutes: number;
  assignedAdvisorId?: string;
  assignedAdvisorName?: string;
  status: SiteVisitStatus;
  priority: SiteVisitPriority;
  confirmationStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteVisitListResult {
  items: SiteVisitListItem[];
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface SiteVisitCalendarEvent {
  id: string;
  referenceNumber: string;
  title: string; // e.g. "Site Visit — Royal Palms"
  startAt: string;
  endAt: string;
  status: SiteVisitStatus;
  priority: SiteVisitPriority;
  meetingMode: MeetingMode;
  assignedAdvisorName?: string;
  propertyTitle: string;
}

export interface SiteVisitDetail {
  id: string;
  referenceNumber: string;
  lead: {
    id: string;
    referenceNumber: string;
    fullName: string;
    displayPhone: string;
    displayEmail?: string;
    preferredContactMethod: string;
    status: string;
    budgetRange?: string;
  };
  property: {
    id: string;
    title: string;
    slug?: string;
    city?: string;
    locationName?: string;
  };
  location?: {
    id: string;
    name: string;
    slug?: string;
  };
  assignedAdvisor?: {
    id: string;
    name: string;
    email: string;
  };
  requestedBy: string;
  source: VisitSource;
  requestedStartAt: string;
  requestedEndAt: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  timezone: string;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  meetingMode: MeetingMode;
  visitorCount: number;
  meetingPointLabel?: string;
  meetingAddress?: string;
  meetingInstructions?: string;
  virtualMeetingUrl?: string;
  propertyAccessContact?: string;
  status: SiteVisitStatus;
  priority: SiteVisitPriority;
  confirmationStatus: string;
  cancellationReason?: string;
  cancellationNote?: string;
  cancelledAt?: string;
  completedAt?: string;
  outcomeSummary?: string;
  customerInterestLevel?: string;
  followUpRecommendation?: string;
  noShowRecordedAt?: string;
  noShowNote?: string;
  archivedAt?: string;
  archiveReason?: string;
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
  }[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maskPhone(displayPhone?: string): string {
  if (!displayPhone) return "●●●●●●●●";
  const parts = displayPhone.split(" ");
  if (parts.length < 2) return "●●●●●●●●";
  const visibleParts = parts.slice(0, -1);
  return `${visibleParts.join(" ")} ●●●●`;
}

function buildQuery(filters: SiteVisitListFilters, role: string, userId?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {
    archivedAt: { $exists: false },
  };

  // EDITOR / Advisor role: see only assigned visits
  if (role === "EDITOR" && userId) {
    query.assignedAdvisorId = userId;
  }

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.meetingMode) query.meetingMode = filters.meetingMode;
  if (filters.source) query.source = filters.source;
  if (filters.assignedAdvisorId) query.assignedAdvisorId = filters.assignedAdvisorId;
  if (filters.propertyId) query.propertyId = filters.propertyId;
  if (filters.locationId) query.locationId = filters.locationId;

  if (filters.dateFrom || filters.dateTo) {
    query.requestedStartAt = {};
    if (filters.dateFrom) query.requestedStartAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.requestedStartAt.$lte = new Date(filters.dateTo);
  }

  if (filters.search && filters.search.trim()) {
    const safe = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { referenceNumber: { $regex: safe, $options: "i" } },
      { assignedAdvisorName: { $regex: safe, $options: "i" } },
      { meetingPointLabel: { $regex: safe, $options: "i" } },
    ];
  }

  return query;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Returns real KPI metrics for the Site Visits operations dashboard.
 */
export async function getSiteVisitMetrics(role: string, userId?: string): Promise<SiteVisitMetrics> {
  await connectToDatabase();
  const now = new Date();

  // Today boundaries in UTC (+5:30 IST window)
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setUTCHours(23, 59, 59, 999);

  const scopeFilter = role === "EDITOR" && userId ? { assignedAdvisorId: userId } : {};
  const activeFilter = { ...scopeFilter, archivedAt: { $exists: false } };

  const [requested, awaitingConfirmation, confirmedToday, upcoming, completed, noShow] = await Promise.all([
    SiteVisit.countDocuments({ ...activeFilter, status: "REQUESTED" }),
    SiteVisit.countDocuments({ ...activeFilter, status: "PENDING_CONFIRMATION" }),
    SiteVisit.countDocuments({
      ...activeFilter,
      status: "CONFIRMED",
      scheduledStartAt: { $gte: todayStart, $lte: todayEnd },
    }),
    SiteVisit.countDocuments({
      ...activeFilter,
      status: "CONFIRMED",
      scheduledStartAt: { $gt: now },
    }),
    SiteVisit.countDocuments({ ...activeFilter, status: "COMPLETED" }),
    SiteVisit.countDocuments({ ...activeFilter, status: "NO_SHOW" }),
  ]);

  return { requested, awaitingConfirmation, confirmedToday, upcoming, completed, noShow };
}

/**
 * Returns paginated, filtered site visits list with resolved customer and property titles.
 */
export async function getSiteVisits(
  filters: SiteVisitListFilters,
  role: string,
  userId?: string
): Promise<SiteVisitListResult> {
  await connectToDatabase();

  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.min(50, Math.max(10, filters.perPage ?? 25));
  const skip = (page - 1) * perPage;

  const query = buildQuery(filters, role, userId);

  const [items, totalCount] = await Promise.all([
    SiteVisit.find(query)
      .sort({ requestedStartAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),
    SiteVisit.countDocuments(query),
  ]);

  const leadIds = [...new Set(items.map((i) => i.leadId?.toString()).filter(Boolean))];
  const propertyIds = [...new Set(items.map((i) => i.propertyId?.toString()).filter(Boolean))];
  const locationIds = [...new Set(items.map((i) => i.locationId?.toString()).filter(Boolean))] as string[];

  const [leads, properties, locations] = await Promise.all([
    leadIds.length > 0 ? Lead.find({ _id: { $in: leadIds } }, { _id: 1, fullName: 1, displayPhone: 1, displayEmail: 1 }).lean() : [],
    propertyIds.length > 0 ? Property.find({ _id: { $in: propertyIds } }, { _id: 1, title: 1 }).lean() : [],
    locationIds.length > 0 ? Location.find({ _id: { $in: locationIds } }, { _id: 1, name: 1 }).lean() : [],
  ]);

  const leadMap = new Map(leads.map((l) => [l._id.toString(), l]));
  const propertyMap = new Map(properties.map((p) => [p._id.toString(), p.title]));
  const locationMap = new Map(locations.map((l) => [l._id.toString(), l.name]));

  const mapped: SiteVisitListItem[] = items.map((item) => {
    const lead = leadMap.get(item.leadId?.toString());
    const propertyTitle = propertyMap.get(item.propertyId?.toString()) || "Property Visit";
    const locationName = item.locationId ? locationMap.get(item.locationId.toString()) : undefined;

    return {
      id: item._id.toString(),
      referenceNumber: item.referenceNumber,
      leadId: item.leadId?.toString() || "",
      visitorName: lead?.fullName || "Prospective Buyer",
      maskedPhone: maskPhone(lead?.displayPhone),
      visitorEmail: lead?.displayEmail,
      propertyId: item.propertyId?.toString() || "",
      propertyTitle,
      locationName,
      meetingMode: item.meetingMode,
      visitorCount: item.visitorCount,
      scheduledStartAt: item.scheduledStartAt?.toISOString(),
      scheduledEndAt: item.scheduledEndAt?.toISOString(),
      requestedStartAt: item.requestedStartAt.toISOString(),
      requestedEndAt: item.requestedEndAt.toISOString(),
      timezone: item.timezone,
      durationMinutes: item.durationMinutes,
      assignedAdvisorId: item.assignedAdvisorId,
      assignedAdvisorName: item.assignedAdvisorName,
      status: item.status,
      priority: item.priority,
      confirmationStatus: item.confirmationStatus,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  });

  return {
    items: mapped,
    totalCount,
    page,
    perPage,
    totalPages: Math.ceil(totalCount / perPage),
  };
}

/**
 * Returns date-bounded visits for the calendar view (Day/Week/Agenda).
 */
export async function getSiteVisitsForCalendar(
  startDate: string,
  endDate: string,
  role: string,
  userId?: string,
  advisorId?: string,
  propertyId?: string
): Promise<SiteVisitCalendarEvent[]> {
  await connectToDatabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {
    archivedAt: { $exists: false },
    status: { $nin: ["CANCELLED", "ARCHIVED"] },
  };

  if (role === "EDITOR" && userId) {
    query.assignedAdvisorId = userId;
  } else if (advisorId) {
    query.assignedAdvisorId = advisorId;
  }

  if (propertyId) {
    query.propertyId = propertyId;
  }

  const startUtc = new Date(startDate);
  const endUtc = new Date(endDate);
  endUtc.setUTCHours(23, 59, 59, 999);

  query.$or = [
    { scheduledStartAt: { $gte: startUtc, $lte: endUtc } },
    { requestedStartAt: { $gte: startUtc, $lte: endUtc } },
  ];

  const visits = await SiteVisit.find(query)
    .sort({ scheduledStartAt: 1, requestedStartAt: 1 })
    .lean();

  const propertyIds = [...new Set(visits.map((v) => v.propertyId.toString()))];
  const properties = await Property.find({ _id: { $in: propertyIds } }, { _id: 1, title: 1 }).lean();
  const propertyMap = new Map(properties.map((p) => [p._id.toString(), p.title]));

  return visits.map((v) => {
    const propTitle = propertyMap.get(v.propertyId.toString()) || "Property Visit";
    const start = (v.scheduledStartAt || v.requestedStartAt).toISOString();
    const end = (v.scheduledEndAt || v.requestedEndAt).toISOString();

    return {
      id: v._id.toString(),
      referenceNumber: v.referenceNumber,
      title: `${v.meetingMode === "VIRTUAL_TOUR" ? "Virtual" : "Site Visit"} — ${propTitle}`,
      startAt: start,
      endAt: end,
      status: v.status,
      priority: v.priority,
      meetingMode: v.meetingMode,
      assignedAdvisorName: v.assignedAdvisorName,
      propertyTitle: propTitle,
    };
  });
}

/**
 * Returns full Site Visit detail view by ID.
 * Enforces role access scoping for EDITORs.
 */
export async function getSiteVisitById(
  visitId: string,
  role: string,
  userId?: string
): Promise<SiteVisitDetail | null> {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(visitId)) return null;

  const visit = await SiteVisit.findById(visitId).lean();
  if (!visit) return null;

  // EDITOR role scoping
  if (role === "EDITOR" && userId && visit.assignedAdvisorId !== userId) {
    return null;
  }

  const [lead, property, location] = await Promise.all([
    Lead.findById(visit.leadId).lean(),
    Property.findById(visit.propertyId, { title: 1, slug: 1, "location.city": 1 }).lean(),
    visit.locationId ? Location.findById(visit.locationId, { name: 1, slug: 1 }).lean() : null,
  ]);

  return {
    id: visit._id.toString(),
    referenceNumber: visit.referenceNumber,
    lead: {
      id: lead?._id.toString() || "",
      referenceNumber: lead?.referenceNumber || "",
      fullName: lead?.fullName || "Prospective Buyer",
      displayPhone: lead?.displayPhone || "",
      displayEmail: lead?.displayEmail,
      preferredContactMethod: lead?.preferredContactMethod || "ANY",
      status: lead?.status || "NEW",
    },
    property: {
      id: property?._id.toString() || "",
      title: property ? (property as { title: string }).title : "Property",
      slug: property ? (property as { slug?: string }).slug : undefined,
    },
    location: location
      ? {
          id: location._id.toString(),
          name: (location as { name: string }).name,
          slug: (location as { slug?: string }).slug,
        }
      : undefined,
    assignedAdvisor: visit.assignedAdvisorId
      ? {
          id: visit.assignedAdvisorId,
          name: visit.assignedAdvisorName || "Advisor",
          email: visit.assignedAdvisorEmail || "",
        }
      : undefined,
    requestedBy: visit.requestedBy,
    source: visit.source,
    requestedStartAt: visit.requestedStartAt.toISOString(),
    requestedEndAt: visit.requestedEndAt.toISOString(),
    scheduledStartAt: visit.scheduledStartAt?.toISOString(),
    scheduledEndAt: visit.scheduledEndAt?.toISOString(),
    timezone: visit.timezone,
    durationMinutes: visit.durationMinutes,
    bufferBeforeMinutes: visit.bufferBeforeMinutes,
    bufferAfterMinutes: visit.bufferAfterMinutes,
    meetingMode: visit.meetingMode,
    visitorCount: visit.visitorCount,
    meetingPointLabel: visit.meetingPointLabel,
    meetingAddress: visit.meetingAddress,
    meetingInstructions: visit.meetingInstructions,
    virtualMeetingUrl: visit.virtualMeetingUrl,
    propertyAccessContact: visit.propertyAccessContact,
    status: visit.status,
    priority: visit.priority,
    confirmationStatus: visit.confirmationStatus,
    cancellationReason: visit.cancellationReason,
    cancellationNote: visit.cancellationNote,
    cancelledAt: visit.cancelledAt?.toISOString(),
    completedAt: visit.completedAt?.toISOString(),
    outcomeSummary: visit.outcomeSummary,
    customerInterestLevel: visit.customerInterestLevel,
    followUpRecommendation: visit.followUpRecommendation,
    noShowRecordedAt: visit.noShowRecordedAt?.toISOString(),
    noShowNote: visit.noShowNote,
    archivedAt: visit.archivedAt?.toISOString(),
    archiveReason: visit.archiveReason,
    timeline: (visit.timeline || []).map((t) => ({
      id: t._id?.toString() || "",
      eventType: t.eventType,
      actorType: t.actorType,
      actorName: t.actorName,
      actorEmail: t.actorEmail,
      summary: t.summary,
      occurredAt: t.occurredAt.toISOString(),
    })),
    notes: (visit.notes || []).map((n) => ({
      id: n._id?.toString() || "",
      body: n.body,
      authorName: n.authorName,
      authorEmail: n.authorEmail,
      createdAt: n.createdAt.toISOString(),
    })),
    version: visit.__v ?? 0,
    createdAt: visit.createdAt.toISOString(),
    updatedAt: visit.updatedAt.toISOString(),
  };
}
