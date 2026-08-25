import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { AdminRole } from "@/lib/auth/session";

export type AuditAction =
  | "PROPERTY_CREATED"
  | "PROPERTY_UPDATED"
  | "PROPERTY_SUBMITTED_FOR_REVIEW"
  | "PROPERTY_RETURNED_TO_DRAFT"
  | "PROPERTY_PUBLISHED"
  | "PROPERTY_ARCHIVED"
  | "PROPERTY_RESTORED"
  | "PUBLISHED_SLUG_CHANGED"
  | "LOCATION_CREATED"
  | "LOCATION_UPDATED"
  | "LOCATION_SUBMITTED_FOR_REVIEW"
  | "LOCATION_RETURNED_TO_DRAFT"
  | "LOCATION_PUBLISHED"
  | "LOCATION_ARCHIVED"
  | "LOCATION_RESTORED"
  | "LOCATION_SLUG_CHANGED"
  | "MICRO_MARKET_ADDED"
  | "MICRO_MARKET_UPDATED"
  | "MICRO_MARKET_REMOVED"
  | "INFRASTRUCTURE_ADDED"
  | "INFRASTRUCTURE_REMOVED"
  | "CONNECTIVITY_ADDED"
  | "CONNECTIVITY_REMOVED"
  | "MARKET_OBSERVATION_ADDED"
  | "MARKET_OBSERVATION_REMOVED"
  | "PLOT_CREATED"
  | "PLOT_UPDATED"
  | "PLOT_STATUS_CHANGED"
  | "PLOT_DELETED"
  // PRD 6: Media & Document audit actions
  | "UPLOAD_AUTHORIZED"
  | "UPLOAD_COMPLETED"
  | "UPLOAD_REJECTED"
  | "ASSET_QUARANTINED"
  | "ASSET_APPROVED"
  | "ASSET_ATTACHED"
  | "ASSET_DETACHED"
  | "PRIMARY_IMAGE_CHANGED"
  | "MEDIA_REORDERED"
  | "ALT_TEXT_CHANGED"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_VERSION_REPLACED"
  | "DOCUMENT_VISIBILITY_CHANGED"
  | "PRIVATE_DOCUMENT_DOWNLOADED"
  | "ASSET_ARCHIVED"
  | "PROVIDER_OBJECT_DELETED"
  // Legacy
  | "MEDIA_UPDATED"
  | "PRIMARY_MEDIA_CHANGED"
  | "DOCUMENT_UPDATED"
  | "RERA_UPDATED"
  | "VERIFICATION_STATUS_CHANGED"
  // PRD 7: Lead CRM audit actions
  | "LEAD_CREATED"
  | "LEAD_VIEWED"
  | "LEAD_ASSIGNED"
  | "LEAD_REASSIGNED"
  | "LEAD_STATUS_CHANGED"
  | "LEAD_PRIORITY_CHANGED"
  | "LEAD_NOTE_ADDED"
  | "LEAD_CONTACT_RECORDED"
  | "LEAD_FOLLOWUP_SCHEDULED"
  | "LEAD_FOLLOWUP_COMPLETED"
  | "LEAD_MARKED_SPAM"
  | "LEAD_ARCHIVED"
  | "LEAD_CONSENT_WITHDRAWN"
  | "LEAD_ANONYMIZED"
  | "LEAD_EXPORT_PERFORMED"
  // PRD 8: Site Visit Scheduling audit actions
  | "VISIT_REQUESTED"
  | "VISIT_ASSIGNED"
  | "VISIT_REASSIGNED"
  | "VISIT_CONFIRMED"
  | "RESCHEDULE_REQUESTED"
  | "VISIT_RESCHEDULED"
  | "VISIT_CANCELLED"
  | "VISIT_COMPLETED"
  | "VISIT_NO_SHOW"
  | "VISIT_NOTE_ADDED"
  | "AVAILABILITY_UPDATED"
  | "AVAILABILITY_EXCEPTION_ADDED"
  | "AVAILABILITY_EXCEPTION_REMOVED"
  | "VISIT_ARCHIVED"
  | "VISIT_LOCKS_ACQUIRED"
  | "VISIT_LOCKS_RELEASED"
  // PRD 10: Analytics & Reports
  | "REPORT_EXPORTED"
  | "ANALYTICS_VIEWED"
  // PRD 11: Inventory & Units
  | "INVENTORY_UNIT_CREATED"
  | "INVENTORY_UNIT_UPDATED"
  | "INVENTORY_STATUS_CHANGED"
  | "INVENTORY_PRICE_CHANGED"
  | "INVENTORY_VISIBILITY_CHANGED"
  | "INVENTORY_UNIT_ARCHIVED"
  | "INVENTORY_UNIT_RESTORED"
  | "INVENTORY_BULK_IMPORT_COMPLETED"
  | "INVENTORY_EXPORT_PERFORMED"
  // PRD 9: Legal Vault & Compliance
  | "LEGAL_DOCUMENT_CREATED"
  | "LEGAL_DOCUMENT_UPLOADED"
  | "LEGAL_DOCUMENT_VERSION_CREATED"
  | "LEGAL_DOCUMENT_REVIEW_ASSIGNED"
  | "LEGAL_DOCUMENT_SUBMITTED_FOR_REVIEW"
  | "LEGAL_DOCUMENT_INTERNALLY_VERIFIED"
  | "LEGAL_DOCUMENT_ACTION_REQUIRED"
  | "LEGAL_DOCUMENT_REJECTED"
  | "LEGAL_DOCUMENT_EXPIRED"
  | "LEGAL_CHECKLIST_APPLIED"
  | "LEGAL_CHECKLIST_MIGRATED"
  | "LEGAL_DOCUMENT_VISIBILITY_CHANGED"
  | "LEGAL_DOCUMENT_SHARE_CREATED"
  | "LEGAL_DOCUMENT_SHARE_ACCESSED"
  | "LEGAL_DOCUMENT_SHARE_REVOKED"
  | "LEGAL_DOCUMENT_ARCHIVED"
  | "LEGAL_DOCUMENT_RESTORED"
  | "LEGAL_HOLD_APPLIED"
  | "LEGAL_HOLD_REMOVED"
  // PRD 10: Settings & Team Management
  | "TEAM_INVITATION_CREATED"
  | "TEAM_INVITATION_RESENT"
  | "TEAM_INVITATION_REVOKED"
  | "TEAM_INVITATION_ACCEPTED"
  | "TEAM_MEMBER_CREATED"
  | "TEAM_MEMBER_UPDATED"
  | "TEAM_MEMBER_SUSPENDED"
  | "TEAM_MEMBER_DEACTIVATED"
  | "TEAM_MEMBER_REACTIVATED"
  | "TEAM_ROLE_ASSIGNED"
  | "CUSTOM_ROLE_CREATED"
  | "CUSTOM_ROLE_UPDATED"
  | "CUSTOM_ROLE_ARCHIVED"
  | "TEAM_HANDOVER_COMPLETED"
  | "SETTINGS_UPDATED"
  | "SETTINGS_ROLLED_BACK"
  // PRD 14: Deals, Holds, Reservations & Bookings
  | "DEAL_CREATED"
  | "DEAL_UPDATED"
  | "DEAL_STAGE_CHANGED"
  | "DEAL_WON"
  | "DEAL_LOST"
  | "DEAL_REOPENED"
  | "DEAL_ARCHIVED"
  | "OFFER_CREATED"
  | "OFFER_REVISED"
  | "OFFER_APPROVAL_REQUESTED"
  | "OFFER_APPROVED"
  | "OFFER_REJECTED"
  | "OFFER_ACCEPTED"
  | "INVENTORY_HOLD_CREATED"
  | "INVENTORY_HOLD_EXTENDED"
  | "INVENTORY_HOLD_RELEASED"
  | "INVENTORY_HOLD_EXPIRED"
  | "RESERVATION_CREATED"
  | "RESERVATION_CANCELLED"
  | "RESERVATION_EXPIRED"
  | "BOOKING_CREATED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "DEAL_RECONCILIATION_PERFORMED";

