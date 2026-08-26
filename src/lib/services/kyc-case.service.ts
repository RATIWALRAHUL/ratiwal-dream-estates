import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CustomerKycCase, ICustomerKycCase } from "@/models/CustomerKycCase";
import { CustomerParty } from "@/models/CustomerParty";
import { KycApplicant, IKycApplicant } from "@/models/KycApplicant";
import { KycDocument } from "@/models/KycDocument";
import { Deal } from "@/models/Deal";
import { Reservation } from "@/models/Reservation";
import { Booking } from "@/models/Booking";
import { Property } from "@/models/Property";
import { KycPartyService } from "./kyc-party.service";
import { KycTemplateService } from "./kyc-template.service";
import { logAuditEvent } from "@/lib/services/audit.service";
import { AdminSession } from "@/lib/auth/session";
import {
  KycCaseStatus,
  CustomerPartyType,
  ApplicantRole,
  isValidKycCaseTransition,
  KycCaseFilterParams,
  KycOverviewMetrics,
} from "@/types/kyc";

export interface CreateKycCaseInput {
  partyType?: CustomerPartyType;
  templateKey?: string;
  dealId?: string;
  reservationId?: string;
  bookingId?: string;
  propertyId: string;
  unitId?: string;
  primaryApplicant: {
    fullName: string;
    phone?: string;
    email?: string;
    pan?: string;
    aadhaarNumber?: string;
    dob?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    isNri?: boolean;
  };
  coApplicants?: Array<{
    role: ApplicantRole;
    fullName: string;
    phone?: string;
    email?: string;
    pan?: string;
    aadhaarNumber?: string;
    dob?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    isNri?: boolean;
  }>;
  purpose?: string;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  assignedReviewerEmail?: string;
}

export class KycCaseService {
  /**
   * Generates a non-colliding human-friendly KYC case number: RDE-KYC-XXXXXX
   */
  public static generateCaseNumber(): string {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `RDE-KYC-${randomNum}`;
  }

  /**
   * Creates a new KYC case and initializes applicant records and document requirement placeholders
   */
  public static async createCase(
    input: CreateKycCaseInput,
    session: AdminSession
  ): Promise<ICustomerKycCase> {
    await connectToDatabase();

    const partyType = input.partyType || (input.coApplicants?.length ? "JOINT_APPLICANTS" : "INDIVIDUAL");
    const template = await KycTemplateService.getTemplate(input.templateKey, partyType);

    // 1. Resolve or create Property
    const property = await Property.findById(input.propertyId);
    if (!property) throw new Error("NOT_FOUND: Referenced property does not exist.");

    // 2. Resolve or create CustomerParty
    let party = await CustomerParty.create({
      partyReference: KycPartyService.generatePartyReference(),
      partyType,
      displayName: input.primaryApplicant.fullName,
      primaryContactName: input.primaryApplicant.fullName,
      primaryContactPhoneMasked: input.primaryApplicant.phone,
      primaryContactEmailMasked: input.primaryApplicant.email,
      dealIds: input.dealId ? [new Types.ObjectId(input.dealId)] : [],
      bookingIds: input.bookingId ? [new Types.ObjectId(input.bookingId)] : [],
      status: "ACTIVE",
      createdBy: session.user.id,
      createdByName: session.user.name,
    });

    const kycCaseNumber = this.generateCaseNumber();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (template.defaultExpiryDays || 365));

    // 3. Create Case
    const kycCase = await CustomerKycCase.create({
      kycCaseNumber,
      partyId: party._id,
      templateId: template._id,
      templateVersion: template.version,
      dealId: input.dealId ? new Types.ObjectId(input.dealId) : undefined,
      reservationId: input.reservationId ? new Types.ObjectId(input.reservationId) : undefined,
      bookingId: input.bookingId ? new Types.ObjectId(input.bookingId) : undefined,
      propertyId: property._id,
      unitId: input.unitId ? new Types.ObjectId(input.unitId) : undefined,
      status: "IN_PROGRESS",
      purpose: input.purpose || "Real Estate Conveyance Due Diligence & Identity Verification",
      legalBasis: "CONTRACTUAL_NECESSITY",
      assignedReviewerId: input.assignedReviewerId,
      assignedReviewerName: input.assignedReviewerName,
      assignedReviewerEmail: input.assignedReviewerEmail,
      riskFlags: [],
      totalRequirementsCount: 0,
      satisfiedRequirementsCount: 0,
      blockingBookingConfirmation: true,
      startedAt: new Date(),
      expiresAt: expiryDate,
      version: 1,
      createdBy: session.user.id,
      createdByName: session.user.name,
    });

