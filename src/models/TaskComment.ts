import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  TaskCommentVisibility,
  TASK_COMMENT_VISIBILITIES,
} from "@/types/task";

export interface ITaskComment extends Document {
  _id: Types.ObjectId;
  taskId: Types.ObjectId;
  authorId: string;
  authorName: string;
  authorRole: string;

  content: string;
  visibility: TaskCommentVisibility;
  attachmentKeys: string[];

  isEdited: boolean;
  editedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const TaskCommentSchema = new Schema<ITaskComment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "OperationalTask",
      required: true,
      index: true,
    },
    authorId: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorRole: {
      type: String,
      default: "ADMIN",
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
    visibility: {
      type: String,
      enum: TASK_COMMENT_VISIBILITIES,
      default: "INTERNAL",
    },
    attachmentKeys: {
      type: [String],
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

TaskCommentSchema.index({ taskId: 1, createdAt: 1 });

export const TaskComment: Model<ITaskComment> =
  mongoose.models.TaskComment ||
  mongoose.model<ITaskComment>("TaskComment", TaskCommentSchema);
