import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { LegalChecklistTemplate } from "@/models/LegalChecklistTemplate";
import { PropertyLegalChecklist, IPropertyLegalChecklist, IPropertyChecklistItem } from "@/models/PropertyLegalChecklist";
import { LegalDocument } from "@/models/LegalDocument";
import { Property } from "@/models/Property";
import { PropertyReadinessSummary, ChecklistItemStatus } from "@/types/legal-vault";
import { logger } from "@/lib/logger";

export const DEFAULT_RAJASTHAN_PLOTTED_TEMPLATE = {
  templateCode: "RAJASTHAN_PLOTTED_V1",
  name: "Rajasthan Plotted & Township Statutory Checklist",
  description: "Standard compliance checklist for JDA/RERA plotted developments and townships in Rajasthan.",
  propertyTypes: ["RESIDENTIAL_PLOT", "COMMERCIAL_PLOT", "MIXED_DEVELOPMENT"],
  applicableStates: ["RAJASTHAN"],
  version: 1,
  status: "ACTIVE" as const,
  items: [
    {
      itemKey: "TITLE_DEED_CHAIN",
      displayName: "70-Year Title Chain & Registry Documents",
      description: "Complete chain of title deeds tracing ownership without legal ambiguity.",
      category: "TITLE_CHAIN" as const,
      isRequired: true,
      expiryExpected: false,
      displayOrder: 1,
      reviewInstructions: "Verify continuous sequence of registered conveyances without gaps.",
      legalSourceNote: "Section 17 Indian Registration Act",
    },
    {
      itemKey: "JDA_LAND_CONVERSION",
      displayName: "JDA 90-A / Section 90-B Land Use Conversion Order",
      description: "Statutory order converting agricultural tenure to non-agricultural/residential township use.",
      category: "LAND_USE_CONVERSION" as const,
      isRequired: true,
      expiryExpected: false,
      displayOrder: 2,
      reviewInstructions: "Inspect seal of competent Revenue/JDA authority and conversion fee challan.",
      legalSourceNote: "Rajasthan Land Revenue Act 1956",
    },
    {
      itemKey: "RERA_REGISTRATION_CERT",
      displayName: "RERA Project Registration Certificate",
      description: "Official Raj-RERA registration certificate with verified project registration number.",
      category: "RERA_REGISTRATION" as const,
      isRequired: true,
      expiryExpected: true,
      displayOrder: 3,
      reviewInstructions: "Check project validity dates on Raj-RERA portal.",
      legalSourceNote: "Real Estate (Regulation and Development) Act 2016",
    },
    {
      itemKey: "JDA_APPROVED_LAYOUT",
      displayName: "JDA/Authority Approved Layout Plan",
      description: "Signed blueprint layout showing plotted demarcations, road widths, and open spaces.",
      category: "LAYOUT_APPROVAL" as const,
      isRequired: true,
      expiryExpected: false,
      displayOrder: 4,
      reviewInstructions: "Verify plot numbering aligns strictly with physical site survey map.",
      legalSourceNote: "JDA Township Policy 2010",
    },
    {
      itemKey: "NON_ENCUMBRANCE_CERT",
      displayName: "Sub-Registrar 30-Year Non-Encumbrance Certificate (EC)",
      description: "Form 15/16 Non-encumbrance certificate confirming no mortgages, liens, or court attachments.",
      category: "ENCUMBRANCE_NOC" as const,
      isRequired: true,
      expiryExpected: true,
      displayOrder: 5,
      reviewInstructions: "Certificate date must be within past 12 months.",
      legalSourceNote: "Transfer of Property Act 1882",
    },
    {
      itemKey: "FIRE_SAFETY_NOC",
      displayName: "Fire and Emergency Services NOC",
      description: "Statutory clearance regarding firefighting access and water infrastructure.",
      category: "FIRE_SAFETY_NOC" as const,
      isRequired: false,
      expiryExpected: true,
      displayOrder: 6,
    },
  ],
};

export class LegalChecklistService {
  /**
   * Seed default checklist templates if none exist
   */
  static async seedDefaultTemplates(actorId: string): Promise<void> {
    await connectToDatabase();
    const existing = await LegalChecklistTemplate.findOne({ templateCode: DEFAULT_RAJASTHAN_PLOTTED_TEMPLATE.templateCode });
    if (!existing) {
      await LegalChecklistTemplate.create({
        ...DEFAULT_RAJASTHAN_PLOTTED_TEMPLATE,
        createdBy: actorId,
      });
      logger.info("[LegalVault] Seeded default Rajasthan Plotted checklist template.");
    }
  }

