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
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number must not exceed 20 characters")
    .regex(/^\+?[\d\s\-().]+$/, "Phone number contains invalid characters"),

  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email must not exceed 254 characters")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),

  // Property details
  propertyId: z.string().refine(isValidObjectId, { message: "Invalid property identifier" }),
  locationId: z.string().refine(isValidObjectId, { message: "Invalid location identifier" }).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),

  // Schedule preferences
  preferredStartAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid preferred start date/time",
  }),
  preferredEndAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid preferred end date/time",
  }).optional(),

  durationMinutes: z.number().int().min(15).max(480).optional().default(60),
  meetingMode: z.enum(MEETING_MODES).optional().default("IN_PERSON"),
  visitorCount: z.number().int().min(1, "Minimum 1 visitor").max(20, "Maximum 20 visitors").optional().default(1),

  source: z.enum(SITE_VISIT_SOURCES).optional().default("PUBLIC_PROPERTY_PAGE"),
  message: z.string().max(2000, "Message cannot exceed 2000 characters").optional().transform((v) => (v ? v.trim() : undefined)),

  // Consent
  consentGranted: z.literal(true).refine((val) => val === true, {
    message: "You must consent to be contacted regarding this site visit.",
  }),

  // Anti-abuse
  _honeypot: z.string().max(0, "Spam detected").optional(),
  _formStartedAt: z.string().optional(),
  idempotencyKey: z.string().max(100).optional(),
});

export type PublicSiteVisitRequestInput = z.infer<typeof publicSiteVisitRequestSchema>;
