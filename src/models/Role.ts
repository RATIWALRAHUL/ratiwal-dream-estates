import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { DataScope, DATA_SCOPES } from "@/types/settings-team";

export interface IRole extends Document {
  _id: Types.ObjectId;
  roleKey: string; // e.g. "SUPER_ADMIN", "CUSTOM_SALES_LEAD"
  displayName: string;
  description: string;
  roleType: "SYSTEM" | "CUSTOM";
  permissionKeys: string[];
  defaultDataScope: DataScope;
  isSystemRole: boolean; // Cannot be deleted or key modified
  isActive: boolean;
  version: number;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    roleKey: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    roleType: {
      type: String,
      enum: ["SYSTEM", "CUSTOM"],
      default: "CUSTOM",
      required: true,
      index: true,
    },
    permissionKeys: {
      type: [String],
      default: [],
    },
    defaultDataScope: {
      type: String,
      enum: DATA_SCOPES,
      default: "ALL_ORGANIZATION",
      required: true,
    },
    isSystemRole: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

export const Role: Model<IRole> =
  mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
