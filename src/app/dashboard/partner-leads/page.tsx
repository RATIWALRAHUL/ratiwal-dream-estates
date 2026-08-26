import { requireRole } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PartnerLeadSubmission } from "@/models/PartnerLeadSubmission";
import { StaffPartnerLeadsView } from "@/components/dashboard/partners/StaffPartnerLeadsView";

export const dynamic = "force-dynamic";

export default async function DashboardPartnerLeadsPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  await connectToDatabase();

  const rawSubmissions = await PartnerLeadSubmission.find()
    .populate("partnerId", "displayName partnerCode")
    .populate("propertyId", "title")
    .sort({ createdAt: -1 })
    .lean();

  const submissions = rawSubmissions.map((s: any) => ({
    ...s,
    _id: s._id.toString(),
    partnerId: s.partnerId ? { ...s.partnerId, _id: s.partnerId._id.toString() } : null,
    propertyId: s.propertyId ? { ...s.propertyId, _id: s.propertyId._id.toString() } : null,
    createdAt: s.createdAt.toISOString(),
  }));

  return <StaffPartnerLeadsView submissions={submissions} />;
}
