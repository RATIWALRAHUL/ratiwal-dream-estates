import { NextRequest, NextResponse } from "next/server";
import { KycSubmissionService } from "@/lib/services/kyc-submission.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const sessionData = await KycSubmissionService.validateSession(token);

    return NextResponse.json({
      success: true,
      data: {
        session: {
          expiresAt: sessionData.session.expiresAt,
          purposeNotice: sessionData.session.purposeNotice,
          noticeVersion: sessionData.session.noticeVersion,
          allowedRequirementKeys: sessionData.session.allowedRequirementKeys,
        },
        applicant: {
          fullName: sessionData.applicant?.fullName,
          role: sessionData.applicant?.role,
        },
        documents: sessionData.documents.map((d) => ({
          _id: d._id,
          requirementKey: d.requirementKey,
          documentType: d.documentType,
          status: d.status,
          currentVersionNumber: d.currentVersionNumber,
          currentVersion: d.currentVersionId,
        })),
      },
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Invalid submission session" },
      { status: 400 }
    );
  }
}