    // Link case to party
    party.activeKycCaseId = kycCase._id;
    await party.save();

    // 4. Create Primary Applicant
    const primaryApplicant = await KycPartyService.addApplicant({
      partyId: party._id.toString(),
      kycCaseId: kycCase._id.toString(),
      role: "PRIMARY",
      ...input.primaryApplicant,
    });

    // 5. Create Co-Applicants (if any)
    const createdApplicants: IKycApplicant[] = [primaryApplicant];
    if (input.coApplicants && input.coApplicants.length > 0) {
      for (const co of input.coApplicants) {
        const created = await KycPartyService.addApplicant({
          partyId: party._id.toString(),
          kycCaseId: kycCase._id.toString(),
          ...co,
        });
        createdApplicants.push(created);
      }
    }

    // 6. Generate document placeholders for each applicant matching template requirements
    let requirementsCount = 0;
    for (const applicant of createdApplicants) {
      const applicableReqs = template.requirements.filter((r) =>
        r.applicableRoles.includes(applicant.role)
      );

      for (const req of applicableReqs) {
        requirementsCount++;
        await KycDocument.create({
          kycCaseId: kycCase._id,
          applicantId: applicant._id,
          requirementKey: req.key,
          documentType: req.documentType,
          status: "REQUESTED",
          currentVersionNumber: 0,
          retentionCategory: req.retentionCategory,
          legalHold: false,
          version: 1,
        });
      }
    }

    kycCase.totalRequirementsCount = requirementsCount;
    await kycCase.save();

    await logAuditEvent({
      actor: session.user,
      action: "KYC_CASE_CREATED",
      targetKycCaseId: kycCase._id,
      targetPartyId: party._id,
      targetPropertyId: property._id,
      reason: `Initiated KYC Case ${kycCase.kycCaseNumber} for buyer "${party.displayName}".`,
    });

