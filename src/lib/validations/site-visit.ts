import { z } from "zod";

export const siteVisitSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .regex(/^[\p{L}\s.-]+$/u, "Name contains invalid characters"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^\+?[0-9\s-]+$/, "Phone number contains invalid characters"),
  email: z.string().email("Please enter a valid email address"),
  propertyId: z.string().min(1, "Property selection is required"),
  propertyName: z.string().min(1, "Property selection is required"),
  preferredDate: z
    .string()
    .min(1, "Please select a date for the site visit")
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, "Visit date must be today or in the future"),
  preferredTime: z.string().min(1, "Please select a preferred time slot"),
  numberOfVisitors: z
    .number()
    .min(1, "At least 1 visitor is required")
    .max(20, "Maximum number of visitors allowed is 20"),
  message: z.string().max(500, "Message must not exceed 500 characters").optional(),
  honeypot: z.string().max(0, "Spam detected").optional(), // Honeypot must be empty
});

export type SiteVisitSchema = z.infer<typeof siteVisitSchema>;
