import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PaymentPlan, IPaymentPlan } from "@/models/PaymentPlan";
import { PaymentInstallment, IPaymentInstallment } from "@/models/PaymentInstallment";
import { Booking } from "@/models/Booking";
import { MoneyUtils } from "@/lib/utils/money";
import { logAuditEvent } from "@/lib/services/audit.service";
import { AdminSession } from "@/lib/auth/session";
import { InstallmentType, PaymentPlanStatus } from "@/types/payment";

export interface CreateInstallmentInput {
  installmentKey: string;
  type: InstallmentType;
  description: string;
  amountPaise: number;
  dueDate: Date | string;
  graceDate?: Date | string;
  milestoneReference?: string;
}

export interface CreatePaymentPlanInput {
  bookingId: string;
  currency?: string;
  totalConsiderationPaise: number;
  taxDisclaimer?: string;
  installments: CreateInstallmentInput[];
}

export class PaymentPlanService {
  /**
   * Generates next sequential payment plan number (e.g. RDE-PLN-000123)
   */
  public static async generatePlanNumber(): Promise<string> {
    await connectToDatabase();
    const count = await PaymentPlan.countDocuments();
    const sequence = (count + 1).toString().padStart(6, "0");
    return `RDE-PLN-${sequence}`;
  }

  /**
   * Creates a draft payment plan and its scheduled instalments
   */
  public static async createPlan(
    input: CreatePaymentPlanInput,
    session: AdminSession
  ): Promise<{ plan: IPaymentPlan; installments: IPaymentInstallment[] }> {
    await connectToDatabase();

    const booking = await Booking.findById(input.bookingId);
    if (!booking) {
      throw new Error("NOT_FOUND: Linked booking does not exist.");
    }

    if (booking.status === "CANCELLED") {
      throw new Error("INVALID_STATE: Cannot create a payment plan for a cancelled booking.");
    }

    MoneyUtils.assertValidMinorUnit(input.totalConsiderationPaise, "Total consideration");

    if (!input.installments || input.installments.length === 0) {
      throw new Error("VALIDATION_ERROR: Payment plan must contain at least one scheduled instalment.");
    }

    // Verify sum of instalments equals total consideration
    let totalCoveredPaise = 0;
    for (const inst of input.installments) {
      MoneyUtils.assertValidMinorUnit(inst.amountPaise, `Instalment ${inst.installmentKey}`);
      totalCoveredPaise = MoneyUtils.add(totalCoveredPaise, inst.amountPaise);
    }

    if (totalCoveredPaise !== input.totalConsiderationPaise) {
      throw new Error(
        `AMOUNT_MISMATCH: Sum of scheduled instalments (${MoneyUtils.format(totalCoveredPaise)}) does not equal total consideration (${MoneyUtils.format(input.totalConsiderationPaise)}).`
      );
    }

    // Determine plan version
    const existingPlansCount = await PaymentPlan.countDocuments({ bookingId: booking._id });
    const version = existingPlansCount + 1;
    const planNumber = await this.generatePlanNumber();

    const plan = await PaymentPlan.create({
      paymentPlanNumber: planNumber,
      bookingId: booking._id,
      reservationId: booking.reservationId,
      dealId: booking.dealId,
      propertyId: booking.propertyId,
      unitId: booking.unitId,
      offerId: booking.offerId,
      pricingSnapshotVersion: 1,
      currency: input.currency || "INR",
      totalConsiderationPaise: input.totalConsiderationPaise,
      totalAmountCoveredPaise: totalCoveredPaise,
      taxDisclaimer: input.taxDisclaimer,
      status: "DRAFT",
      version,
      createdBy: session.user.id,
      createdByName: session.user.name,
    });

    const installmentsToCreate = input.installments.map((inst, index) => ({
      planId: plan._id,
      bookingId: booking._id,
      sequence: index + 1,
      installmentKey: inst.installmentKey || `INST-${(index + 1).toString().padStart(2, "0")}`,
      type: inst.type,
      description: inst.description,
      currency: input.currency || "INR",
      originalAmountPaise: inst.amountPaise,
      adjustedAmountPaise: inst.amountPaise,
      paidAmountPaise: 0,
      refundedAmountPaise: 0,
      outstandingAmountPaise: inst.amountPaise,
      dueDate: new Date(inst.dueDate),
      graceDate: inst.graceDate ? new Date(inst.graceDate) : undefined,
      status: index === 0 ? "DUE" : "UPCOMING",
      milestoneReference: inst.milestoneReference,
      version: 1,
    }));

    const installments = await PaymentInstallment.insertMany(installmentsToCreate);

    await logAuditEvent({
      actor: session.user,
      action: "PAYMENT_PLAN_CREATED",
      targetPaymentPlanId: plan._id,
      targetPropertyId: booking.propertyId,
      targetUnitId: booking.unitId,
      reason: `Created Payment Plan ${plan.paymentPlanNumber} (v${version}) with ${installments.length} instalments.`,
    });

    return { plan, installments: installments as unknown as IPaymentInstallment[] };
  }

