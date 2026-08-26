import "server-only";

import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { MoneyUtils } from "@/lib/utils/money";
import { ChannelPartner } from "@/models/ChannelPartner";
import { PartnerPayoutProfile } from "@/models/PartnerPayoutProfile";
import { CommissionAccrual } from "@/models/CommissionAccrual";
import { CommissionPayout, ICommissionPayout } from "@/models/CommissionPayout";
import { PartnerStatement, IPartnerStatement } from "@/models/PartnerStatement";
import { PayoutMethod } from "@/types/commission";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";
import { logAuditEvent } from "@/lib/services/audit.service";

export interface CreatePayoutInput {
  partnerId: string;
  accrualIds: string[];
  payoutMethod?: PayoutMethod;
  actorId: string;
  actorName: string;
}

export class PartnerPayoutService {
  /**
   * Drafts a commission payout batch (Maker action)
   */
  public static async createPayoutDraft(input: CreatePayoutInput): Promise<ICommissionPayout> {
    await connectToDatabase();

    const partner = await ChannelPartner.findById(input.partnerId);
    if (!partner || partner.status !== "ACTIVE") {
      throw new Error("ACCESS_DENIED: Partner must be active to create a payout.");
    }

    const payoutProfile = await PartnerPayoutProfile.findOne({
      partnerId: partner._id,
      isCurrentActive: true,
      verificationStatus: "VERIFIED",
    });

    if (!payoutProfile) {
      throw new Error("COMPLIANCE_ERROR: Active, verified bank payout profile required.");
    }

    const accruals = await CommissionAccrual.find({
      _id: { $in: input.accrualIds.map((id) => new Types.ObjectId(id)) },
      partnerId: partner._id,
      status: { $in: ["APPROVED", "PAYABLE"] },
    });

    if (accruals.length === 0) {
      throw new Error("INVALID_SELECTION: No eligible approved or payable accruals selected.");
    }

    let grossAmountPaise = 0;
    let tdsWithheldPaise = 0;
    let gstAmountPaise = 0;
    let adjustmentsPaise = 0;
    let netPayoutPaise = 0;

    for (const acc of accruals) {
      grossAmountPaise = MoneyUtils.add(grossAmountPaise, acc.grossCommissionPaise);
      tdsWithheldPaise = MoneyUtils.add(tdsWithheldPaise, acc.tdsWithholdingPaise);
      gstAmountPaise = MoneyUtils.add(gstAmountPaise, acc.gstAmountPaise);
      adjustmentsPaise = MoneyUtils.add(adjustmentsPaise, acc.adjustedAmountPaise);
      netPayoutPaise = MoneyUtils.add(netPayoutPaise, acc.netPayablePaise);
    }

    const count = await CommissionPayout.countDocuments();
    const payoutNumber = `RDE-PO-${String(count + 1).padStart(6, "0")}`;
    const idempotencyKey = `po_${partner._id}_${Date.now()}`;

    const payout = await CommissionPayout.create({
      payoutNumber,
      partnerId: partner._id,
      payoutProfileId: payoutProfile._id,
      accrualIds: accruals.map((a) => a._id),
      currency: "INR",
      grossAmountPaise,
      tdsWithheldPaise,
      gstAmountPaise,
      adjustmentsPaise,
      netPayoutPaise,
      payoutMethod: input.payoutMethod || "BANK_TRANSFER_NEFT",
      status: "PENDING_APPROVAL",
      requestedBy: input.actorId,
      requestedByName: input.actorName,
      requestedAt: new Date(),
      idempotencyKey,
    });

    await logAuditEvent({
      actor: { id: input.actorId, role: "SUPER_ADMIN", email: "finance@ratiwaldreamestates.com", name: input.actorName, isActive: true },
      action: "COMMISSION_PAYOUT_INITIATED",
      targetPartnerId: partner._id,
      targetCommissionPayoutId: payout._id,
      reason: `Payout batch ${payoutNumber} drafted for ₹${MoneyUtils.minorToMajor(netPayoutPaise)}`,
    });

    return payout;
  }

  /**
   * Approves a commission payout (Checker action)
   */
  public static async approvePayout(params: {
    payoutId: string;
    actorId: string;
    actorName: string;
  }): Promise<ICommissionPayout> {
    await connectToDatabase();

    const payout = await CommissionPayout.findById(params.payoutId);
    if (!payout) {
      throw new Error("NOT_FOUND: Payout record not found.");
    }

    // Maker-checker enforcement
    if (payout.requestedBy === params.actorId) {
      throw new Error("MAKER_CHECKER_VIOLATION: Approver must be distinct from creator.");
    }

    payout.status = "APPROVED";
    payout.approvedBy = params.actorId;
    payout.approvedByName = params.actorName;
    payout.approvedAt = new Date();
    await payout.save();

    await logAuditEvent({
      actor: { id: params.actorId, role: "SUPER_ADMIN", email: "finance@ratiwaldreamestates.com", name: params.actorName, isActive: true },
      action: "COMMISSION_PAYOUT_APPROVED",
      targetPartnerId: payout.partnerId,
      targetCommissionPayoutId: payout._id,
      reason: `Payout ${payout.payoutNumber} approved by ${params.actorName}`,
    });

    return payout;
  }

