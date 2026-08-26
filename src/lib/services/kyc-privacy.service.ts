import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { DataProcessingRecord, IDataProcessingRecord } from "@/models/DataProcessingRecord";
import { PrivacyRequest, IPrivacyRequest } from "@/models/PrivacyRequest";
import { CustomerParty } from "@/models/CustomerParty";
import { CustomerKycCase } from "@/models/CustomerKycCase";
import { logAuditEvent } from "@/lib/services/audit.service";
import { AdminSession } from "@/lib/auth/session";
import {
  PrivacyRequestType,
  PrivacyRequestStatus,
  DpdpaProcessingBasis,
} from "@/types/kyc";

export interface RecordConsentInput {
  partyId: string;
  applicantId?: string;
  kycCaseId?: string;
  purpose: string;
  legalBasis?: DpdpaProcessingBasis;
  noticeVersion?: string;
  dataCategoriesCollected: string[];
  documentTypesCollected?: string[];
  consentGranted: boolean;
  consentMethod?: "DIGITAL_CHECKBOX" | "PHYSICAL_SIGNATURE" | "VERIFIED_SESSION";
  ipAddressMasked?: string;
  userAgentSnippet?: string;
}

export interface CreatePrivacyRequestInput {
  partyId: string;
  applicantId?: string;
  requestType: PrivacyRequestType;
  requesterEmail: string;
  requesterPhone?: string;
  requestDetails: string;
  identityVerificationMethod?: "IDENTITY_DOCUMENT_MATCH" | "OTP_VERIFIED" | "LEGAL_REPRESENTATIVE_POA";
}

export class KycPrivacyService {
  /**
   * Generates a non-colliding privacy request reference: RDE-PRV-XXXXXX
   */
  public static generateRequestNumber(): string {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `RDE-PRV-${randomNum}`;
  }

  /**
   * Records an explicit, versioned, unbundled DPDPA consent record
   */
  public static async recordConsent(input: RecordConsentInput): Promise<IDataProcessingRecord> {
    await connectToDatabase();

    const record = await DataProcessingRecord.create({
      partyId: new Types.ObjectId(input.partyId),
      applicantId: input.applicantId ? new Types.ObjectId(input.applicantId) : undefined,
      kycCaseId: input.kycCaseId ? new Types.ObjectId(input.kycCaseId) : undefined,
      purpose: input.purpose,
      legalBasis: input.legalBasis || "EXPLICIT_CONSENT",
      noticeVersion: input.noticeVersion || "DPDPA_KYC_NOTICE_V1_2026",
      noticeTextLanguage: "en",
      dataCategoriesCollected: input.dataCategoriesCollected,
      documentTypesCollected: input.documentTypesCollected || [],
      consentGranted: input.consentGranted,
      consentGrantedAt: input.consentGranted ? new Date() : undefined,
      consentGrantedMethod: input.consentMethod || "DIGITAL_CHECKBOX",
      consentWithdrawn: false,
      ipAddressMasked: input.ipAddressMasked,
      userAgentSnippet: input.userAgentSnippet,
    });

    return record;
  }

  /**
   * Submits a DPDPA Data Principal Privacy Request (Access, Correction, Erasure, Grievance, etc.)
   */
  public static async createPrivacyRequest(
    input: CreatePrivacyRequestInput
  ): Promise<IPrivacyRequest> {
    await connectToDatabase();

    const party = await CustomerParty.findById(input.partyId);
    if (!party) throw new Error("NOT_FOUND: Referenced Customer Party does not exist.");

    const requestNumber = this.generateRequestNumber();
    const dueByDate = new Date();
    dueByDate.setDate(dueByDate.getDate() + 30); // 30-day statutory turnaround window

    const privacyRequest = await PrivacyRequest.create({
      requestNumber,
      partyId: party._id,
      applicantId: input.applicantId ? new Types.ObjectId(input.applicantId) : undefined,
      requestType: input.requestType,
      status: "RECEIVED",
      requesterEmailMasked: input.requesterEmail.trim(),
      requesterPhoneMasked: input.requesterPhone?.trim(),
      identityVerificationMethod: input.identityVerificationMethod || "IDENTITY_DOCUMENT_MATCH",
      requestDetails: input.requestDetails.trim(),
      receivedAt: new Date(),
      dueByDate,
    });

    return privacyRequest;
  }

  /**
   * Updates disposition and decision for a Privacy Request
   */
  public static async updatePrivacyRequestStatus(params: {
    requestId: string;
    newStatus: PrivacyRequestStatus;
    legalExceptionReason?: string;
    dispositionNotes?: string;
    session: AdminSession;
  }): Promise<IPrivacyRequest> {
    await connectToDatabase();

    const request = await PrivacyRequest.findById(params.requestId);
    if (!request) throw new Error("NOT_FOUND: Privacy request not found.");

    request.status = params.newStatus;
    request.legalExceptionReason = params.legalExceptionReason;
    request.dispositionNotes = params.dispositionNotes;
    request.assignedOfficerId = params.session.user.id;
    request.assignedOfficerName = params.session.user.name;

    if (params.newStatus === "COMPLETED" || params.newStatus === "REJECTED_LEGAL_EXCEPTION") {
      request.completedAt = new Date();
    }

    await request.save();

    await logAuditEvent({
      actor: params.session.user,
      action: "KYC_PRIVACY_REQUEST_COMPLETED",
      targetPrivacyRequestId: request._id,
      targetPartyId: request.partyId,
      reason: `Updated privacy request ${request.requestNumber} to status ${params.newStatus}.`,
    });

    return request;
  }
}