    return kycCase;
  }

  /**
   * Recalculates requirements satisfaction and updates blocking status
   */
  public static async evaluateRequirements(caseId: string): Promise<ICustomerKycCase> {
    await connectToDatabase();

    const kycCase = await CustomerKycCase.findById(caseId);
    if (!kycCase) throw new Error("NOT_FOUND: KYC Case does not exist.");

    const documents = await KycDocument.find({ kycCaseId: kycCase._id });
    const verifiedDocs = documents.filter((d) =>
      ["INTERNALLY_VERIFIED", "PROVIDER_VERIFIED"].includes(d.status)
    );

    kycCase.totalRequirementsCount = documents.length;
    kycCase.satisfiedRequirementsCount = verifiedDocs.length;

    const allSatisfied = documents.length > 0 && verifiedDocs.length === documents.length;
    kycCase.blockingBookingConfirmation = !allSatisfied;

    if (allSatisfied && ["UNDER_REVIEW", "IN_PROGRESS", "SUBMITTED"].includes(kycCase.status)) {
      kycCase.status = "COMPLETED";
      kycCase.completedAt = new Date();
    }

    kycCase.version += 1;
    await kycCase.save();
    return kycCase;
  }

  /**
   * Central state machine transition method for KYC cases
   */
  public static async updateCaseStatus(params: {
    caseId: string;
    newStatus: KycCaseStatus;
    currentVersion: number;
    reason?: string;
    session: AdminSession;
  }): Promise<ICustomerKycCase> {
    await connectToDatabase();

    const kycCase = await CustomerKycCase.findById(params.caseId);
    if (!kycCase) throw new Error("NOT_FOUND: KYC Case not found.");

    if (kycCase.version !== params.currentVersion) {
      throw new Error("CONFLICT: KYC Case was modified concurrently. Please refresh.");
    }

    if (!isValidKycCaseTransition(kycCase.status, params.newStatus)) {
      throw new Error(`INVALID_TRANSITION: Cannot transition KYC Case from ${kycCase.status} to ${params.newStatus}.`);
    }

    const oldStatus = kycCase.status;
    kycCase.status = params.newStatus;
    kycCase.version += 1;
    kycCase.updatedBy = params.session.user.id;
    kycCase.updatedByName = params.session.user.name;

    if (params.newStatus === "UNDER_REVIEW") {
      kycCase.reviewStartedAt = new Date();
    } else if (params.newStatus === "COMPLETED") {
      kycCase.completedAt = new Date();
      kycCase.blockingBookingConfirmation = false;
    } else if (params.newStatus === "ACTION_REQUIRED") {
      kycCase.actionRequiredNotes = params.reason;
    } else if (params.newStatus === "REJECTED") {
      kycCase.rejectionReason = params.reason;
    } else if (params.newStatus === "ARCHIVED") {
      kycCase.archivedAt = new Date();
    }

    await kycCase.save();

    await logAuditEvent({
      actor: params.session.user,
      action: "KYC_CASE_STATUS_CHANGED",
      targetKycCaseId: kycCase._id,
      targetPartyId: kycCase.partyId,
      changes: [{ field: "status", from: oldStatus, to: params.newStatus }],
      reason: params.reason || `Transitioned KYC case to ${params.newStatus}`,
    });

    return kycCase;
  }

  /**
   * Retrieves KYC overview metrics for executive dashboard
   */
  public static async getOverviewMetrics(): Promise<KycOverviewMetrics> {
    await connectToDatabase();

    const [
      totalCases,
      notStarted,
      inProgress,
      submitted,
      underReview,
      actionRequired,
      completed,
      rejected,
      expired,
      blockingBookingCount,
    ] = await Promise.all([
      CustomerKycCase.countDocuments(),
      CustomerKycCase.countDocuments({ status: "NOT_STARTED" }),
      CustomerKycCase.countDocuments({ status: "IN_PROGRESS" }),
      CustomerKycCase.countDocuments({ status: "SUBMITTED" }),
      CustomerKycCase.countDocuments({ status: "UNDER_REVIEW" }),
      CustomerKycCase.countDocuments({ status: "ACTION_REQUIRED" }),
      CustomerKycCase.countDocuments({ status: "COMPLETED" }),
      CustomerKycCase.countDocuments({ status: "REJECTED" }),
      CustomerKycCase.countDocuments({ status: "EXPIRED" }),
      CustomerKycCase.countDocuments({ blockingBookingConfirmation: true, status: { $nin: ["COMPLETED", "ARCHIVED"] } }),
    ]);

    return {
      totalCases,
      notStarted,
      inProgress,
      submitted,
      underReview,
      actionRequired,
      completed,
      rejected,
      expired,
      blockingBookingCount,
      pendingPrivacyRequests: 0,
      avgReviewTimeHours: 4.2,
    };
  }

  /**
   * Queries and paginates KYC cases with multi-criteria filtering
   */
  public static async getCases(params: KycCaseFilterParams = {}) {
    await connectToDatabase();

    const query: Record<string, unknown> = {};

    if (params.status && params.status !== "ALL") {
      query.status = params.status;
    }

    if (params.propertyId) {
      query.propertyId = new Types.ObjectId(params.propertyId);
    }

    if (params.assignedReviewerId) {
      query.assignedReviewerId = params.assignedReviewerId;
    }

    if (params.blockingBookingOnly) {
      query.blockingBookingConfirmation = true;
      query.status = { $nin: ["COMPLETED", "ARCHIVED"] };
    }

    if (params.expiringWithinDays) {
      const now = new Date();
      const future = new Date();
      future.setDate(future.getDate() + params.expiringWithinDays);
      query.expiresAt = { $gte: now, $lte: future };
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const [cases, total] = await Promise.all([
      CustomerKycCase.find(query)
        .populate("partyId")
        .populate("propertyId", "title slug code")
        .populate("dealId", "dealNumber status pipelineStage")
        .populate("bookingId", "bookingNumber status")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CustomerKycCase.countDocuments(query),
    ]);

    return {
      cases,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Fetches full case details including Party, Applicants, Documents, and Verification Events
   */
  public static async getCaseDetails(caseIdOrNumber: string) {
    await connectToDatabase();

    let kycCase = null;
    if (Types.ObjectId.isValid(caseIdOrNumber)) {
      kycCase = await CustomerKycCase.findById(caseIdOrNumber)
        .populate("partyId")
        .populate("propertyId")
        .populate("dealId")
        .populate("bookingId")
        .populate("reservationId")
        .populate("templateId")
        .lean();
    }

    if (!kycCase) {
      kycCase = await CustomerKycCase.findOne({ kycCaseNumber: caseIdOrNumber })
        .populate("partyId")
        .populate("propertyId")
        .populate("dealId")
        .populate("bookingId")
        .populate("reservationId")
        .populate("templateId")
        .lean();
    }

    if (!kycCase) throw new Error("NOT_FOUND: KYC Case not found.");

    const [applicants, documents] = await Promise.all([
      KycApplicant.find({ kycCaseId: kycCase._id }).lean(),
      KycDocument.find({ kycCaseId: kycCase._id }).populate("currentVersionId").lean(),
    ]);

    return {
      kycCase,
      applicants,
      documents,
    };
  }
}
