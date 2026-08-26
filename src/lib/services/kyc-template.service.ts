import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { KycRequirementTemplate, IKycRequirementTemplate } from "@/models/KycRequirementTemplate";
import { IKycRequirementTemplateDef, CustomerPartyType } from "@/types/kyc";

export const DEFAULT_KYC_TEMPLATES: IKycRequirementTemplateDef[] = [
  {
    templateKey: "INDIVIDUAL_RESIDENTIAL",
    name: "Individual Buyer - Residential Plots",
    partyType: "INDIVIDUAL",
    version: 1,
    description: "Standard DPDPA-compliant identity checklist for single resident individuals purchasing plotted inventory.",
    defaultExpiryDays: 365,
    requirements: [
      {
        key: "PAN_CARD_PRIMARY",
        displayName: "Permanent Account Number (PAN)",
        purpose: "Statutory tax compliance and high-value real estate transaction reporting under Income Tax Act",
        documentType: "PAN_CARD",
        required: true,
        acceptedEvidenceNotes: "Valid clear scan of original PAN Card or e-PAN copy.",
        applicableRoles: ["PRIMARY"],
        allowsExpiry: false,
        maskingRule: "PAN_MASK_MIDDLE",
        retentionCategory: "KYC_TRANSACTIONAL_BUYER",
        displayOrder: 1,
      },
      {
        key: "IDENTITY_PROOF_PRIMARY",
        displayName: "Official Identity Evidence (Passport / Voter ID / Driving Licence / Masked Aadhaar)",
        purpose: "Proof of identity verification for property conveyance deed and registry due diligence",
        documentType: "PASSPORT", // Can accept Voter ID, Driving Licence, or Masked Aadhaar as alternatives
        required: true,
        acceptedEvidenceNotes: "Passport, Election Voter ID Card, Valid Driving Licence, or Masked Aadhaar (first 8 digits obscured).",
        applicableRoles: ["PRIMARY"],
        allowsExpiry: true,
        maskingRule: "MASK_ALL_BUT_LAST_4",
        retentionCategory: "IDENTITY_DOCUMENT_SCAN",
        displayOrder: 2,
      },
      {
        key: "ADDRESS_PROOF_PRIMARY",
        displayName: "Current Residential Address Proof",
        purpose: "Verification of residential address for legal notices, JDA/RERA communications and dispatch",
        documentType: "ADDRESS_PROOF_UTILITY_BILL",
        required: true,
        acceptedEvidenceNotes: "Electricity/Water bill (under 3 months old), Bank Statement with address, or Passport address page.",
        applicableRoles: ["PRIMARY"],
        allowsExpiry: true,
        maskingRule: "NONE",
        retentionCategory: "IDENTITY_DOCUMENT_SCAN",
        displayOrder: 3,
      },
      {
        key: "PASSPORT_PHOTO_PRIMARY",
        displayName: "Recent Passport Size Photograph",
        purpose: "Visual identity record for buyer registration and plot handover file",
        documentType: "PASSPORT_PHOTOGRAPH",
        required: true,
        acceptedEvidenceNotes: "Clear, color front-facing passport photograph with light background.",
        applicableRoles: ["PRIMARY"],
        allowsExpiry: false,
        maskingRule: "NONE",
        retentionCategory: "IDENTITY_DOCUMENT_SCAN",
        displayOrder: 4,
      },
    ],
  },
  {
    templateKey: "JOINT_RESIDENTIAL",
    name: "Joint Applicants - Residential Plots",
    partyType: "JOINT_APPLICANTS",
    version: 1,
    description: "Multi-party identity checklist for co-owners and joint applicants.",
    defaultExpiryDays: 365,
    requirements: [
      {
        key: "PAN_CARD_PRIMARY",
        displayName: "Primary Applicant PAN Card",
        purpose: "Statutory tax compliance and property transaction reporting",
        documentType: "PAN_CARD",
        required: true,
        acceptedEvidenceNotes: "Valid clear scan of original PAN Card of primary buyer.",
        applicableRoles: ["PRIMARY"],
        allowsExpiry: false,
        maskingRule: "PAN_MASK_MIDDLE",
        retentionCategory: "KYC_TRANSACTIONAL_BUYER",
        displayOrder: 1,
      },
      {
        key: "IDENTITY_PROOF_PRIMARY",
        displayName: "Primary Applicant Identity Proof",
        purpose: "Proof of identity verification for property conveyance deed",
        documentType: "PASSPORT",
        required: true,
        acceptedEvidenceNotes: "Passport, Voter ID, Driving Licence, or Masked Aadhaar.",
        applicableRoles: ["PRIMARY"],
        allowsExpiry: true,
        maskingRule: "MASK_ALL_BUT_LAST_4",
        retentionCategory: "IDENTITY_DOCUMENT_SCAN",
        displayOrder: 2,
      },
      {
        key: "PAN_CARD_JOINT",
        displayName: "Co-Applicant PAN Card",
        purpose: "Statutory tax compliance for co-purchaser",
        documentType: "PAN_CARD",
        required: true,
        acceptedEvidenceNotes: "Valid clear scan of original PAN Card of co-buyer.",
        applicableRoles: ["JOINT"],
        allowsExpiry: false,
        maskingRule: "PAN_MASK_MIDDLE",
        retentionCategory: "KYC_TRANSACTIONAL_BUYER",
        displayOrder: 3,
      },
      {
        key: "IDENTITY_PROOF_JOINT",
        displayName: "Co-Applicant Identity Proof",
        purpose: "Proof of identity verification for joint conveyance deed",
        documentType: "PASSPORT",
        required: true,
        acceptedEvidenceNotes: "Passport, Voter ID, Driving Licence, or Masked Aadhaar of co-buyer.",
        applicableRoles: ["JOINT"],
        allowsExpiry: true,
        maskingRule: "MASK_ALL_BUT_LAST_4",
        retentionCategory: "IDENTITY_DOCUMENT_SCAN",
        displayOrder: 4,
      },
    ],
  },
  {
    templateKey: "NRI_INVESTOR",
    name: "NRI / OCI Investor Identity Pack",
    partyType: "INDIVIDUAL",
    version: 1,
    description: "Specialized due diligence checklist for Non-Resident Indians purchasing land assets in India.",
    defaultExpiryDays: 365,
    requirements: [
      {
        key: "PAN_CARD_PRIMARY",
        displayName: "Indian PAN Card",
        purpose: "Statutory tax compliance for non-resident real estate transactions",
        documentType: "PAN_CARD",
        required: true,
        acceptedEvidenceNotes: "Valid Indian PAN card copy.",
        applicableRoles: ["PRIMARY"],
        allowsExpiry: false,
        maskingRule: "PAN_MASK_MIDDLE",
        retentionCategory: "KYC_TRANSACTIONAL_BUYER",
        displayOrder: 1,
      },
      {
        key: "PASSPORT_OVERSEAS",
        displayName: "Valid International Passport / OCI Card",
        purpose: "FEMA compliance and nationality verification for NRI property purchase",
        documentType: "PASSPORT",
        required: true,
        acceptedEvidenceNotes: "Valid Passport first and last page, plus valid visa / OCI booklet copy.",
        applicableRoles: ["PRIMARY"],
        allowsExpiry: true,
        maskingRule: "MASK_ALL_BUT_LAST_4",
        retentionCategory: "IDENTITY_DOCUMENT_SCAN",
        displayOrder: 2,
      },
      {
        key: "NRE_NRO_BANK_PROOF",
        displayName: "NRE / NRO Bank Account Proof",
        purpose: "FEMA fund transfer compliance verification from approved banking channels",
        documentType: "ADDRESS_PROOF_BANK_STATEMENT",
        required: true,
        acceptedEvidenceNotes: "Active NRE/NRO Bank Account cancelled cheque or statement (under 3 months).",
        applicableRoles: ["PRIMARY"],
        allowsExpiry: true,
        maskingRule: "NONE",
        retentionCategory: "IDENTITY_DOCUMENT_SCAN",
        displayOrder: 3,
      },
    ],
  },
  {
    templateKey: "COMMERCIAL_ENTITY",
    name: "Corporate / Company Commercial Buyer",
    partyType: "COMPANY",
    version: 1,
    description: "Entity verification, board resolution, and authorized signatory checklist for corporate purchases.",
    defaultExpiryDays: 365,
    requirements: [
      {
        key: "COMPANY_PAN",
        displayName: "Company PAN Card",
        purpose: "Corporate tax identification and high-value purchase recording",
        documentType: "PAN_CARD",
        required: true,
        acceptedEvidenceNotes: "PAN card in the name of the purchasing company.",
        applicableRoles: ["PRIMARY"],
        allowsExpiry: false,
        maskingRule: "PAN_MASK_MIDDLE",
        retentionCategory: "KYC_TRANSACTIONAL_BUYER",
        displayOrder: 1,
      },
      {
        key: "CERTIFICATE_OF_INCORPORATION",
        displayName: "Certificate of Incorporation & MOA/AOA",
        purpose: "Verification of legal entity existence and property acquisition powers",
        documentType: "CERTIFICATE_OF_INCORPORATION",
        required: true,
        acceptedEvidenceNotes: "MCA Certificate of Incorporation, Memorandum, and Articles of Association.",
        applicableRoles: ["PRIMARY"],
        allowsExpiry: false,
        maskingRule: "NONE",
        retentionCategory: "IDENTITY_DOCUMENT_SCAN",
        displayOrder: 2,
      },
      {
        key: "BOARD_RESOLUTION",
        displayName: "Certified Board Resolution",
        purpose: "Authorization to purchase designated land parcel and execute deed",
        documentType: "BOARD_RESOLUTION",
        required: true,
        acceptedEvidenceNotes: "Certified true copy of Board Resolution on company letterhead authorizing designated signatory.",
        applicableRoles: ["PRIMARY"],
        allowsExpiry: false,
        maskingRule: "NONE",
        retentionCategory: "KYC_TRANSACTIONAL_BUYER",
        displayOrder: 3,
      },
      {
        key: "SIGNATORY_PAN_AND_ID",
        displayName: "Authorized Signatory PAN & Identity Proof",
        purpose: "Identity verification of the individual authorized to sign sale agreement",
        documentType: "PASSPORT",
        required: true,
        acceptedEvidenceNotes: "PAN and Passport/Voter ID/Driving Licence of authorized Director/Signatory.",
        applicableRoles: ["AUTHORIZED_SIGNATORY"],
        allowsExpiry: true,
        maskingRule: "MASK_ALL_BUT_LAST_4",
        retentionCategory: "IDENTITY_DOCUMENT_SCAN",
        displayOrder: 4,
      },
    ],
  },
];