  /**
   * Records completed payout with bank UTR reference
   */
  public static async processPayout(params: {
    payoutId: string;
    bankReferenceNumber: string;
    paymentProofDocumentKey?: string;
    actorId: string;
    actorName: string;
  }): Promise<ICommissionPayout> {
    await connectToDatabase();

    const payout = await CommissionPayout.findById(params.payoutId);
    if (!payout) {
      throw new Error("NOT_FOUND: Payout record not found.");
    }

    if (payout.status !== "APPROVED") {
      throw new Error("INVALID_STATE: Only approved payouts can be marked as processed.");
    }

    payout.status = "PROCESSED";
    payout.bankReferenceNumber = params.bankReferenceNumber.trim();
    payout.paymentProofDocumentKey = params.paymentProofDocumentKey;
    payout.processedBy = params.actorId;
    payout.processedByName = params.actorName;
    payout.processedAt = new Date();
    payout.reconciledAt = new Date();
    await payout.save();

    // Mark accruals as PAID
    await CommissionAccrual.updateMany(
      { _id: { $in: payout.accrualIds } },
      { $set: { status: "PAID", payoutId: payout._id, paidAmountPaise: payout.netPayoutPaise } }
    );

    // Enqueue outbox notification
    const partner = await ChannelPartner.findById(payout.partnerId);
    if (partner) {
      await CommunicationOutboxService.enqueueEvent({
        eventType: "PAYOUT_PROCESSED",
        aggregateType: "PAYMENT",
        aggregateId: payout._id.toString(),
        recipientType: "CUSTOMER",
        recipientEmail: partner.email,
        recipientName: partner.displayName,
        variables: {
          payoutNumber: payout.payoutNumber,
          netPayoutFormatted: MoneyUtils.formatINR(payout.netPayoutPaise),
          bankReferenceNumber: params.bankReferenceNumber,
          partnerName: partner.displayName,
        },
      });
    }

    await logAuditEvent({
      actor: { id: params.actorId, role: "SUPER_ADMIN", email: "finance@ratiwaldreamestates.com", name: params.actorName, isActive: true },
      action: "COMMISSION_PAYOUT_PROCESSED",
      targetPartnerId: payout.partnerId,
      targetCommissionPayoutId: payout._id,
      reason: `Payout ${payout.payoutNumber} processed with UTR ${params.bankReferenceNumber}`,
    });

    return payout;
  }

  /**
   * Generates a monthly statement for a partner
   */
  public static async generateStatement(params: {
    partnerId: string;
    periodStart: Date;
    periodEnd: Date;
    actorId: string;
    actorName: string;
  }): Promise<IPartnerStatement> {
    await connectToDatabase();

    const partner = await ChannelPartner.findById(params.partnerId);
    if (!partner) {
      throw new Error("NOT_FOUND: Channel partner not found.");
    }

    const accruals = await CommissionAccrual.find({
      partnerId: partner._id,
      createdAt: { $gte: params.periodStart, $lte: params.periodEnd },
    });

    const payouts = await CommissionPayout.find({
      partnerId: partner._id,
      status: "PROCESSED",
      processedAt: { $gte: params.periodStart, $lte: params.periodEnd },
    });

    let totalGross = 0;
    let totalTds = 0;
    let totalGst = 0;
    let totalAdj = 0;
    let totalNet = 0;

    for (const a of accruals) {
      totalGross = MoneyUtils.add(totalGross, a.grossCommissionPaise);
      totalTds = MoneyUtils.add(totalTds, a.tdsWithholdingPaise);
      totalGst = MoneyUtils.add(totalGst, a.gstAmountPaise);
      totalAdj = MoneyUtils.add(totalAdj, a.adjustedAmountPaise);
      totalNet = MoneyUtils.add(totalNet, a.netPayablePaise);
    }

    let totalPaid = 0;
    for (const p of payouts) {
      totalPaid = MoneyUtils.add(totalPaid, p.netPayoutPaise);
    }

    const count = await PartnerStatement.countDocuments();
    const statementNumber = `RDE-PSTM-${String(count + 1).padStart(6, "0")}`;

    const statement = await PartnerStatement.create({
      statementNumber,
      partnerId: partner._id,
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      currency: "INR",
      totalGrossCommissionPaise: totalGross,
      totalTdsWithheldPaise: totalTds,
      totalGstAmountPaise: totalGst,
      totalAdjustmentsPaise: totalAdj,
      totalNetPayablePaise: totalNet,
      totalPaidAmountPaise: totalPaid,
      closingOutstandingBalancePaise: MoneyUtils.subtract(totalNet, totalPaid, true),
      accrualCount: accruals.length,
      payoutCount: payouts.length,
      accrualIds: accruals.map((a) => a._id),
      payoutIds: payouts.map((p) => p._id),
      generatedAt: new Date(),
      generatedBy: params.actorId,
      generatedByName: params.actorName,
    });

    await logAuditEvent({
      actor: { id: params.actorId, role: "SUPER_ADMIN", email: "finance@ratiwaldreamestates.com", name: params.actorName, isActive: true },
      action: "STATEMENT_GENERATED",
      targetPartnerId: partner._id,
      targetPartnerStatementId: statement._id,
      reason: `Statement ${statementNumber} generated for ${partner.partnerCode}`,
    });

    return statement;
  }
}
