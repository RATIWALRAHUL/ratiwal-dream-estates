import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  TaskType,
  TASK_TYPES,
  TaskStatus,
  TASK_STATUSES,
  TaskPriority,
  TASK_PRIORITIES,
  TaskSource,
  TASK_SOURCES,
  RelatedEntityType,
  RELATED_ENTITY_TYPES,
} from "@/types/task";

export interface IOperationalTask extends Document {
  _id: Types.ObjectId;
  taskNumber: string; // Immutable, e.g. RDE-TSK-100293
  title: string;
  description?: string;

  taskType: TaskType;
  source: TaskSource;
  sourceEvent?: string;

  // Controlled Related Entity
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: Types.ObjectId;
  relatedEntitySummary?: string;

  propertyId?: Types.ObjectId;
  locationId?: Types.ObjectId;

  // Assignments & Reviewers
  assignedUserId: string; // TeamMember ID or User ID
  assignedUserName: string;
  assignedUserEmail?: string;
  assignedTeam?: string; // e.g. "Sales", "Legal", "Finance", "Customer Care"

  assignedByUserId: string;
  assignedByUserName?: string;

  reviewerUserId?: string;
  reviewerUserName?: string;
  watchers?: string[]; // Array of User IDs

  status: TaskStatus;
  priority: TaskPriority;

  // Timestamps
  dueAt: Date;
  startAt?: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;

  // SLA & Policies
  slaPolicyVersion?: string;
  slaWarningAt?: Date;
  slaBreachedAt?: Date;
  reminderPolicyVersion?: string;
  escalationPolicyVersion?: string;

  parentTaskId?: Types.ObjectId;
  idempotencyKey?: string; // Unique index for system-generated tasks

  version: number;
  archivedAt?: Date;
  createdBy: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OperationalTaskSchema = new Schema<IOperationalTask>(
  {
    taskNumber: {
      type: String,
      required: [true, "Task number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [4000, "Description cannot exceed 4000 characters"],
    },
    taskType: {
      type: String,
      enum: TASK_TYPES,
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: TASK_SOURCES,
      default: "MANUAL",
      index: true,
    },
    sourceEvent: {
      type: String,
    },
    relatedEntityType: {
      type: String,
      enum: RELATED_ENTITY_TYPES,
      index: true,
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    relatedEntitySummary: {
      type: String,
      trim: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      index: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    assignedUserId: {
      type: String,
      required: [true, "Assigned user ID is required"],
      index: true,
    },
    assignedUserName: {
      type: String,
      required: true,
    },
    assignedUserEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    assignedTeam: {
      type: String,
      trim: true,
      index: true,
    },
    assignedByUserId: {
      type: String,
      required: true,
    },
    assignedByUserName: {
      type: String,
    },
    reviewerUserId: {
      type: String,
      index: true,
    },
    reviewerUserName: {
      type: String,
    },
    watchers: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "TO_DO",
      index: true,
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: "NORMAL",
      index: true,
    },
    dueAt: {
      type: Date,
      required: [true, "Due timestamp is required"],
      index: true,
    },
    startAt: {
      type: Date,
    },
    acceptedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    slaPolicyVersion: {
      type: String,
      default: "v2026.1-STANDARD-SLA",
    },
    slaWarningAt: {
      type: Date,
    },
    slaBreachedAt: {
      type: Date,
    },
    reminderPolicyVersion: {
      type: String,
    },
    escalationPolicyVersion: {
      type: String,
    },
    parentTaskId: {
      type: Schema.Types.ObjectId,
      ref: "OperationalTask",
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    archivedAt: {
      type: Date,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
    updatedByName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

OperationalTaskSchema.index({ assignedUserId: 1, status: 1, dueAt: 1 });
OperationalTaskSchema.index({ status: 1, dueAt: 1 });
OperationalTaskSchema.index({ relatedEntityType: 1, relatedEntityId: 1, status: 1 });

export const OperationalTask: Model<IOperationalTask> =
  mongoose.models.OperationalTask ||
  mongoose.model<IOperationalTask>("OperationalTask", OperationalTaskSchema);
