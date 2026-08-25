import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { MemberStatus, MEMBER_STATUSES, DataScope, DATA_SCOPES } from "@/types/settings-team";

export interface ITeamMember extends Document {
  _id: Types.ObjectId;
  memberReference: string; // Unique, e.g. RDE-MEM-109283
  userId?: string; // Links to session.user.id
  fullName: string;
  email: string; // Unique lowercase
  phoneMasked?: string;
  avatarUrl?: string;
  jobTitle: string;
  department: "SALES" | "LEGAL" | "OPERATIONS" | "MANAGEMENT" | "INVENTORY" | "MARKETING" | "OTHER";
  roleKey: string; // References Role.roleKey (e.g. SUPER_ADMIN, SALES_MANAGER, etc.)
  customPermissionOverrides?: string[]; // Specific extra permissions if any
  dataScope: DataScope;
  assignedPropertyIds: Types.ObjectId[];
  assignedLocationIds: Types.ObjectId[];
  status: MemberStatus;
  suspensionReason?: string;
  suspendedAt?: Date;
  suspendedBy?: string;
  deactivationReason?: string;
  deactivatedAt?: Date;
  deactivatedBy?: string;
  lastLoginAt?: Date;
  lastActivityAt?: Date;
  version: number; // Optimistic concurrency control
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    memberReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phoneMasked: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
      default: "Team Member",
    },
    department: {
      type: String,
      enum: ["SALES", "LEGAL", "OPERATIONS", "MANAGEMENT", "INVENTORY", "MARKETING", "OTHER"],
      default: "SALES",
      required: true,
      index: true,
    },
    roleKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    customPermissionOverrides: {
      type: [String],
      default: [],
    },
    dataScope: {
      type: String,
      enum: DATA_SCOPES,
      default: "ALL_ORGANIZATION",
      required: true,
      index: true,
    },
    assignedPropertyIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    assignedLocationIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Location",
      },
    ],
    status: {
      type: String,
      enum: MEMBER_STATUSES,
      default: "ACTIVE",
      required: true,
      index: true,
    },
    suspensionReason: {
      type: String,
      maxlength: 500,
    },
    suspendedAt: {
      type: Date,
    },
    suspendedBy: {
      type: String,
    },
    deactivationReason: {
      type: String,
      maxlength: 500,
    },
    deactivatedAt: {
      type: Date,
    },
    deactivatedBy: {
      type: String,
    },
    lastLoginAt: {
      type: Date,
    },
    lastActivityAt: {
      type: Date,
    },
    version: {
      type: Number,
      default: 1,
      required: true,
    },
    createdBy: {
      type: String,
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

TeamMemberSchema.index({ roleKey: 1, status: 1 });
TeamMemberSchema.index({ department: 1, status: 1 });

export const TeamMember: Model<ITeamMember> =
  mongoose.models.TeamMember || mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);
