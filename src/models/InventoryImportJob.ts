import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ImportJobStatus =
  | "UPLOADED"
  | "VALIDATING"
  | "READY"
  | "PROCESSING"
  | "COMPLETED"
  | "PARTIALLY_COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";

export type ImportMode = "CREATE_NEW_ONLY" | "UPDATE_EXISTING_ONLY" | "CREATE_AND_UPDATE";

export interface IRowValidationError {
  rowNumber: number;
  unitNumber?: string;
  field: string;
  message: string;
}

export interface IInventoryImportJob extends Document {
  propertyId: Types.ObjectId;
  requestedBy: string;
  requestedByName?: string;
  originalFilename: string;
  templateVersion: string;
  status: ImportJobStatus;
  importMode: ImportMode;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  createdRows: number;
  updatedRows: number;
  skippedRows: number;
  rowErrors: IRowValidationError[];
  failureCode?: string;
  failureMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RowValidationErrorSchema = new Schema<IRowValidationError>(
  {
    rowNumber: { type: Number, required: true },
    unitNumber: { type: String, trim: true },
    field: { type: String, required: true },
    message: { type: String, required: true },
  },
  { _id: false }
);

const InventoryImportJobSchema = new Schema<IInventoryImportJob>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property reference is required"],
      index: true,
    },
    requestedBy: {
      type: String,
      required: true,
      index: true,
    },
    requestedByName: {
      type: String,
      trim: true,
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
    },
    templateVersion: {
      type: String,
      required: true,
      default: "1.0",
    },
    status: {
      type: String,
      enum: [
        "UPLOADED",
        "VALIDATING",
        "READY",
        "PROCESSING",
        "COMPLETED",
        "PARTIALLY_COMPLETED",
        "FAILED",
        "CANCELLED",
        "EXPIRED",
      ],
      required: true,
      default: "UPLOADED",
      index: true,
    },
    importMode: {
      type: String,
      enum: ["CREATE_NEW_ONLY", "UPDATE_EXISTING_ONLY", "CREATE_AND_UPDATE"],
      required: true,
      default: "CREATE_NEW_ONLY",
    },
    totalRows: { type: Number, default: 0 },
    validRows: { type: Number, default: 0 },
    invalidRows: { type: Number, default: 0 },
    createdRows: { type: Number, default: 0 },
    updatedRows: { type: Number, default: 0 },
    skippedRows: { type: Number, default: 0 },
    rowErrors: {
      type: [RowValidationErrorSchema],
      default: [],
    },
    failureCode: { type: String },
    failureMessage: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 86400000 * 7), // 7 day TTL
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const InventoryImportJob: Model<IInventoryImportJob> =
  (mongoose.models.InventoryImportJob as Model<IInventoryImportJob>) ||
  mongoose.model<IInventoryImportJob>("InventoryImportJob", InventoryImportJobSchema);
