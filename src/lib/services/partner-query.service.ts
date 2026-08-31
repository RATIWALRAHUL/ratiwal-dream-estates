import "server-only";

import { connectToDatabase } from "@/lib/db/mongoose";
import { PartnerSession } from "@/types/partner";
import { PartnerGuard } from "@/lib/auth/partner-guard";
import { ChannelPartner } from "@/models/ChannelPartner";
import { PartnerAccount } from "@/models/PartnerAccount";
import { PartnerReraRegistration } from "@/models/PartnerReraRegistration";
import { PartnerTaxProfile } from "@/models/PartnerTaxProfile";
import { PartnerPayoutProfile } from "@/models/PartnerPayoutProfile";
import { PartnerAgreement } from "@/models/PartnerAgreement";
import { PartnerPropertyAccess } from "@/models/PartnerPropertyAccess";
import { PartnerLeadSubmission } from "@/models/PartnerLeadSubmission";
import { CommissionAccrual } from "@/models/CommissionAccrual";

import { PartnerStatement } from "@/models/PartnerStatement";

import { MoneyUtils } from "@/lib/utils/money";

export class PartnerQueryService {
  /**
   * Retrieves partner dashboard overview metrics and recent activity
   */
  public static async getPartnerPortalOverview(session: PartnerSession) {
    const scope = await PartnerGuard.resolvePartnerScope(session);
    await connectToDatabase();

    const partner = await ChannelPartner.findById(scope.partnerId).lean();
    const rera = await PartnerReraRegistration.findOne({ partnerId: scope.partnerId }).lean();
    const tax = await PartnerTaxProfile.findOne({ partnerId: scope.partnerId }).lean();
    const payoutProfile = await PartnerPayoutProfile.findOne({
      partnerId: scope.partnerId,
      isCurrentActive: true,
    }).lean();

    // 1. Authorized Properties
    const propertyGrants = await PartnerPropertyAccess.find({
      partnerId: scope.partnerId,
      isActive: true,
    }).populate("propertyId", "title slug priceStartingFromPaise plotSizesAvailable primaryImage").lean();

    // 2. Safe Leads summary
    const submissions = await PartnerLeadSubmission.find({
      partnerId: scope.partnerId,
    })
      .populate("propertyId", "title")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const totalLeadsCount = await PartnerLeadSubmission.countDocuments({ partnerId: scope.partnerId });

    // 3. Commission summary
    const accruals = await CommissionAccrual.find({
      partnerId: scope.partnerId,
    }).lean();

    let estimatedGrossPaise = 0;
    let approvedPayablePaise = 0;
    let totalPaidPaise = 0;

    for (const a of accruals) {
      if (a.status === "ESTIMATED" || a.status === "PENDING_ELIGIBILITY") {
        estimatedGrossPaise = MoneyUtils.add(estimatedGrossPaise, a.grossCommissionPaise);
      } else if (a.status === "APPROVED" || a.status === "PAYABLE") {
        approvedPayablePaise = MoneyUtils.add(approvedPayablePaise, a.netPayablePaise);
      } else if (a.status === "PAID") {
        totalPaidPaise = MoneyUtils.add(totalPaidPaise, a.paidAmountPaise);
      }
    }

    return {
      partner,
      compliance: {
        status: partner?.complianceStatus || partner?.status,
        isReraVerified: rera?.status === "OFFICIAL_SOURCE_VERIFIED" || rera?.status === "INTERNALLY_REVIEWED",
        isTaxVerified: tax?.reviewStatus === "VERIFIED",
        isBankVerified: payoutProfile?.verificationStatus === "VERIFIED",
      },
      stats: {
        totalLeadsCount,
        authorizedPropertiesCount: propertyGrants.length,
        estimatedGrossPaise,
        approvedPayablePaise,
        totalPaidPaise,
        estimatedGrossFormatted: MoneyUtils.formatINR(estimatedGrossPaise),
        approvedPayableFormatted: MoneyUtils.formatINR(approvedPayablePaise),
        totalPaidFormatted: MoneyUtils.formatINR(totalPaidPaise),
      },
      recentLeads: submissions.map((s: any) => ({
        id: s._id.toString(),
        submissionNumber: s.submissionNumber,
        propertyTitle: s.propertyId?.title || "Exclusive Estate",
        clientNameMasked: s.clientNameMasked,
        clientPhoneMasked: s.clientPhoneMasked,
        status: s.safeStatusForPartner,
        investmentIntent: s.investmentIntent,
        submittedAt: s.submittedAt ? s.submittedAt.toISOString() : s.createdAt.toISOString(),
      })),
      properties: propertyGrants.map((g: any) => ({
        id: g.propertyId?._id?.toString(),
        title: g.propertyId?.title,
        slug: g.propertyId?.slug,
        priceStartingFromPaise: g.propertyId?.priceStartingFromPaise,
        priceFormatted: MoneyUtils.formatINR(g.propertyId?.priceStartingFromPaise || 0),
        accessLevel: g.accessLevel,
      })),
    };
  }

  /**
   * Retrieves partner lead list with safe masked details
   */
  public static async getPartnerLeads(session: PartnerSession) {
    const scope = await PartnerGuard.resolvePartnerScope(session);
    await connectToDatabase();

    const submissions = await PartnerLeadSubmission.find({
      partnerId: scope.partnerId,
    })
      .populate("propertyId", "title")
      .sort({ createdAt: -1 })
      .lean();

    return submissions.map((s: any) => ({
      id: s._id.toString(),
      submissionNumber: s.submissionNumber,
      propertyTitle: s.propertyId?.title || "Property",
      propertyId: s.propertyId?._id?.toString(),
      clientNameMasked: s.clientNameMasked,
      clientPhoneMasked: s.clientPhoneMasked,
      clientEmailMasked: s.clientEmailMasked,
      budgetBand: s.budgetBand,
      investmentIntent: s.investmentIntent,
      notes: s.notes,
      status: s.safeStatusForPartner,
      submittedAt: s.submittedAt ? s.submittedAt.toISOString() : s.createdAt.toISOString(),
      attributionExpiryDate: s.attributionExpiryDate?.toISOString(),
    }));
  }

