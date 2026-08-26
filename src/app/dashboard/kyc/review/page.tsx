import "server-only";
import { KycDocument } from "@/models/KycDocument";
import { KycReviewQueue } from "@/components/dashboard/kyc/KycReviewQueue";

export const metadata = {
  title: "KYC Review Queue | Admin Dashboard",
  description: "Identity documents awaiting staff review and verification.",
};

export default async function KycReviewQueuePage() {
  const pendingDocuments = await KycDocument.find({
    status: { $in: ["UPLOADED", "UNDER_REVIEW"] },
  })
    .populate("applicantId", "fullName role")
    .populate("currentVersionId")
    .sort({ updatedAt: 1 })
    .lean();

  return <KycReviewQueue pendingDocuments={pendingDocuments} />;
}