  /**
   * Approves and activates a payment plan.
   * Supersedes any previously active payment plan for the booking.
   */
  public static async activatePlan(
    planId: string,
    session: AdminSession
  ): Promise<IPaymentPlan> {
    await connectToDatabase();

    const plan = await PaymentPlan.findById(planId);
    if (!plan) {
      throw new Error("NOT_FOUND: Payment plan not found.");
    }

    if (plan.status === "ACTIVE") {
      return plan;
    }

    if (plan.status === "SUPERSEDED" || plan.status === "CANCELLED" || plan.status === "ARCHIVED") {
      throw new Error(`INVALID_STATE: Cannot activate plan in status ${plan.status}.`);
    }

    // Supersede previously active plans
    await PaymentPlan.updateMany(
      { bookingId: plan.bookingId, status: "ACTIVE", _id: { $ne: plan._id } },
      { $set: { status: "SUPERSEDED", supersededTimestamp: new Date() } }
    );

    plan.status = "ACTIVE";
    plan.approvedBy = session.user.id;
    plan.approvedByName = session.user.name;
    plan.approvalTimestamp = new Date();
    await plan.save();

    await logAuditEvent({
      actor: session.user,
      action: "PAYMENT_PLAN_APPROVED",
      targetPaymentPlanId: plan._id,
      reason: `Approved and activated Payment Plan ${plan.paymentPlanNumber} (v${plan.version}).`,
    });

    return plan;
  }

  /**
   * Fetches active payment plan and its instalments for a booking
   */
  public static async getActivePlanForBooking(bookingId: string) {
    await connectToDatabase();
    const plan = await PaymentPlan.findOne({
      bookingId: new Types.ObjectId(bookingId),
      status: "ACTIVE",
    }).lean();

    if (!plan) return null;

    const installments = await PaymentInstallment.find({ planId: plan._id })
      .sort({ sequence: 1 })
      .lean();

    return { plan, installments };
  }

  /**
   * Retrieves plan details by ID with instalments
   */
  public static async getPlanDetails(planId: string) {
    await connectToDatabase();
    const plan = await PaymentPlan.findById(planId)
      .populate("bookingId")
      .populate("propertyId", "title code")
      .populate("unitId", "unitNumber plotNumber areaSqFt")
      .lean();

    if (!plan) throw new Error("NOT_FOUND: Payment plan not found.");

    const installments = await PaymentInstallment.find({ planId: plan._id })
      .sort({ sequence: 1 })
      .lean();

    return { plan, installments };
  }

  /**
   * Lists payment plans with search and filters
   */
  public static async getPlans(params: {
    status?: PaymentPlanStatus | "ALL";
    propertyId?: string;
    bookingId?: string;
    page?: number;
    limit?: number;
  }) {
    await connectToDatabase();
    const query: Record<string, unknown> = {};

    if (params.status && params.status !== "ALL") {
      query.status = params.status;
    }
    if (params.propertyId) {
      query.propertyId = new Types.ObjectId(params.propertyId);
    }
    if (params.bookingId) {
      query.bookingId = new Types.ObjectId(params.bookingId);
    }

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const [plans, total] = await Promise.all([
      PaymentPlan.find(query)
        .populate("propertyId", "title code")
        .populate("unitId", "unitNumber plotNumber")
        .populate("bookingId", "bookingNumber status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PaymentPlan.countDocuments(query),
    ]);

    return {
      plans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
