import "server-only";
import { notFound } from "next/navigation";
import { KycSubmissionService } from "@/lib/services/kyc-submission.service";
import { PublicKycSubmissionPortal } from "@/components/kyc/PublicKycSubmissionPortal";

export const metadata = {
  title: "Submit Identity Documents | Ratiwal Dream Estates",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PublicKycSubmitPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  try {
    const sessionData = await KycSubmissionService.validateSession(token);
    return <PublicKycSubmissionPortal sessionData={sessionData} rawToken={token} />;
  } catch (error) {
    return (
      <div className="min-h-screen bg-[#071a28] text-white flex flex-col items-center justify-center p-6 text-center antialiased">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0d2c42]/80 border border-[#0d2c42] shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            ✕
          </div>
          <h1 className="text-xl font-bold font-serif text-white">Invalid or Expired Link</h1>
          <p className="text-xs text-[#cbd5e1] leading-relaxed">
            {(error as Error).message || "This document upload link is no longer valid or has expired. Please contact your property advisor to receive a new one-time link."}
          </p>
        </div>
      </div>
    );
  }
}
