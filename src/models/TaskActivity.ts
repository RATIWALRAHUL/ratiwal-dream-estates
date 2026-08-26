import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  TaskActivityType,
  TASK_ACTIVITY_TYPES,
  TaskStatus,
  TASK_STATUSES,
} from "@/types/task";

export interface ITaskActivity extends Document {
  _id: Types.ObjectId;
  taskId: Types.ObjectId;
  activityType: TaskActivityType;

  fromStatus?: TaskStatus;
  toStatus?: TaskStatus;

  actorId: string;
  actorName: string;
  actorEmail?: string;
  actorRole?: string;

  previousAssigneeId?: string;
  previousAssigneeName?: string;
  newAssigneeId?: string;
  newAssigneeName?: string;

  reasonCode?: string;
  comment?: string;
  relatedBusinessEventRef?: string;

  taskVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskActivitySchema = new Schema<ITaskActivity>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "OperationalTask",
      required: [true, "Task reference is required"],
      index: true,
    },
    activityType: {
      type: String,
      enum: TASK_ACTIVITY_TYPES,
      required: true,
      index: true,
    },
    fromStatus: {
      type: String,
      enum: TASK_STATUSES,
    },
    toStatus: {
      type: String,
      enum: TASK_STATUSES,
    },
    actorId: {
      type: String,
      required: true,
    },
    actorName: {
      type: String,
      required: true,
    },
    actorEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    actorRole: {
      type: String,
    },
    previousAssigneeId: {
      type: String,
    },
    previousAssigneeName: {
      type: String,
    },
    newAssigneeId: {
      type: String,
    },
    newAssigneeName: {
      type: String,
    },
    reasonCode: {
      type: String,
    },
    comment: {
      type: String,
      maxlength: 2000,
    },
    relatedBusinessEventRef: {
      type: String,
    },
    taskVersion: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

TaskActivitySchema.index({ taskId: 1, createdAt: -1 });

export const TaskActivity: Model<ITaskActivity> =
  mongoose.models.TaskActivity ||
  mongoose.model<ITaskActivity>("TaskActivity", TaskActivitySchema);
