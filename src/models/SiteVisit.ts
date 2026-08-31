import mongoose, { Schema, Document, Model, Types } from "mongoose";
export * from "@/types/site-visit";
import {
  SITE_VISIT_SOURCES,
  MEETING_MODES,
  SITE_VISIT_STATUSES,
  SITE_VISIT_PRIORITIES,
  CONFIRMATION_STATUSES,
  CANCELLATION_REASONS,
  SITE_VISIT_EVENT_TYPES,
  type VisitSource,
  type MeetingMode,
  type SiteVisitStatus,
  type SiteVisitPriority,
  type ConfirmationStatus,
  type CancellationReason,
  type SiteVisitEventType,
} from "@/types/site-visit";

// ─── Sub-document Interfaces ───────────────────────────────────────────────────

export interface ISiteVisitTimelineEvent {
  _id?: Types.ObjectId;
  eventType: SiteVisitEventType;
  actorType: "SYSTEM" | "ADMIN_USER" | "CUSTOMER";
  actorId?: string;
  actorEmail?: string;
  actorName?: string;
  summary: string;
  metadata?: Record<string, unknown>;
  occurredAt: Date;
}

export interface ISiteVisitNote {
  _id?: Types.ObjectId;
  body: string;
  authorId: string;
  authorEmail: string;
  authorName: string;
  createdAt: Date;
}

// ─── Main SiteVisit Interface ──────────────────────────────────────────────────

export interface ISiteVisit extends Document {
  // ── Identity ──────────────────────────────
  referenceNumber: string;
  leadId: Types.ObjectId;
  propertyId: Types.ObjectId;
  locationId?: Types.ObjectId;
  assignedAdvisorId?: string;
  assignedAdvisorName?: string;
  assignedAdvisorEmail?: string;
  requestedBy: "CUSTOMER" | "ADVISOR" | "ADMIN";
  source: VisitSource;

  // ── Schedule ──────────────────────────────
  requestedStartAt: Date;
  requestedEndAt: Date;
  scheduledStartAt?: Date;
  scheduledEndAt?: Date;
  timezone: string;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  meetingMode: MeetingMode;
  visitorCount: number;

  // ── Meeting Information ───────────────────
  meetingPointLabel?: string;
  meetingAddress?: string;
  meetingInstructions?: string;
  virtualMeetingUrl?: string;
  propertyAccessContact?: string;

  // ── Workflow & Outcome ────────────────────
  status: SiteVisitStatus;
  priority: SiteVisitPriority;
  confirmationStatus: ConfirmationStatus;
  cancellationReason?: CancellationReason;
  cancellationNote?: string;
  cancelledAt?: Date;
  completedAt?: Date;
  outcomeSummary?: string;
  customerInterestLevel?: "HIGH" | "MEDIUM" | "LOW" | "UNDECIDED";
  followUpRecommendation?: string;
  noShowRecordedAt?: Date;
  noShowNote?: string;
  archivedAt?: Date;
  archiveReason?: string;

  // ── Sub-documents ─────────────────────────
  timeline: ISiteVisitTimelineEvent[];
  notes: ISiteVisitNote[];

