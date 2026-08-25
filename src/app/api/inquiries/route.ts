/**
 * POST /api/inquiries — Alias for /api/enquiries.
 * New forms should use this path. Existing forms continue to use /api/enquiries.
 * Both endpoints use the same handler.
 */
export { POST } from "@/app/api/enquiries/route";
