import "server-only";

import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { MoneyUtils } from "@/lib/utils/money";
import { Booking } from "@/models/Booking";
import { PaymentTransaction } from "@/models/PaymentTransaction";
import { ChannelPartner } from "@/models/ChannelPartner";
import { CommissionPlan, ICommissionPlan } from "@/models/CommissionPlan";
import { CommissionTaxRule } from "@/models/CommissionTaxRule";
import { CommissionAccrual, ICommissionAccrual } from "@/models/CommissionAccrual";
import { CommissionAdjustment, ICommissionAdjustment } from "@/models/CommissionAdjustment";
import { LeadAttributionClaim } from "@/models/LeadAttributionClaim";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";
import { logAuditEvent } from "@/lib/services/audit.service";

export interface CalculateCommissionResult {
  commissionBasePaise: number;
  grossCommissionPaise: number;
  tdsWithholdingPaise: number;
  gstAmountPaise: number;
  netPayablePaise: number;
  taxRuleId?: Types.ObjectId;
}

export class CommissionEngineService {
  /**
   * Deterministically calculates gross commission based on plan configuration
   */
  public static calculateGrossCommission(
    plan: ICommissionPlan,
    baseAmountPaise: number
  ): number {
    MoneyUtils.assertValidMinorUnit(baseAmountPaise, "Commission base amount");

    if (plan.calculationMethod === "FLAT_AMOUNT") {
      return plan.flatAmountPaise || 0;
    }

    if (plan.calculationMethod === "PERCENTAGE") {
      const pct = plan.defaultPercentage || 0;
      return MoneyUtils.percentageOf(baseAmountPaise, pct);
    }

    if (plan.calculationMethod === "SLAB" && plan.slabs && plan.slabs.length > 0) {
      let matchedRate = plan.defaultPercentage || 0;
      for (const slab of plan.slabs) {
        if (
          baseAmountPaise >= slab.minAmountPaise &&
          (!slab.maxAmountPaise || baseAmountPaise <= slab.maxAmountPaise)
        ) {
          matchedRate = slab.ratePercentage;
          break;
        }
      }
      return MoneyUtils.percentageOf(baseAmountPaise, matchedRate);
    }

    // Default fallback percentage
    return MoneyUtils.percentageOf(baseAmountPaise, plan.defaultPercentage || 0);
  }

  /**
   * Accrues commission on deal progression or milestone completion
   */
  public static async accrueBookingCommission(params: {
    bookingId: string;
    triggerMilestoneKey: string;
    actorId: string;
    actorName: string;
  }): Promise<ICommissionAccrual | null> {
    await connectToDatabase();

    const booking = await Booking.findById(params.bookingId);
    if (!booking || booking.status === "CANCELLED") {
      return null;
    }

    // 1. Find accepted attribution claim for this booking/lead
    const claim = await LeadAttributionClaim.findOne({
      $or: [{ bookingId: booking._id }, { leadId: booking.leadId }],
      status: "ACCEPTED",
    });

    if (!claim) {
      return null; // Direct sales lead without channel partner attribution
    }

    const partner = await ChannelPartner.findById(claim.partnerId);
    if (!partner || partner.status !== "ACTIVE") {
      return null; // Inactive partner
    }

    // 2. Fetch assigned commission plan
    const planId = partner.defaultCommissionPlanId;
    if (!planId) {
      return null;
    }

    const plan = await CommissionPlan.findById(planId);
    if (!plan || plan.status !== "ACTIVE") {
      return null;
    }

    // 3. Resolve commission base (e.g. Booking value or captured payments)
    let baseAmountPaise = booking.finalAmountPaise;
    if (plan.calculationBase === "CAPTURED_PAYMENT") {
      const capturedPayments = await PaymentTransaction.find({
        bookingId: booking._id,
        status: "CAPTURED",
      }).lean();
      baseAmountPaise = capturedPayments.reduce((acc, p) => MoneyUtils.add(acc, p.amountPaise), 0);
    }

    const grossCommissionPaise = this.calculateGrossCommission(plan, baseAmountPaise);
    if (grossCommissionPaise <= 0) {
      return null;
    }

    // 4. Resolve latest active tax rule
    const taxRule = await CommissionTaxRule.findOne({
      status: "ACTIVE",
      effectiveFrom: { $lte: new Date() },
      $or: [{ effectiveTo: { $exists: false } }, { effectiveTo: { $gte: new Date() } }],
    }).sort({ effectiveFrom: -1 });

    const tdsRate = taxRule ? taxRule.tdsRateStandardPercentage : 2.0;
    const tdsWithholdingPaise = MoneyUtils.percentageOf(grossCommissionPaise, tdsRate);
    const gstRate = taxRule ? taxRule.gstRatePercentage : 0;
    const gstAmountPaise = MoneyUtils.percentageOf(grossCommissionPaise, gstRate);

    const netPayablePaise = MoneyUtils.add(
      MoneyUtils.subtract(grossCommissionPaise, tdsWithholdingPaise),
      gstAmountPaise
    );

    // 5. Idempotent check
    const idempotencyKey = `acc_${booking._id}_${partner._id}_${params.triggerMilestoneKey}`;
    let accrual = await CommissionAccrual.findOne({ idempotencyKey });

    if (accrual) {
      return accrual; // Already accrued for this milestone
    }

    const count = await CommissionAccrual.countDocuments();
    const accrualNumber = `RDE-ACC-${String(count + 1).padStart(6, "0")}`;

    accrual = await CommissionAccrual.create({
      accrualNumber,
      partnerId: partner._id,
      bookingId: booking._id,
      dealId: booking.dealId,
      leadId: booking.leadId,
      submissionId: claim.submissionId,
      attributionClaimId: claim._id,
      commissionPlanId: plan._id,
      commissionPlanVersion: plan.version,
      taxRuleId: taxRule?._id,
      currency: booking.currency || "INR",
      commissionBasePaise: baseAmountPaise,
      grossCommissionPaise,
      tdsWithholdingPaise,
      gstAmountPaise,
      netPayablePaise,
      adjustedAmountPaise: 0,
      paidAmountPaise: 0,
      triggerMilestoneKey: params.triggerMilestoneKey,
      status: "APPROVED",
      eligibilityTimestamp: new Date(),
      idempotencyKey,
    });

    // Enqueue outbox notification
    await CommunicationOutboxService.enqueueEvent({
      eventType: "COMMISSION_APPROVED",
      aggregateType: "PAYMENT",
      aggregateId: accrual._id.toString(),
      recipientType: "CUSTOMER",
      recipientEmail: partner.email,
      recipientName: partner.displayName,
      variables: {
        accrualNumber,
        grossCommissionFormatted: MoneyUtils.formatINR(grossCommissionPaise),
        netPayableFormatted: MoneyUtils.formatINR(netPayablePaise),
        partnerName: partner.displayName,
      },
    });

    // Audit Log
    await logAuditEvent({
      actor: { id: params.actorId, role: "SUPER_ADMIN", email: "finance@ratiwaldreamestates.com", name: params.actorName, isActive: true },
      action: "COMMISSION_ACCRUED",
      targetPartnerId: partner._id,
      targetCommissionAccrualId: accrual._id,
      reason: `Commission accrued: ${accrualNumber} on milestone ${params.triggerMilestoneKey}`,
    });

    return accrual;
  }

