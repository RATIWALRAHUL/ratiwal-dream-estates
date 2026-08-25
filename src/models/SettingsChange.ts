import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISettingsChange extends Document {
  _id: Types.ObjectId;
  settingsSection: "GENERAL" | "REGIONAL" | "LEADS" | "SITE_VISITS" | "LEGAL_VAULT" | "SECURITY" | "ALL";
  previousSnapshot: Record<string, unknown>;
  newSnapshot: Record<string, unknown>;
  changedFieldKeys: string[];
  versionBefore: number;
  versionAfter: number;
  actorId: string;
  actorEmail: string;
  reason?: string;
  isRollback: boolean;
  createdAt: Date;
}

const SettingsChangeSchema = new Schema<ISettingsChange>(
  {
    settingsSection: {
      type: String,
      enum: ["GENERAL", "REGIONAL", "LEADS", "SITE_VISITS", "LEGAL_VAULT", "SECURITY", "ALL"],
      required: true,
      index: true,
    },
    previousSnapshot: {
      type: Schema.Types.Mixed,
      required: true,
    },
    newSnapshot: {
      type: Schema.Types.Mixed,
      required: true,
    },
    changedFieldKeys: {
      type: [String],
      default: [],
    },
    versionBefore: {
      type: Number,
      required: true,
    },
    versionAfter: {
      type: Number,
      required: true,
    },
    actorId: {
      type: String,
      required: true,
      index: true,
    },
    actorEmail: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      maxlength: 300,
    },
    isRollback: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable append-only
  }
);

SettingsChangeSchema.index({ createdAt: -1 });

export const SettingsChange: Model<ISettingsChange> =
  mongoose.models.SettingsChange ||
  mongoose.model<ISettingsChange>("SettingsChange", SettingsChangeSchema);