export class KycTemplateService {
  /**
   * Seeds default system KYC templates in MongoDB
   */
  public static async seedDefaultTemplates(actorId: string = "SYSTEM"): Promise<void> {
    await connectToDatabase();

    for (const tpl of DEFAULT_KYC_TEMPLATES) {
      const existing = await KycRequirementTemplate.findOne({
        templateKey: tpl.templateKey,
        version: tpl.version,
      });

      if (!existing) {
        await KycRequirementTemplate.create({
          templateKey: tpl.templateKey,
          name: tpl.name,
          partyType: tpl.partyType,
          version: tpl.version,
          description: tpl.description,
          requirements: tpl.requirements,
          status: "ACTIVE",
          defaultExpiryDays: tpl.defaultExpiryDays || 365,
          approvedBy: actorId,
          effectiveDate: new Date(),
        });
      }
    }
  }

  /**
   * Resolves the appropriate template for a given party type or key
   */
  public static async getTemplate(
    templateKeyOrId?: string,
    partyType: CustomerPartyType = "INDIVIDUAL"
  ): Promise<IKycRequirementTemplate> {
    await connectToDatabase();
    await this.seedDefaultTemplates();

    if (templateKeyOrId) {
      // Try find by ID
      const byId = await KycRequirementTemplate.findById(templateKeyOrId);
      if (byId) return byId;

      // Try find by key
      const byKey = await KycRequirementTemplate.findOne({
        templateKey: templateKeyOrId,
        status: "ACTIVE",
      }).sort({ version: -1 });
      if (byKey) return byKey;
    }

    // Default by party type
    let defaultKey = "INDIVIDUAL_RESIDENTIAL";
    if (partyType === "JOINT_APPLICANTS") defaultKey = "JOINT_RESIDENTIAL";
    if (partyType === "COMPANY") defaultKey = "COMMERCIAL_ENTITY";

    const defaultTpl = await KycRequirementTemplate.findOne({
      templateKey: defaultKey,
      status: "ACTIVE",
    }).sort({ version: -1 });

    if (!defaultTpl) {
      throw new Error(`NOT_FOUND: No active requirement template for party type "${partyType}"`);
    }

    return defaultTpl;
  }
}