  /**
   * Evaluates and applies clawback/reversals on refund or booking cancellation
   */
  public static async processRefundClawback(params: {
    bookingId: string;
    refundAmountPaise: number;
    reason: string;
    relatedRefundId?: string;
    actorId: string;
    actorName: string;
  }): Promise<ICommissionAdjustment | null> {
    await connectToDatabase();

    const accruals = await CommissionAccrual.find({
      bookingId: new Types.ObjectId(params.bookingId),
      status: { $in: ["APPROVED", "PAYABLE", "PAID", "PARTIALLY_PAID"] },
    });

    if (accruals.length === 0) {
      return null;
    }

    const primaryAccrual = accruals[0];
    const plan = await CommissionPlan.findById(primaryAccrual.commissionPlanId);

    if (!plan || !plan.clawbackOnRefund) {
      return null;
    }

    // Calculate clawback proportional to refund amount
    const clawbackGrossPaise = MoneyUtils.percentageOf(
      primaryAccrual.grossCommissionPaise,
      Math.min(100, (params.refundAmountPaise / primaryAccrual.commissionBasePaise) * 100)
    );

    if (clawbackGrossPaise <= 0) {
      return null;
    }

    const count = await CommissionAdjustment.countDocuments();
    const adjustmentNumber = `RDE-CADJ-${String(count + 1).padStart(6, "0")}`;

    const adjustment = await CommissionAdjustment.create({
      adjustmentNumber,
      accrualId: primaryAccrual._id,
      partnerId: primaryAccrual.partnerId,
      bookingId: primaryAccrual.bookingId,
      type: "CLAWBACK",
      currency: primaryAccrual.currency,
      amountPaise: clawbackGrossPaise,
      reasonCode: "REFUND_CLAWBACK",
      explanation: params.reason.trim(),
      relatedRefundId: params.relatedRefundId ? new Types.ObjectId(params.relatedRefundId) : undefined,
      status: "APPLIED",
      requestedBy: params.actorId,
      requestedByName: params.actorName,
      effectiveTimestamp: new Date(),
    });

    // Update accrual
    primaryAccrual.adjustedAmountPaise = MoneyUtils.add(
      primaryAccrual.adjustedAmountPaise,
      clawbackGrossPaise
    );
    primaryAccrual.netPayablePaise = MoneyUtils.subtract(
      primaryAccrual.netPayablePaise,
      clawbackGrossPaise,
      true
    );

    if (primaryAccrual.netPayablePaise <= primaryAccrual.paidAmountPaise) {
      primaryAccrual.status = "REVERSED";
    }

    await primaryAccrual.save();

    // Outbox notification
    const partner = await ChannelPartner.findById(primaryAccrual.partnerId);
    if (partner) {
      await CommunicationOutboxService.enqueueEvent({
        eventType: "COMMISSION_CLAWBACK_CREATED",
        aggregateType: "PAYMENT",
        aggregateId: adjustment._id.toString(),
        recipientType: "CUSTOMER",
        recipientEmail: partner.email,
        recipientName: partner.displayName,
        variables: {
          adjustmentNumber,
          clawbackAmountFormatted: MoneyUtils.formatINR(clawbackGrossPaise),
          partnerName: partner.displayName,
          reason: params.reason,
        },
      });
    }

    // Audit Log
    await logAuditEvent({
      actor: { id: params.actorId, role: "SUPER_ADMIN", email: "finance@ratiwaldreamestates.com", name: params.actorName, isActive: true },
      action: "COMMISSION_ADJUSTMENT_CREATED",
      targetPartnerId: primaryAccrual.partnerId,
      targetCommissionAccrualId: primaryAccrual._id,
      reason: `Clawback adjustment ${adjustmentNumber} applied: ₹${MoneyUtils.minorToMajor(clawbackGrossPaise)}`,
    });

    return adjustment;
  }
}