  // ── Optimistic Concurrency ────────────────
  __v: number;

  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-document Schemas ─────────────────────────────────────────────────────

const SiteVisitTimelineEventSchema = new Schema<ISiteVisitTimelineEvent>(
  {
    eventType: { type: String, required: true, enum: SITE_VISIT_EVENT_TYPES },
    actorType: { type: String, required: true, enum: ["SYSTEM", "ADMIN_USER", "CUSTOMER"] },
    actorId: { type: String },
    actorEmail: { type: String },
    actorName: { type: String },
    summary: {
      type: String,
      required: true,
      maxlength: [500, "Timeline summary must not exceed 500 characters"],
    },
    metadata: { type: Schema.Types.Mixed },
    occurredAt: { type: Date, required: true, default: Date.now },
  },
  { _id: true }
);

const SiteVisitNoteSchema = new Schema<ISiteVisitNote>(
  {
    body: {
      type: String,
      required: [true, "Note body is required"],
      minlength: [2, "Note must be at least 2 characters"],
      maxlength: [5000, "Note must not exceed 5000 characters"],
    },
    authorId: { type: String, required: true },
    authorEmail: { type: String, required: true, lowercase: true, trim: true },
    authorName: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ─── Main SiteVisit Schema ────────────────────────────────────────────────────

const SiteVisitSchema = new Schema<ISiteVisit>(
  {
    // Identity
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: [true, "Related Lead ID is required"],
      index: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property ID is required"],
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      index: true,
    },
    assignedAdvisorId: {
      type: String,
      trim: true,
      index: true,
    },
    assignedAdvisorName: { type: String, trim: true },
    assignedAdvisorEmail: { type: String, trim: true, lowercase: true },
    requestedBy: {
      type: String,
      enum: ["CUSTOMER", "ADVISOR", "ADMIN"],
      default: "CUSTOMER",
      required: true,
    },
    source: {
      type: String,
      enum: SITE_VISIT_SOURCES,
      default: "PUBLIC_PROPERTY_PAGE",
      required: true,
      index: true,
    },

    // Schedule
    requestedStartAt: { type: Date, required: true, index: true },
    requestedEndAt: { type: Date, required: true },
    scheduledStartAt: { type: Date, index: true },
    scheduledEndAt: { type: Date },
    timezone: { type: String, default: "Asia/Kolkata", required: true },
    durationMinutes: { type: Number, default: 60, min: 15, max: 480, required: true },
    bufferBeforeMinutes: { type: Number, default: 15, min: 0, max: 120, required: true },
    bufferAfterMinutes: { type: Number, default: 15, min: 0, max: 120, required: true },
    meetingMode: {
      type: String,
      enum: MEETING_MODES,
      default: "IN_PERSON",
      required: true,
    },
    visitorCount: { type: Number, default: 1, min: 1, max: 20, required: true },

    // Meeting Information
    meetingPointLabel: { type: String, trim: true, maxlength: 200 },
    meetingAddress: { type: String, trim: true, maxlength: 500 },
    meetingInstructions: { type: String, trim: true, maxlength: 2000 },
    virtualMeetingUrl: { type: String, trim: true, maxlength: 1000 },
    propertyAccessContact: { type: String, trim: true, maxlength: 300 },

    // Workflow
    status: {
      type: String,
      enum: SITE_VISIT_STATUSES,
      default: "REQUESTED",
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: SITE_VISIT_PRIORITIES,
      default: "NORMAL",
      required: true,
    },
    confirmationStatus: {
      type: String,
      enum: CONFIRMATION_STATUSES,
      default: "UNCONFIRMED",
      required: true,
    },
    cancellationReason: { type: String, enum: CANCELLATION_REASONS },
    cancellationNote: { type: String, trim: true, maxlength: 1000 },
    cancelledAt: { type: Date },
    completedAt: { type: Date },
    outcomeSummary: { type: String, trim: true, maxlength: 2000 },
    customerInterestLevel: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW", "UNDECIDED"],
    },
    followUpRecommendation: { type: String, trim: true, maxlength: 1000 },
    noShowRecordedAt: { type: Date },
    noShowNote: { type: String, trim: true, maxlength: 1000 },
    archivedAt: { type: Date },
    archiveReason: { type: String, trim: true, maxlength: 500 },

    // Sub-documents
    timeline: { type: [SiteVisitTimelineEventSchema], default: [] },
    notes: { type: [SiteVisitNoteSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: "__v",
  }
);

// ─── Compound Indexes (PRD 8 §35) ───────────────────────────────────────────
SiteVisitSchema.index({ leadId: 1, createdAt: -1 });
SiteVisitSchema.index({ createdAt: -1, status: 1 });
SiteVisitSchema.index({ assignedAdvisorId: 1, createdAt: -1 });
SiteVisitSchema.index({ assignedAdvisorId: 1, scheduledStartAt: 1, status: 1 });
SiteVisitSchema.index({ propertyId: 1, scheduledStartAt: 1, status: 1 });
SiteVisitSchema.index({ locationId: 1, scheduledStartAt: 1 });
SiteVisitSchema.index({ status: 1, scheduledStartAt: 1 });
SiteVisitSchema.index({ requestedStartAt: 1, status: 1 });

// ─── Model Export ─────────────────────────────────────────────────────────────
export const SiteVisit: Model<ISiteVisit> =
  mongoose.models.SiteVisit || mongoose.model<ISiteVisit>("SiteVisit", SiteVisitSchema);