export interface IAuditChange {
  field: string;
  from?: unknown;
  to?: unknown;
}

export interface IAuditLog extends Document {
  actorId: string;
  actorRole: AdminRole;
  actorEmail: string;
  action: AuditAction;
  targetPropertyId?: Types.ObjectId;
  targetLegalDocumentId?: Types.ObjectId;
  targetMemberId?: Types.ObjectId;
  targetUnitId?: Types.ObjectId;
  targetPlotId?: Types.ObjectId;
  targetLocationId?: Types.ObjectId;
  targetAssetId?: Types.ObjectId;
  targetLeadId?: Types.ObjectId;
  targetSiteVisitId?: Types.ObjectId;
  changes?: IAuditChange[];
  reason?: string;
  requestId?: string;
  timestamp: Date;
}

const AuditChangeSchema = new Schema<IAuditChange>(
  {
    field: { type: String, required: true },
    from: { type: Schema.Types.Mixed },
    to: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: String,
      required: [true, "Actor ID is required"],
      index: true,
    },
    actorRole: {
      type: String,
      required: [true, "Actor role is required"],
      enum: ["EDITOR", "ADMIN", "SUPER_ADMIN"],
      index: true,
    },
    actorEmail: {
      type: String,
      required: [true, "Actor email is required"],
      trim: true,
      lowercase: true,
    },
    action: {
      type: String,
      required: [true, "Audit action is required"],
      index: true,
    },
    targetPropertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      index: true,
    },
    targetLegalDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "LegalDocument",
      index: true,
    },
    targetMemberId: {
      type: Schema.Types.ObjectId,
      ref: "TeamMember",
      index: true,
    },
    targetUnitId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryUnit",
      index: true,
    },
    targetPlotId: {
      type: Schema.Types.ObjectId,
      ref: "PlotOption",
      index: true,
    },
    targetLocationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      index: true,
    },
    targetAssetId: {
      type: Schema.Types.ObjectId,
      ref: "MediaAsset",
      index: true,
    },
    targetLeadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      index: true,
    },
    targetSiteVisitId: {
      type: Schema.Types.ObjectId,
      ref: "SiteVisit",
      index: true,
    },
    changes: {
      type: [AuditChangeSchema],
      default: [],
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [1000, "Reason must not exceed 1000 characters"],
    },
    requestId: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound index for querying property audit trails
AuditLogSchema.index({ targetPropertyId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
