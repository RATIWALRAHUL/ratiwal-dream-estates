import "server-only";
import { PrivacyRequest } from "@/models/PrivacyRequest";
import { KycPrivacyRequestsView } from "@/components/dashboard/kyc/KycPrivacyRequestsView";

export const metadata = {
  title: "Data Principal Privacy Requests | Admin Dashboard",
  description: "DPDPA Data Principal Access, Correction, and Erasure governance.",
};

export default async function KycPrivacyRequestsPage() {
  const requests = await PrivacyRequest.find()
    .populate("partyId", "displayName partyType")
    .sort({ receivedAt: -1 })
    .lean();

  return <KycPrivacyRequestsView requests={requests} />;
}
