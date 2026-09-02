import { z } from "zod";
import { MEETING_MODES, SITE_VISIT_SOURCES } from "@/types/site-visit";

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
function isValidObjectId(val: string) {
  return typeof val === "string" && OBJECT_ID_REGEX.test(val);
}

export const publicSiteVisitRequestSchema = z.object({
  // Contact details
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must not exceed 200 characters")
    .regex(/^[\p{L}\s.'\-]+$/u, "Name contains invalid characters")
    .transform((v) => v.trim()),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must not exceed 20 characters")
    .regex(/^\+?[\d\s\-().]+$/, "Please enter a valid phone number"),

  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address")
    .max(254, "Email must not exceed 254 characters")
    .transform((v) => v.trim()),

  // Property details
  propertyId: z.string().min(1, "Property is required"),
  locationId: z.string().optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),

  // Schedule preferences
  preferredStartAt: z
    .string()
    .min(1, "Please select a preferred visit date")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please select a valid visit date",
    }),
  preferredEndAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid preferred end date/time",
  }).optional(),

  durationMinutes: z.number().int().min(15).max(480).optional().default(60),
  meetingMode: z.enum(MEETING_MODES).optional().default("IN_PERSON"),
  visitorCount: z.number().int().min(1, "Minimum 1 visitor").max(20, "Maximum 20 visitors").optional().default(1),

  source: z.enum(SITE_VISIT_SOURCES).optional().default("PUBLIC_PROPERTY_PAGE"),
  landingPath: z.string().optional(),
  message: z.string().max(2000, "Message cannot exceed 2000 characters").optional().transform((v) => (v ? v.trim() : undefined)),

  // Consent
  consentGranted: z.boolean().optional().default(true),

  // Anti-abuse
  _honeypot: z.string().max(0, "Spam detected").optional(),
  _formStartedAt: z.string().optional(),
  idempotencyKey: z.string().max(100).optional(),
});

export type PublicSiteVisitRequestInput = z.infer<typeof publicSiteVisitRequestSchema>;
