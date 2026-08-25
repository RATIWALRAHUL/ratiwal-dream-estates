import { z } from "zod";
import { LEAD_SOURCES, CONTACT_METHODS, PURCHASE_TIMELINES, INVESTMENT_PURPOSES } from "@/types/lead";

/** Current consent and privacy-policy versions — bump when text changes */
export const CONSENT_TEXT_VERSION = "1.0.0";
export const PRIVACY_POLICY_VERSION = "1.0.0";

/** Maximum body size for public inquiry in bytes (~32 KB) */
export const MAX_BODY_BYTES = 32_768;

/** Duplicate submission window in milliseconds (30 minutes) */
export const DUPLICATE_WINDOW_MS = 30 * 60 * 1000;

/** Minimum form completion time to catch scripted bots (5 seconds) */
export const MIN_FORM_TIME_MS = 5_000;

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
function isValidObjectId(val: string) {
  return typeof val === "string" && OBJECT_ID_REGEX.test(val);
}

/**
 * Zod schema for the public inquiry form submission.
 * Parses ONLY known fields — unknown keys are stripped by .strict() at call site.
 */
export const publicInquirySchema = z.object({
  // ── Required ─────────────────────────────────────────────────────────────
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

  consentGranted: z
    .literal(true)
    .refine((val) => val === true, {
      message: "You must consent to be contacted to submit this form.",
    }),

  consentTextVersion: z
    .string()
    .min(1)
    .max(20)
    .default(CONSENT_TEXT_VERSION),

  // ── Optional contact details ──────────────────────────────────────────────
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email must not exceed 254 characters")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),

  preferredContactMethod: z.enum(CONTACT_METHODS).optional().default("ANY"),

  preferredLanguage: z.string().max(50).optional(),

  // ── Inquiry context ───────────────────────────────────────────────────────
  source: z.enum(LEAD_SOURCES).optional().default("DIRECT"),

  propertyId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid property identifier" })
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),

  locationId: z
    .string()
    .refine(isValidObjectId, { message: "Invalid location identifier" })
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),

  propertyTypeInterest: z.string().max(100).optional(),

  budgetMinimumPaise: z
    .number()
    .int("Budget must be an integer (paise)")
    .min(0, "Budget cannot be negative")
    .optional(),

  budgetMaximumPaise: z
    .number()
    .int("Budget must be an integer (paise)")
    .min(0, "Budget cannot be negative")
    .optional(),

  areaMinimumSqFt: z.number().min(0).optional(),
  areaMaximumSqFt: z.number().min(0).optional(),

  purchaseTimeline: z.enum(PURCHASE_TIMELINES).optional(),
  investmentPurpose: z.enum(INVESTMENT_PURPOSES).optional(),

  message: z
    .string()
    .max(2000, "Message must not exceed 2000 characters")
    .optional()
    .transform((v) => (v ? v.trim() : undefined)),

  // ── Attribution (safe passthrough) ───────────────────────────────────────
  landingPath: z.string().max(500).optional(),
  referrerDomain: z.string().max(200).optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  utmTerm: z.string().max(200).optional(),
  utmContent: z.string().max(200).optional(),

  // ── Anti-abuse (must be empty / timing validation) ────────────────────────
  _honeypot: z.string().max(0, "Spam detected").optional(),
  _formStartedAt: z.string().optional(),
}).superRefine((data, ctx) => {
  // Budget max must not be less than min
  if (
    data.budgetMinimumPaise !== undefined &&
    data.budgetMaximumPaise !== undefined &&
    data.budgetMaximumPaise < data.budgetMinimumPaise
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Maximum budget cannot be less than minimum budget",
      path: ["budgetMaximumPaise"],
    });
  }
  // Area max must not be less than min
  if (
    data.areaMinimumSqFt !== undefined &&
    data.areaMaximumSqFt !== undefined &&
    data.areaMaximumSqFt < data.areaMinimumSqFt
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Maximum area cannot be less than minimum area",
      path: ["areaMaximumSqFt"],
    });
  }
});

export type PublicInquiryInput = z.infer<typeof publicInquirySchema>;
