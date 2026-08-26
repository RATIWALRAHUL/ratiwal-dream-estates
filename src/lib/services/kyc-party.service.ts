import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CustomerParty, ICustomerParty } from "@/models/CustomerParty";
import { KycApplicant, IKycApplicant } from "@/models/KycApplicant";
import { Lead } from "@/models/Lead";
import { KycSecurityUtils } from "@/lib/security/encryption";
import { AdminSession } from "@/lib/auth/session";
import { CustomerPartyType, ApplicantRole } from "@/types/kyc";

export interface CreatePartyInput {
  partyType: CustomerPartyType;
  displayName: string;
  leadId?: string;
  primaryContactName: string;
  primaryContactPhone?: string;
  primaryContactEmail?: string;
}

export interface AddApplicantInput {
  partyId: string;
  kycCaseId: string;
  role: ApplicantRole;
  fullName: string;
  phone?: string;
  email?: string;
  pan?: string;
  aadhaarNumber?: string;
  passportNumber?: string;
  dob?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  isNri?: boolean;
}

export class KycPartyService {
  /**
   * Generates a non-colliding human-friendly party reference code: RDE-PTY-XXXXXX
   */
  public static generatePartyReference(): string {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `RDE-PTY-${randomNum}`;
  }

  /**
   * Creates or resolves a CustomerParty entity. If leadId is provided and party exists, reuses it.
   */
  public static async getOrCreatePartyForLead(
    leadId: string,
    session: AdminSession,
    partyType: CustomerPartyType = "INDIVIDUAL"
  ): Promise<ICustomerParty> {
    await connectToDatabase();

    const lead = await Lead.findById(leadId);
    if (!lead) throw new Error("NOT_FOUND: Referenced lead does not exist.");

    let party = await CustomerParty.findOne({ leadId: lead._id });
    if (!party) {
      party = await CustomerParty.create({
        partyReference: this.generatePartyReference(),
        partyType,
        displayName: lead.fullName,
        leadId: lead._id,
        primaryContactName: lead.fullName,
        primaryContactPhoneMasked: lead.displayPhone || undefined,
        primaryContactEmailMasked: lead.displayEmail || undefined,
        dealIds: [],
        bookingIds: [],
        status: "ACTIVE",
        createdBy: session.user.id,
        createdByName: session.user.name,
      });
    }

    return party;
  }

  /**
   * Creates a new standalone CustomerParty
   */
  public static async createParty(
    input: CreatePartyInput,
    session: AdminSession
  ): Promise<ICustomerParty> {
    await connectToDatabase();

    const party = await CustomerParty.create({
      partyReference: this.generatePartyReference(),
      partyType: input.partyType,
      displayName: input.displayName.trim(),
      leadId: input.leadId ? new Types.ObjectId(input.leadId) : undefined,
      primaryContactName: input.primaryContactName.trim(),
      primaryContactPhoneMasked: input.primaryContactPhone ? KycSecurityUtils.maskGenericDocument(input.primaryContactPhone) : undefined,
      primaryContactEmailMasked: input.primaryContactEmail?.trim(),
      dealIds: [],
      bookingIds: [],
      status: "ACTIVE",
      createdBy: session.user.id,
      createdByName: session.user.name,
    });

    return party;
  }

  /**
   * Adds an applicant to a KYC case with field-level encryption for sensitive PII and blind HMACs
   */
  public static async addApplicant(
    input: AddApplicantInput
  ): Promise<IKycApplicant> {
    await connectToDatabase();

    // 1. Validation and masking
    const maskedPan = input.pan ? KycSecurityUtils.maskPan(input.pan) : undefined;
    const maskedAadhaarLast4 = input.aadhaarNumber ? KycSecurityUtils.maskAadhaar(input.aadhaarNumber) : undefined;
    const maskedPassport = input.passportNumber ? KycSecurityUtils.maskGenericDocument(input.passportNumber) : undefined;
    const maskedPhone = input.phone ? KycSecurityUtils.maskGenericDocument(input.phone) : undefined;

    // 2. Encryption
    const encryptedPan = input.pan ? KycSecurityUtils.encryptField(input.pan.toUpperCase()).encryptedData : undefined;
    const encryptedAadhaar = input.aadhaarNumber ? KycSecurityUtils.encryptField(input.aadhaarNumber.replace(/\D/g, "")).encryptedData : undefined;
    const encryptedDob = input.dob ? KycSecurityUtils.encryptField(input.dob).encryptedData : undefined;
    const encryptedAddressLine = input.addressLine ? KycSecurityUtils.encryptField(input.addressLine).encryptedData : undefined;

    // 3. Keyed blind HMACs
    const panHmac = input.pan ? KycSecurityUtils.generateKeyedHmac(input.pan) : undefined;
    const aadhaarHmac = input.aadhaarNumber ? KycSecurityUtils.generateKeyedHmac(input.aadhaarNumber) : undefined;

    const applicant = await KycApplicant.create({
      partyId: new Types.ObjectId(input.partyId),
      kycCaseId: new Types.ObjectId(input.kycCaseId),
      role: input.role,
      fullName: input.fullName.trim(),
      maskedPhone,
      maskedEmail: input.email?.trim(),
      maskedPan,
      maskedAadhaarLast4,
      maskedPassport,
      encryptedDob,
      encryptedAddressLine,
      encryptedPan,
      encryptedAadhaarNumber: encryptedAadhaar,
      encryptionKeyVersion: 1,
      panHmac,
      aadhaarHmac,
      city: input.city?.trim(),
      state: input.state?.trim(),
      pincode: input.pincode?.trim(),
      country: input.country?.trim() || "India",
      isNri: Boolean(input.isNri),
      status: "PENDING",
      version: 1,
    });

    return applicant;
  }
}
