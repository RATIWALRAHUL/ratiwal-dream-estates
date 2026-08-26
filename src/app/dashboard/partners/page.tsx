import { requireRole } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ChannelPartner } from "@/models/ChannelPartner";
import { StaffPartnersView } from "@/components/dashboard/partners/StaffPartnersView";

export const dynamic = "force-dynamic";

export default async function DashboardPartnersPage() {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  await connectToDatabase();

  const rawPartners = await ChannelPartner.find().sort({ createdAt: -1 }).lean();

  const partners = rawPartners.map((p: any) => ({
    _id: p._id.toString(),
    partnerCode: p.partnerCode,
    partnerType: p.partnerType,
    displayName: p.displayName,
    legalName: p.legalName,
    email: p.email,
    phone: p.phone,
    operatingLocations: p.operatingLocations,
    status: p.status,
    complianceStatus: p.complianceStatus,
    primaryContact: p.primaryContact,
    createdAt: p.createdAt.toISOString(),
  }));

  return <StaffPartnersView partners={partners} />;
}
