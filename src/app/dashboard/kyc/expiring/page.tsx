import "server-only";
import { KycDocument } from "@/models/KycDocument";
import { KycExpiringView } from "@/components/dashboard/kyc/KycExpiringView";

export const metadata = {
  title: "Expiring KYC Documents | Admin Dashboard",
  description: "Identity documents approaching expiration or due for periodic review.",
};

export default async function KycExpiringPage() {
  const thirtyDaysFuture = new Date();
  thirtyDaysFuture.setDate(thirtyDaysFuture.getDate() + 30);

  const expiringDocs = await KycDocument.find({
    expiryDate: { $gte: new Date(), $lte: thirtyDaysFuture },
    status: { $in: ["INTERNALLY_VERIFIED", "PROVIDER_VERIFIED", "UPLOADED"] },
  })
    .populate("applicantId", "fullName role")
    .sort({ expiryDate: 1 })
    .lean();

  return <KycExpiringView expiringDocs={expiringDocs} />;
}
