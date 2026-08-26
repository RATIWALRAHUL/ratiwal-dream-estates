import "server-only";

import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PartnerSession, PartnerScope } from "@/types/partner";
import { ChannelPartner } from "@/models/ChannelPartner";
import { PartnerAccount } from "@/models/PartnerAccount";
import { PartnerPropertyAccess } from "@/models/PartnerPropertyAccess";
import { PartnerLeadSubmission } from "@/models/PartnerLeadSubmission";
import { LeadAttributionClaim } from "@/models/LeadAttributionClaim";
import { CommissionAccrual } from "@/models/CommissionAccrual";

export class PartnerGuard {
  /**
   * Resolves the authoritative data scope for an authenticated channel partner session.
   */
  public static async resolvePartnerScope(session: PartnerSession): Promise<PartnerScope> {
    await connectToDatabase();

    const account = await PartnerAccount.findById(session.user.id).lean();
    if (!account || !account.isActive) {
      throw new Error("UNAUTHORIZED: Partner account is inactive or disabled.");
    }

    const partner = await ChannelPartner.findById(account.partnerId).lean();
    if (!partner || partner.status === "DEACTIVATED" || partner.status === "ARCHIVED") {
      throw new Error("ACCESS_DENIED: Partner organisation is not active.");
    }

    // 1. Fetch authorized property grants
    const propertyGrants = await PartnerPropertyAccess.find({
      partnerId: partner._id,
      isActive: true,
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gt: new Date() } }],
    }).select("propertyId").lean();

    const authorizedPropertyIds = propertyGrants.map((g) => g.propertyId.toString());

    // 2. Fetch lead submissions & attribution claims
    const submissions = await PartnerLeadSubmission.find({
      partnerId: partner._id,
    }).select("_id").lean();

    const claims = await LeadAttributionClaim.find({
      partnerId: partner._id,
    }).select("_id").lean();

    return {
      partnerId: partner._id.toString(),
      partnerCode: partner.partnerCode,
      accountId: account._id.toString(),
      partnerType: partner.partnerType,
      status: partner.status,
      authorizedPropertyIds,
      submissionIds: submissions.map((s) => s._id.toString()),
      attributionClaimIds: claims.map((c) => c._id.toString()),
    };
  }

  /**
   * Asserts that the authenticated partner session owns the requested lead submission
   */
  public static async assertPartnerLeadAccess(
    session: PartnerSession,
    submissionId: string | Types.ObjectId
  ): Promise<PartnerScope> {
    const scope = await this.resolvePartnerScope(session);
    const targetSubmissionIdStr = submissionId.toString();

    if (!scope.submissionIds.includes(targetSubmissionIdStr)) {
      throw new Error("ACCESS_DENIED: You do not have permission to view or manage this lead submission.");
    }

    return scope;
  }

  /**
   * Asserts that the authenticated partner session owns the requested commission accrual
   */
  public static async assertPartnerCommissionAccess(
    session: PartnerSession,
    accrualId: string | Types.ObjectId
  ): Promise<PartnerScope> {
    const scope = await this.resolvePartnerScope(session);
    await connectToDatabase();

    const accrual = await CommissionAccrual.findById(accrualId).lean();
    if (!accrual || accrual.partnerId.toString() !== scope.partnerId) {
      throw new Error("ACCESS_DENIED: You do not have permission to view this commission record.");
    }

    return scope;
  }

  /**
   * Asserts that the authenticated partner session has access to market/view the property
   */
  public static async assertPartnerPropertyAccess(
    session: PartnerSession,
    propertyId: string | Types.ObjectId
  ): Promise<PartnerScope> {
    const scope = await this.resolvePartnerScope(session);
    const targetPropertyIdStr = propertyId.toString();

    if (!scope.authorizedPropertyIds.includes(targetPropertyIdStr)) {
      throw new Error("ACCESS_DENIED: Property is not authorized for your partner tier.");
    }

    return scope;
  }
}
