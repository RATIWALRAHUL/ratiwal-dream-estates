import mongoose, { Schema, Document, Model, Types } from "mongoose";
export * from "@/types/lead";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  CONTACT_METHODS,
  PURCHASE_TIMELINES,
  INVESTMENT_PURPOSES,
  LOST_REASONS,
  ABUSE_STATUSES,
  TIMELINE_EVENT_TYPES,
  CONTACT_ATTEMPT_TYPES,
  CONTACT_ATTEMPT_OUTCOMES,
  type LeadSource,
  type LeadStatus,
  type LeadPriority,
  type ContactMethod,
  type PurchaseTimeline,
  type InvestmentPurpose,
  type LostReason,
  type AbuseStatus,
  type TimelineEventType,
  type ContactAttemptType,
  type ContactAttemptOutcome,
} from "@/types/lead";

// ─── Sub-document Interfaces ───────────────────────────────────────────────────

export interface ILeadTimelineEvent {
  _id?: Types.ObjectId;
  eventType: TimelineEventType;
  /** SYSTEM for automated, ADMIN_USER for staff */
  actorType: "SYSTEM" | "ADMIN_USER";
  actorId?: string;
  actorEmail?: string;
  actorName?: string;
  summary: string;
  metadata?: Record<string, unknown>;
  occurredAt: Date;
}

export interface ILeadNote {
  _id?: Types.ObjectId;
  body: string;
  authorId: string;
  authorEmail: string;
  authorName: string;
  createdAt: Date;
  editedAt?: Date;
}

export interface IContactAttempt {
  _id?: Types.ObjectId;
  type: ContactAttemptType;
  outcome: ContactAttemptOutcome;
  note?: string;
  actorId: string;
  actorEmail: string;
  actorName: string;
  nextFollowUpAt?: Date;
  occurredAt: Date;
}

// ─── Main Lead Interface ───────────────────────────────────────────────────────

export interface ILead extends Document {
  // ── Identity ──────────────────────────────
  referenceNumber: string;
  fullName: string;
  normalizedPhone: string;
  displayPhone: string;
  normalizedEmail?: string;
  displayEmail?: string;
  preferredContactMethod: ContactMethod;
  preferredLanguage?: string;

  // ── Inquiry Context ───────────────────────
  source: LeadSource;
  propertyId?: Types.ObjectId;
  locationId?: Types.ObjectId;
  propertyTypeInterest?: string;
  budgetMinimumPaise?: number;
  budgetMaximumPaise?: number;
  areaMinimumSqFt?: number;
  areaMaximumSqFt?: number;
  purchaseTimeline?: PurchaseTimeline;
  investmentPurpose?: InvestmentPurpose;
  message?: string;

  // ── CRM ───────────────────────────────────
  status: LeadStatus;
  priority: LeadPriority;
  assignedToId?: string;
  assignedToEmail?: string;
  assignedToName?: string;
  assignedAt?: Date;
  nextFollowUpAt?: Date;
  lastContactedAt?: Date;
  lostReason?: LostReason;
  lostExplanation?: string;
  archivedAt?: Date;

  // ── Consent ───────────────────────────────
  consentGranted: boolean;
  consentTextVersion: string;
  privacyPolicyVersion: string;
  consentPurpose: string;
  consentTimestamp: Date;
  consentSource: string;
  consentWithdrawnAt?: Date;
  consentWithdrawalReason?: string;

  // ── Attribution ───────────────────────────
  landingPath?: string;
  referrerDomain?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;

  // ── Protection ────────────────────────────
  submissionFingerprint: string;
  abuseStatus: AbuseStatus;
  anonymizedAt?: Date;
  anonymizationReason?: string;
  retentionReviewAt: Date;

  // ── Embedded sub-documents ────────────────
  timeline: ILeadTimelineEvent[];
  notes: ILeadNote[];
  contactAttempts: IContactAttempt[];