  /**
   * Retrieves partner commissions ledger
   */
  public static async getPartnerCommissions(session: PartnerSession) {
    const scope = await PartnerGuard.resolvePartnerScope(session);
    await connectToDatabase();

    const accruals = await CommissionAccrual.find({
      partnerId: scope.partnerId,
    })
      .populate("bookingId", "bookingNumber")
      .sort({ createdAt: -1 })
      .lean();

    return accruals.map((a: any) => ({
      id: a._id.toString(),
      accrualNumber: a.accrualNumber,
      bookingNumber: a.bookingId?.bookingNumber || "RDE-BKG-PENDING",
      triggerMilestoneKey: a.triggerMilestoneKey,
      grossCommissionPaise: a.grossCommissionPaise,
      tdsWithholdingPaise: a.tdsWithholdingPaise,
      gstAmountPaise: a.gstAmountPaise,
      adjustedAmountPaise: a.adjustedAmountPaise,
      netPayablePaise: a.netPayablePaise,
      paidAmountPaise: a.paidAmountPaise,
      status: a.status,
      grossFormatted: MoneyUtils.formatINR(a.grossCommissionPaise),
      tdsFormatted: MoneyUtils.formatINR(a.tdsWithholdingPaise),
      gstFormatted: MoneyUtils.formatINR(a.gstAmountPaise),
      netFormatted: MoneyUtils.formatINR(a.netPayablePaise),
      paidFormatted: MoneyUtils.formatINR(a.paidAmountPaise),
      createdAt: a.createdAt.toISOString(),
    }));
  }

  /**
   * Retrieves partner statements
   */
  public static async getPartnerStatements(session: PartnerSession) {
    const scope = await PartnerGuard.resolvePartnerScope(session);
    await connectToDatabase();

    const statements = await PartnerStatement.find({
      partnerId: scope.partnerId,
    })
      .sort({ periodStart: -1 })
      .lean();

    return statements.map((st: any) => ({
      id: st._id.toString(),
      statementNumber: st.statementNumber,
      periodStart: st.periodStart.toISOString(),
      periodEnd: st.periodEnd.toISOString(),
      totalGrossFormatted: MoneyUtils.formatINR(st.totalGrossCommissionPaise),
      totalTdsFormatted: MoneyUtils.formatINR(st.totalTdsWithheldPaise),
      totalGstFormatted: MoneyUtils.formatINR(st.totalGstAmountPaise),
      totalNetFormatted: MoneyUtils.formatINR(st.totalNetPayablePaise),
      totalPaidFormatted: MoneyUtils.formatINR(st.totalPaidAmountPaise),
      closingOutstandingFormatted: MoneyUtils.formatINR(st.closingOutstandingBalancePaise),
      accrualCount: st.accrualCount,
      payoutCount: st.payoutCount,
      generatedAt: st.generatedAt.toISOString(),
    }));
  }

  /**
   * Retrieves full partner profile
   */
  public static async getPartnerProfile(session: PartnerSession) {
    const scope = await PartnerGuard.resolvePartnerScope(session);
    await connectToDatabase();

    const partner = await ChannelPartner.findById(scope.partnerId).lean();
    const account = await PartnerAccount.findById(scope.accountId).lean();
    const rera = await PartnerReraRegistration.findOne({ partnerId: scope.partnerId }).lean();
    const tax = await PartnerTaxProfile.findOne({ partnerId: scope.partnerId }).lean();
    const payout = await PartnerPayoutProfile.findOne({
      partnerId: scope.partnerId,
      isCurrentActive: true,
    }).lean();
    const agreement = await PartnerAgreement.findOne({ partnerId: scope.partnerId }).lean();

    return {
      partner,
      account: {
        id: account?._id?.toString(),
        name: account?.name,
        email: account?.email,
        phone: account?.phone,
        notificationPreferences: account?.notificationPreferences,
      },
      reraRegistration: rera ? {
        id: rera._id.toString(),
        stateAuthority: rera.stateAuthority,
        registrationNumberMasked: rera.registrationNumberMasked,
        status: rera.status,
        verificationMethod: rera.verificationMethod,
        expiryDate: rera.expiryDate?.toISOString(),
      } : null,
      taxProfile: tax ? {
        id: tax._id.toString(),
        taxCategory: tax.taxCategory,
        panMasked: tax.panMasked,
        gstinMasked: tax.gstinMasked,
        gstApplicable: tax.gstApplicable,
        reviewStatus: tax.reviewStatus,
      } : null,
      payoutProfile: payout ? {
        id: payout._id.toString(),
        beneficiaryName: payout.beneficiaryName,
        bankName: payout.bankName,
        accountNumberMasked: payout.accountNumberMasked,
        ifscCode: payout.ifscCode,
        verificationStatus: payout.verificationStatus,
      } : null,
      agreement: agreement ? {
        id: agreement._id.toString(),
        agreementNumber: agreement.agreementNumber,
        templateVersion: agreement.templateVersion,
        status: agreement.status,
        effectiveDate: agreement.effectiveDate?.toISOString(),
      } : null,
    };
  }
}
