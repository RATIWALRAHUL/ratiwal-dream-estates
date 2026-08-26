import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITaskEscalation extends Document {
  _id: Types.ObjectId;
  taskId: Types.ObjectId;
  escalationLevel: number; // 1 = Manager, 2 = Department Head, 3 = Super Admin
  policyVersion: string;

  fromAssigneeId: string;
  fromAssigneeName: string;

  escalatedToUserId: string;
  escalatedToUserName: string;

  triggerReason: "SLA_BREACH" | "OVERDUE_CRITICAL" | "REVIEW_REJECTED_MULTIPLE" | "MANUAL_ESCALATION";
  triggerTimestamp: Date;

  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  resolutionNotes?: string;
  resolutionTimestamp?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const TaskEscalationSchema = new Schema<ITaskEscalation>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "OperationalTask",
      required: true,
      index: true,
    },
    escalationLevel: {
      type: Number,
      default: 1,
    },
    policyVersion: {
      type: String,
      default: "v2026.1-STANDARD-ESCALATION",
    },
    fromAssigneeId: {
      type: String,
      required: true,
    },
    fromAssigneeName: {
      type: String,
      required: true,
    },
    escalatedToUserId: {
      type: String,
      required: true,
      index: true,
    },
    escalatedToUserName: {
      type: String,
      required: true,
    },
    triggerReason: {
      type: String,
      enum: ["SLA_BREACH", "OVERDUE_CRITICAL", "REVIEW_REJECTED_MULTIPLE", "MANUAL_ESCALATION"],
      required: true,
    },
    triggerTimestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["OPEN", "ACKNOWLEDGED", "RESOLVED"],
      default: "OPEN",
      index: true,
    },
    resolutionNotes: {
      type: String,
    },
    resolutionTimestamp: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const TaskEscalation: Model<ITaskEscalation> =
  mongoose.models.TaskEscalation ||
  mongoose.model<ITaskEscalation>("TaskEscalation", TaskEscalationSchema);
