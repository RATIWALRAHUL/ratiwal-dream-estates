import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  GeneralSettings,
  RegionalSettings,
  LeadCrmSettings,
  SiteVisitSettings,
  LegalVaultSettings,
  SecuritySettings,
} from "@/types/settings-team";

export interface IOrganizationSettings extends Document {
  _id: Types.ObjectId;
  settingsKey: string; // Singleton key "GLOBAL_SETTINGS"
  general: GeneralSettings;
  regional: RegionalSettings;
  leads: LeadCrmSettings;
  siteVisits: SiteVisitSettings;
  legalVault: LegalVaultSettings;
  security: SecuritySettings;
  settingsVersion: number; // Optimistic concurrency version
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GeneralSettingsSchema = new Schema<GeneralSettings>(
  {
    orgDisplayName: { type: String, default: "Ratiwal Dream Estates" },
    legalBusinessName: { type: String, default: "Ratiwal Dream Estates Private Limited" },
    supportEmail: { type: String, default: "support@ratiwaldreamestates.com" },
    supportPhone: { type: String, default: "+91 98290 12345" },
    registeredOfficeAddress: {
      type: String,
      default: "Ratiwal Towers, Tonk Road, Jaipur, Rajasthan 302015, India",
    },
    websiteUrl: { type: String, default: "https://ratiwaldreamestates.com" },
    companyRegistrationNumber: { type: String, default: "U70109RJ2023PTC088219" },
    gstNumber: { type: String, default: "08AABCR1234F1Z5" },
    socialLinks: {
      facebook: { type: String, default: "https://facebook.com/ratiwaldreamestates" },
      instagram: { type: String, default: "https://instagram.com/ratiwaldreamestates" },
      linkedin: { type: String, default: "https://linkedin.com/company/ratiwal-dream-estates" },
      youtube: { type: String, default: "https://youtube.com/@ratiwaldreamestates" },
    },
  },
  { _id: false }
);

const RegionalSettingsSchema = new Schema<RegionalSettings>(
  {
    businessTimezone: { type: String, default: "Asia/Kolkata" },
    locale: { type: String, default: "en-IN" },
    defaultCurrency: { type: String, default: "INR" },
    areaMeasurementUnit: {
      type: String,
      enum: ["SQ_YD", "SQ_FT", "SQ_M", "ACRES", "BIGHA"],
      default: "SQ_YD",
    },
    phoneCountryDefault: { type: String, default: "+91" },
    businessWorkingDays: {
      type: [String],
      default: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"],
    },
    businessWorkingHoursStart: { type: String, default: "09:00" },
    businessWorkingHoursEnd: { type: String, default: "19:00" },
  },
  { _id: false }
);

const LeadCrmSettingsSchema = new Schema<LeadCrmSettings>(
  {
    defaultAssignmentStrategy: {
      type: String,
      enum: ["ROUND_ROBIN", "MANUAL", "LEAST_ACTIVE"],
      default: "ROUND_ROBIN",
    },
    firstResponseSlaHours: { type: Number, default: 2 },
    followUpReminderHours: { type: Number, default: 24 },
    inactivityThresholdDays: { type: Number, default: 7 },
    duplicateDetectionWindowDays: { type: Number, default: 30 },
    unassignedLeadEscalationHours: { type: Number, default: 4 },
  },
  { _id: false }
);

const SiteVisitSettingsSchema = new Schema<SiteVisitSettings>(
  {
    defaultDurationMinutes: { type: Number, default: 60 },
    minSchedulingNoticeHours: { type: Number, default: 4 },
    maxAdvanceBookingDays: { type: Number, default: 30 },
    rescheduleLimitPerVisit: { type: Number, default: 3 },
    reminderWindowHours: { type: Number, default: 24 },
  },
  { _id: false }
);

const LegalVaultSettingsSchema = new Schema<LegalVaultSettings>(
  {
    maxUploadSizeBytes: { type: Number, default: 26214400 }, // 25MB
    defaultClassification: {
      type: String,
      enum: ["INTERNAL", "CONFIDENTIAL", "RESTRICTED"],
      default: "CONFIDENTIAL",
    },
    reviewDueWindowDays: { type: Number, default: 14 },
    expiryReminderDays: { type: Number, default: 30 },
    externalSharingEnabled: { type: Boolean, default: true },
    maxShareDurationHours: { type: Number, default: 168 },
    maxShareDownloads: { type: Number, default: 10 },
  },
  { _id: false }
);

const SecuritySettingsSchema = new Schema<SecuritySettings>(
  {
    invitationTtlHours: { type: Number, default: 72 },
    invitationResendCooldownSeconds: { type: Number, default: 60 },
    maxLoginAttempts: { type: Number, default: 5 },
    sessionDurationDays: { type: Number, default: 7 },
    requireReauthForSensitiveActions: { type: Boolean, default: false },
  },
  { _id: false }
);

const OrganizationSettingsSchema = new Schema<IOrganizationSettings>(
  {
    settingsKey: {
      type: String,
      required: true,
      unique: true,
      default: "GLOBAL_SETTINGS",
    },
    general: {
      type: GeneralSettingsSchema,
      default: () => ({}),
    },
    regional: {
      type: RegionalSettingsSchema,
      default: () => ({}),
    },
    leads: {
      type: LeadCrmSettingsSchema,
      default: () => ({}),
    },
    siteVisits: {
      type: SiteVisitSettingsSchema,
      default: () => ({}),
    },
    legalVault: {
      type: LegalVaultSettingsSchema,
      default: () => ({}),
    },
    security: {
      type: SecuritySettingsSchema,
      default: () => ({}),
    },
    settingsVersion: {
      type: Number,
      default: 1,
      required: true,
    },
    updatedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const OrganizationSettings: Model<IOrganizationSettings> =
  mongoose.models.OrganizationSettings ||
  mongoose.model<IOrganizationSettings>("OrganizationSettings", OrganizationSettingsSchema);
