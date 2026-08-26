import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ChannelPartner } from "@/models/ChannelPartner";
import { PartnerReraRegistration } from "@/models/PartnerReraRegistration";
import { PartnerTaxProfile } from "@/models/PartnerTaxProfile";
import { PartnerPayoutProfile } from "@/models/PartnerPayoutProfile";
import { PartnerPropertyAccess } from "@/models/PartnerPropertyAccess";
import { PartnerLeadSubmission } from "@/models/PartnerLeadSubmission";
import { CommissionAccrual } from "@/models/CommissionAccrual";
import { Property } from "@/models/Property";
import { StaffPartnerDetailView } from "@/components/dashboard/partners/StaffPartnerDetailView";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

export default async function DashboardPartnerDetailPage({
  params,
}: {
  params: Promise<{ partnerId: string }>;
}) {
  await requireRole(["ADMIN", "SUPER_ADMIN"]);
  const { partnerId } = await params;

  if (!Types.ObjectId.isValid(partnerId)) {
    notFound();
  }

  await connectToDatabase();

  const partner = await ChannelPartner.findById(partnerId).lean();
  if (!partner) {
    notFound();
  }

  const rera = await PartnerReraRegistration.findOne({ partnerId: partner._id }).lean();
  const tax = await PartnerTaxProfile.findOne({ partnerId: partner._id }).lean();
  const payoutProfile = await PartnerPayoutProfile.findOne({
    partnerId: partner._id,
    isCurrentActive: true,
  }).lean();

  const allProperties = await Property.find().select("title _id").lean();
  const grantedProperties = await PartnerPropertyAccess.find({ partnerId: partner._id })
    .populate("propertyId", "title")
    .lean();

  const submissions = await PartnerLeadSubmission.find({ partnerId: partner._id }).lean();
  const accruals = await CommissionAccrual.find({ partnerId: partner._id }).lean();

  return (
    <StaffPartnerDetailView
      partner={{
        ...partner,
        _id: partner._id.toString(),
        createdAt: partner.createdAt.toISOString(),
      }}
      rera={rera ? { ...rera, _id: rera._id.toString() } : null}
      tax={tax ? { ...tax, _id: tax._id.toString() } : null}
      payoutProfile={payoutProfile ? { ...payoutProfile, _id: payoutProfile._id.toString() } : null}
      allProperties={allProperties.map((p: any) => ({ ...p, _id: p._id.toString() }))}
      grantedProperties={grantedProperties.map((g: any) => ({
        ...g,
        _id: g._id.toString(),
        propertyId: g.propertyId ? { ...g.propertyId, _id: g.propertyId._id.toString() } : null,
      }))}
      submissions={submissions.map((s: any) => ({ ...s, _id: s._id.toString() }))}
      accruals={accruals.map((a: any) => ({ ...a, _id: a._id.toString() }))}
    />
  );
}