  // ── Optimistic concurrency ────────────────
  __v: number;

  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-document Schemas ─────────────────────────────────────────────────────

const TimelineEventSchema = new Schema<ILeadTimelineEvent>(
  {
    eventType: { type: String, required: true, enum: TIMELINE_EVENT_TYPES },
    actorType: { type: String, required: true, enum: ["SYSTEM", "ADMIN_USER"] },
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

const NoteSchema = new Schema<ILeadNote>(
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
    editedAt: { type: Date },
  },
  { _id: true }
);

const ContactAttemptSchema = new Schema<IContactAttempt>(
  {
    type: { type: String, required: true, enum: CONTACT_ATTEMPT_TYPES },
    outcome: { type: String, required: true, enum: CONTACT_ATTEMPT_OUTCOMES },
    note: { type: String, maxlength: [2000, "Note must not exceed 2000 characters"] },
    actorId: { type: String, required: true },
    actorEmail: { type: String, required: true, lowercase: true, trim: true },
    actorName: { type: String, required: true, trim: true },
    nextFollowUpAt: { type: Date },
    occurredAt: { type: Date, required: true, default: Date.now },
  },
  { _id: true }
);

// ─── Main Lead Schema ──────────────────────────────────────────────────────────

const LeadSchema = new Schema<ILead>(
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
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [200, "Name must not exceed 200 characters"],
    },
    normalizedPhone: {
      type: String,
      required: [true, "Normalized phone is required"],
      trim: true,
      index: true,
    },
    displayPhone: {
      type: String,
      required: [true, "Display phone is required"],
      trim: true,
    },
    normalizedEmail: { type: String, trim: true, lowercase: true, index: true },
    displayEmail: { type: String, trim: true },
    preferredContactMethod: {
      type: String,
      enum: CONTACT_METHODS,
      default: "ANY",
    },
    preferredLanguage: { type: String, trim: true, maxlength: 50 },

    // Inquiry Context
    source: {
      type: String,
      required: [true, "Inquiry source is required"],
      enum: LEAD_SOURCES,
      default: "DIRECT",
      index: true,
    },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", index: true },
    locationId: { type: Schema.Types.ObjectId, ref: "Location", index: true },
    propertyTypeInterest: { type: String, trim: true, maxlength: 100 },
    budgetMinimumPaise: { type: Number, min: 0 },
    budgetMaximumPaise: { type: Number, min: 0 },
    areaMinimumSqFt: { type: Number, min: 0 },
    areaMaximumSqFt: { type: Number, min: 0 },
    purchaseTimeline: { type: String, enum: PURCHASE_TIMELINES },
    investmentPurpose: { type: String, enum: INVESTMENT_PURPOSES },
    message: {
      type: String,
      trim: true,
      maxlength: [2000, "Message must not exceed 2000 characters"],
    },

    // CRM
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "NEW",
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: LEAD_PRIORITIES,
      default: "NORMAL",
      required: true,
    },
    assignedToId: { type: String, index: true },
    assignedToEmail: { type: String, trim: true, lowercase: true },
    assignedToName: { type: String, trim: true },
    assignedAt: { type: Date },
    nextFollowUpAt: { type: Date, index: true },
    lastContactedAt: { type: Date },
    lostReason: { type: String, enum: LOST_REASONS },
    lostExplanation: { type: String, trim: true, maxlength: 1000 },
    archivedAt: { type: Date },

    // Consent
    consentGranted: { type: Boolean, required: true },
    consentTextVersion: { type: String, required: true, trim: true },
    privacyPolicyVersion: { type: String, required: true, trim: true },
    consentPurpose: { type: String, required: true, trim: true },
    consentTimestamp: { type: Date, required: true },
    consentSource: { type: String, required: true, trim: true },
    consentWithdrawnAt: { type: Date },
    consentWithdrawalReason: { type: String, trim: true, maxlength: 1000 },

    // Attribution
    landingPath: { type: String, trim: true, maxlength: 500 },
    referrerDomain: { type: String, trim: true, maxlength: 200 },
    utmSource: { type: String, trim: true, maxlength: 200 },
    utmMedium: { type: String, trim: true, maxlength: 200 },
    utmCampaign: { type: String, trim: true, maxlength: 200 },
    utmTerm: { type: String, trim: true, maxlength: 200 },
    utmContent: { type: String, trim: true, maxlength: 200 },

    // Protection
    submissionFingerprint: { type: String, required: true, trim: true, index: true },
    abuseStatus: { type: String, enum: ABUSE_STATUSES, default: "CLEAN", index: true },
    anonymizedAt: { type: Date },
    anonymizationReason: { type: String, trim: true, maxlength: 500 },
    retentionReviewAt: { type: Date, required: true },

    // Sub-documents
    timeline: { type: [TimelineEventSchema], default: [] },
    notes: { type: [NoteSchema], default: [] },
    contactAttempts: { type: [ContactAttemptSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: "__v",
  }
);

// ─── Compound Indexes (from PRD §32) ─────────────────────────────────────────
LeadSchema.index({ status: 1, createdAt: -1 });
LeadSchema.index({ assignedToId: 1, status: 1, nextFollowUpAt: 1 });
LeadSchema.index({ normalizedPhone: 1, createdAt: -1 });
LeadSchema.index({ normalizedEmail: 1, createdAt: -1 });
LeadSchema.index({ propertyId: 1, createdAt: -1 });
LeadSchema.index({ locationId: 1, createdAt: -1 });
LeadSchema.index({ source: 1, createdAt: -1 });
LeadSchema.index({ nextFollowUpAt: 1, status: 1 });
LeadSchema.index({ submissionFingerprint: 1, createdAt: -1 });
// Duplicate detection index
LeadSchema.index({ normalizedPhone: 1, propertyId: 1, createdAt: -1 });
LeadSchema.index({ normalizedEmail: 1, propertyId: 1, createdAt: -1 });

// ─── Model Export ─────────────────────────────────────────────────────────────
export const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);
