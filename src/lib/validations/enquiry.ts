import { z } from "zod";

export const enquirySchema = z.object({
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
  preferredLocation: z.string().min(1, "Please select a preferred location"),
  propertyType: z.enum(["Residential Plot", "Commercial Plot", "Any"]),
  budget: z.string().min(1, "Please select or enter your budget range"),
  message: z
    .string()
    .min(5, "Message must be at least 5 characters")
    .max(1000, "Message must not exceed 1000 characters"),
  propertyId: z.string().optional(),
  propertySlug: z.string().optional(),
  honeypot: z.string().max(0, "Spam detected").optional(), // Honeypot must be empty
});

export type EnquirySchema = z.infer<typeof enquirySchema>;
