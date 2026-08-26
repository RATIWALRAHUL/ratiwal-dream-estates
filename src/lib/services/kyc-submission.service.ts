import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { KycSubmissionSession, IKycSubmissionSession } from "@/models/KycSubmissionSession";
import { CustomerKycCase } from "@/models/CustomerKycCase";
import { KycApplicant } from "@/models/KycApplicant";
import { KycDocument } from "@/models/KycDocument";
import { KycSecurityUtils } from "@/lib/security/encryption";
import { AdminSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";

export interface CreateSubmissionSessionInput {
  kycCaseId: string;
  applicantId: string;
  allowedRequirementKeys?: string[];
  expiresInHours?: number; // Default 72 hours
  purposeNotice?: string;
  session: AdminSession;
}

export class KycSubmissionService {
  /**
   * Creates a new time-bound, hashed submission session and returns the raw one-time URL token
   */
  public static async createSubmissionSession(
    input: CreateSubmissionSessionInput
  ): Promise<{ session: IKycSubmissionSession; rawToken: string; submissionUrl: string }> {
    await connectToDatabase();

    const kycCase = await CustomerKycCase.findById(input.kycCaseId);
    if (!kycCase) throw new Error("NOT_FOUND: KYC Case not found.");

    const applicant = await KycApplicant.findById(input.applicantId);
    if (!applicant) throw new Error("NOT_FOUND: Applicant not found.");

    const rawToken = KycSecurityUtils.generateSecureToken(32);
    const tokenHash = KycSecurityUtils.hashToken(rawToken);

    const expiresInHours = input.expiresInHours || 72;
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const allowedKeys =
      input.allowedRequirementKeys && input.allowedRequirementKeys.length > 0
        ? input.allowedRequirementKeys
        : (await KycDocument.find({ kycCaseId: kycCase._id, applicantId: applicant._id })).map(
            (d) => d.requirementKey
          );

    const submissionSession = await KycSubmissionSession.create({
      kycCaseId: kycCase._id,
      applicantId: applicant._id,
      partyId: kycCase.partyId,
      tokenHash,
      allowedRequirementKeys: allowedKeys,
      purposeNotice:
        input.purposeNotice ||
        "In compliance with the Digital Personal Data Protection Act, 2023, your documents will be processed solely for buyer identity verification and property registration due diligence.",
      noticeVersion: "DPDPA_KYC_NOTICE_V1_2026",
      status: "ACTIVE",
      expiresAt,
      maxUploadAttempts: 15,
      uploadAttemptsCount: 0,
      createdBy: input.session.user.id,
      createdByName: input.session.user.name,
    });

    await logAuditEvent({
      actor: input.session.user,
      action: "KYC_SUBMISSION_SESSION_CREATED",
      targetKycCaseId: kycCase._id,
      targetPartyId: kycCase.partyId,
      reason: `Generated single-purpose customer submission link for "${applicant.fullName}" (Expires in ${expiresInHours}h).`,
    });

    const submissionUrl = `/kyc/submit/${rawToken}`;
    return {
      session: submissionSession,
      rawToken,
      submissionUrl,
    };
  }

  /**
   * Resolves and validates an active submission session using the raw token provided by customer
   */
  public static async validateSession(rawToken: string) {
    await connectToDatabase();

    if (!rawToken || rawToken.trim().length < 32) {
      throw new Error("INVALID_TOKEN: Malformed submission token.");
    }

    const tokenHash = KycSecurityUtils.hashToken(rawToken.trim());
    const session = await KycSubmissionSession.findOne({ tokenHash });

    if (!session) {
      throw new Error("NOT_FOUND: Submission link is invalid or does not exist.");
    }

    if (session.status !== "ACTIVE") {
      throw new Error(`LINK_INACTIVE: This submission session is ${session.status.toLowerCase()}.`);
    }

    if (new Date() > new Date(session.expiresAt)) {
      session.status = "EXPIRED";
      await session.save();
      throw new Error("LINK_EXPIRED: This submission link has expired. Please request a new link from your advisor.");
    }

    if (session.uploadAttemptsCount >= session.maxUploadAttempts) {
      throw new Error("RATE_LIMIT: Maximum upload attempts exceeded for this session.");
    }

    const [kycCase, applicant, documents] = await Promise.all([
      CustomerKycCase.findById(session.kycCaseId).populate("propertyId", "title slug code").lean(),
      KycApplicant.findById(session.applicantId).lean(),
      KycDocument.find({
        kycCaseId: session.kycCaseId,
        applicantId: session.applicantId,
        requirementKey: { $in: session.allowedRequirementKeys },
      })
        .populate("currentVersionId")
        .lean(),
    ]);

    return {
      session,
      kycCase,
      applicant,
      documents,
    };
  }
}
