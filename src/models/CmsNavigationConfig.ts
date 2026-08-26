import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface INavItem {
  id: string;
  label: string;
  href: string;
  isExternal: boolean;
  order: number;
  children?: {
    id: string;
    label: string;
    href: string;
    description?: string;
  }[];
}

export interface ICmsNavigationConfig extends Document {
  _id: Types.ObjectId;
  location: "HEADER" | "FOOTER_PRIMARY" | "FOOTER_LEGAL";
  items: INavItem[];
  status: "DRAFT" | "PUBLISHED";
  version: number;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const NavItemSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    href: { type: String, required: true },
    isExternal: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    children: [
      {
        id: String,
        label: String,
        href: String,
        description: String,
      },
    ],
  },
  { _id: false }
);

const CmsNavigationConfigSchema = new Schema<ICmsNavigationConfig>(
  {
    location: {
      type: String,
      enum: ["HEADER", "FOOTER_PRIMARY", "FOOTER_LEGAL"],
      required: true,
      unique: true,
      index: true,
    },
    items: [NavItemSchema],
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "PUBLISHED",
    },
    version: {
      type: Number,
      default: 1,
    },
    updatedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CmsNavigationConfig: Model<ICmsNavigationConfig> =
  mongoose.models.CmsNavigationConfig ||
  mongoose.model<ICmsNavigationConfig>("CmsNavigationConfig", CmsNavigationConfigSchema);
