import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  TaskType,
  TASK_TYPES,
  TaskPriority,
  TASK_PRIORITIES,
} from "@/types/task";

export interface ITaskTemplate extends Document {
  _id: Types.ObjectId;
  templateKey: string; // e.g. "TMPL_SITE_VISIT_PREP_V1"
  name: string;
  taskType: TaskType;
  titleTemplate: string;
  descriptionTemplate?: string;

  defaultRole?: string;
  defaultTeam?: string;
  priority: TaskPriority;
  dueOffsetMinutes: number; // e.g. 1440 mins = 24 hours

  reminderPolicyKey?: string;
  escalationPolicyKey?: string;

  applicableProperties?: Types.ObjectId[];
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";

  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskTemplateSchema = new Schema<ITaskTemplate>(
  {
    templateKey: {
      type: String,
      required: [true, "Template key is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    taskType: {
      type: String,
      enum: TASK_TYPES,
      required: true,
      index: true,
    },
    titleTemplate: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionTemplate: {
      type: String,
      trim: true,
    },
    defaultRole: {
      type: String,
    },
    defaultTeam: {
      type: String,
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: "NORMAL",
    },
    dueOffsetMinutes: {
      type: Number,
      default: 1440,
    },
    reminderPolicyKey: {
      type: String,
    },
    escalationPolicyKey: {
      type: String,
    },
    applicableProperties: [{
      type: Schema.Types.ObjectId,
      ref: "Property",
    }],
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const TaskTemplate: Model<ITaskTemplate> =
  mongoose.models.TaskTemplate ||
  mongoose.model<ITaskTemplate>("TaskTemplate", TaskTemplateSchema);