  /**
   * Initialize or evaluate a property checklist based on active documents
   */
  static async evaluatePropertyChecklist(propertyId: string, actorId?: string): Promise<IPropertyLegalChecklist> {
    await connectToDatabase();
    const pId = new Types.ObjectId(propertyId);

    // 1. Find or pick template
    let template = await LegalChecklistTemplate.findOne({ status: "ACTIVE" }).sort({ createdAt: -1 });
    if (!template) {
      await this.seedDefaultTemplates(actorId || "SYSTEM");
      template = await LegalChecklistTemplate.findOne({ templateCode: DEFAULT_RAJASTHAN_PLOTTED_TEMPLATE.templateCode });
    }

    // 2. Fetch all non-archived documents for this property
    const documents = await LegalDocument.find({
      propertyId: pId,
      status: { $ne: "ARCHIVED" },
    }).lean();

    const docByCategory = new Map<string, (typeof documents)[0]>();
    const docByKey = new Map<string, (typeof documents)[0]>();

    for (const doc of documents) {
      if (doc.checklistItemKey) {
        docByKey.set(doc.checklistItemKey, doc);
      }
      docByCategory.set(doc.category, doc);
    }

    // 3. Build evaluated checklist items
    const templateItems = template?.items || [];
    const evaluatedItems: IPropertyChecklistItem[] = [];

    let completed = 0;
    let missing = 0;
    let expired = 0;
    let actionReq = 0;

    for (const tItem of templateItems) {
      const matchedDoc = docByKey.get(tItem.itemKey) || docByCategory.get(tItem.category);
      let status: ChecklistItemStatus = "NOT_PROVIDED";
      let docId: Types.ObjectId | undefined;
      let docRef: string | undefined;
      let lastRev: Date | undefined;
      let actReason: string | undefined;

      if (matchedDoc) {
        docId = matchedDoc._id;
        docRef = matchedDoc.documentReference;
        lastRev = matchedDoc.lastReviewedAt;
        actReason = matchedDoc.actionRequiredReason;

        if (matchedDoc.status === "INTERNALLY_VERIFIED") {
          // Check if document has reached expiration
          if (matchedDoc.expiryDate && new Date(matchedDoc.expiryDate).getTime() < Date.now()) {
            status = "EXPIRED";
            expired++;
          } else {
            status = "INTERNALLY_VERIFIED";
            completed++;
          }
        } else if (matchedDoc.status === "UNDER_REVIEW") {
          status = "UNDER_REVIEW";
        } else if (matchedDoc.status === "ACTION_REQUIRED") {
          status = "ACTION_REQUIRED";
          actionReq++;
        } else if (matchedDoc.status === "REJECTED") {
          status = "REJECTED";
        } else if (matchedDoc.status === "EXPIRED") {
          status = "EXPIRED";
          expired++;
        } else {
          status = "UPLOADED";
        }
      } else {
        if (tItem.isRequired) {
          missing++;
        }
      }

      evaluatedItems.push({
        itemKey: tItem.itemKey,
        displayName: tItem.displayName,
        category: tItem.category,
        isRequired: tItem.isRequired,
        status,
        documentId: docId,
        documentReference: docRef,
        lastReviewedAt: lastRev,
        actionRequiredReason: actReason,
      });
    }

    const totalApplicable = templateItems.length;
    const readinessPercentage = totalApplicable > 0 ? Math.round((completed / totalApplicable) * 100) : 0;

    const checklist = await PropertyLegalChecklist.findOneAndUpdate(
      { propertyId: pId },
      {
        propertyId: pId,
        templateId: template?._id,
        templateCode: template?.templateCode || "STANDARD_V1",
        templateVersion: template?.version || 1,
        items: evaluatedItems,
        totalApplicableItems: totalApplicable,
        completedItemsCount: completed,
        missingItemsCount: missing,
        expiredItemsCount: expired,
        actionRequiredCount: actionReq,
        readinessPercentage,
        lastEvaluatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return checklist;
  }

  /**
   * Get property readiness summary (neutral terminology)
   */
  static async getPropertyReadinessSummary(propertyId: string): Promise<PropertyReadinessSummary> {
    await connectToDatabase();
    const pId = new Types.ObjectId(propertyId);

    const [property, checklist, docs] = await Promise.all([
      Property.findById(pId).select("title").lean(),
      PropertyLegalChecklist.findOne({ propertyId: pId }).lean(),
      LegalDocument.find({ propertyId: pId, status: { $ne: "ARCHIVED" } }).lean(),
    ]);

    const propertyName = property?.title || "Property";
    const now = Date.now();
    const in30Days = now + 30 * 86400000;

    let verified = 0;
    let underRev = 0;
    let actionReq = 0;
    let rejected = 0;
    let expired = 0;
    let expiringSoon = 0;
    let publicApproved = 0;
    let legalHold = false;

    for (const doc of docs) {
      if (doc.legalHold) legalHold = true;
      if (doc.classification === "PUBLIC_APPROVED" && doc.publicVisibility !== "PRIVATE") {
        publicApproved++;
      }

      if (doc.status === "INTERNALLY_VERIFIED") {
        if (doc.expiryDate && new Date(doc.expiryDate).getTime() < now) {
          expired++;
        } else {
          verified++;
          if (doc.expiryDate && new Date(doc.expiryDate).getTime() <= in30Days) {
            expiringSoon++;
          }
        }
      } else if (doc.status === "UNDER_REVIEW") {
        underRev++;
      } else if (doc.status === "ACTION_REQUIRED") {
        actionReq++;
      } else if (doc.status === "REJECTED") {
        rejected++;
      } else if (doc.status === "EXPIRED") {
        expired++;
      }
    }

    const totalApplicable = checklist?.totalApplicableItems || docs.length;
    const readinessPct = totalApplicable > 0 ? Math.round((verified / totalApplicable) * 100) : 0;

    return {
      propertyId,
      propertyName,
      totalApplicableChecklistItems: totalApplicable,
      providedDocumentsCount: docs.length,
      internallyVerifiedCount: verified,
      underReviewCount: underRev,
      actionRequiredCount: actionReq,
      rejectedCount: rejected,
      expiredCount: expired,
      missingCount: checklist?.missingItemsCount || 0,
      expiringSoonCount: expiringSoon,
      publicApprovedCount: publicApproved,
      readinessPercentage: readinessPct,
      lastReviewedAt: checklist?.lastEvaluatedAt?.toISOString(),
      legalHoldActive: legalHold,
    };
  }
}
