import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PaymentAllocation, IPaymentAllocation } from "@/models/PaymentAllocation";
import { PaymentInstallment } from "@/models/PaymentInstallment";
import { IPaymentTransaction } from "@/models/PaymentTransaction";
import { MoneyUtils } from "@/lib/utils/money";
import { AdminSession } from "@/lib/auth/session";

export class PaymentAllocationService {
  /**
   * Allocates a captured payment across unpaid/partially paid instalments (FIFO).
   * Transactional and idempotent.
   */
  public static async allocateCapturedPayment(params: {
    payment: IPaymentTransaction;
    planId?: string | Types.ObjectId;
    session?: AdminSession;
    actorId?: string;
    actorName?: string;
  }): Promise<IPaymentAllocation[]> {
    await connectToDatabase();

    const payment = params.payment;
    if (payment.status !== "CAPTURED") {
      throw new Error(`INVALID_STATE: Only CAPTURED payments can be allocated (current: ${payment.status}).`);
    }

    const availableToAllocatePaise = MoneyUtils.subtract(
      payment.capturedAmountPaise,
      payment.allocatedAmountPaise
    );

    if (availableToAllocatePaise <= 0) {
      return []; // Already fully allocated
    }

    // Load instalments in sequence order
    const query: Record<string, unknown> = {
      bookingId: payment.bookingId,
      status: { $in: ["UPCOMING", "DUE", "OVERDUE", "PARTIALLY_PAID"] },
    };

    if (params.planId) {
      query.planId = new Types.ObjectId(params.planId.toString());
    } else if (payment.planId) {
      query.planId = payment.planId;
    }

    const unpaidInstallments = await PaymentInstallment.find(query).sort({ sequence: 1 });

    let remainingFundsPaise = availableToAllocatePaise;
    const createdAllocations: IPaymentAllocation[] = [];

    for (const inst of unpaidInstallments) {
      if (remainingFundsPaise <= 0) break;

      const outstandingOnInstPaise = MoneyUtils.subtract(
        inst.adjustedAmountPaise,
        inst.paidAmountPaise
      );

      if (outstandingOnInstPaise <= 0) continue;

      const allocateForThisInstPaise = Math.min(remainingFundsPaise, outstandingOnInstPaise);

      // Create allocation record
      const allocation = await PaymentAllocation.create({
        paymentId: payment._id,
        bookingId: payment.bookingId,
        installmentId: inst._id,
        currency: payment.currency || "INR",
        allocatedAmountPaise: allocateForThisInstPaise,
        allocationType: "AUTOMATIC_FIFO",
        allocationSequence: createdAllocations.length + 1,
        allocatedBy: params.session?.user?.id || params.actorId || "SYSTEM",
        allocatedByName: params.session?.user?.name || params.actorName || "System Automation",
        allocatedAt: new Date(),
      });

      createdAllocations.push(allocation);

      // Update instalment paid & outstanding amounts
      inst.paidAmountPaise = MoneyUtils.add(inst.paidAmountPaise, allocateForThisInstPaise);
      inst.outstandingAmountPaise = MoneyUtils.subtract(
        inst.adjustedAmountPaise,
        inst.paidAmountPaise
      );

      if (inst.outstandingAmountPaise === 0) {
        inst.status = "PAID";
      } else {
        inst.status = "PARTIALLY_PAID";
      }

      await inst.save();

      remainingFundsPaise = MoneyUtils.subtract(remainingFundsPaise, allocateForThisInstPaise);
    }

    // Update payment allocatedAmountPaise
    const totalNewlyAllocatedPaise = MoneyUtils.subtract(
      availableToAllocatePaise,
      remainingFundsPaise
    );

    payment.allocatedAmountPaise = MoneyUtils.add(
      payment.allocatedAmountPaise,
      totalNewlyAllocatedPaise
    );
    await payment.save();

    return createdAllocations;
  }

  /**
   * Reverses payment allocations when a refund occurs
   */
  public static async reverseAllocationsForRefund(params: {
    paymentId: string | Types.ObjectId;
    refundAmountPaise: number;
    reason: string;
    session?: AdminSession;
  }): Promise<IPaymentAllocation[]> {
    await connectToDatabase();

    // Fetch existing active allocations in reverse order (LIFO reversal)
    const existingAllocations = await PaymentAllocation.find({
      paymentId: new Types.ObjectId(params.paymentId.toString()),
      isReversed: false,
      allocationType: { $ne: "REVERSAL" },
    }).sort({ allocationSequence: -1 });

    let remainingToReversePaise = params.refundAmountPaise;
    const reversalAllocations: IPaymentAllocation[] = [];

    for (const alloc of existingAllocations) {
      if (remainingToReversePaise <= 0) break;

      const reverseForThisAllocPaise = Math.min(
        remainingToReversePaise,
        alloc.allocatedAmountPaise
      );

      const reversal = await PaymentAllocation.create({
        paymentId: alloc.paymentId,
        bookingId: alloc.bookingId,
        installmentId: alloc.installmentId,
        currency: alloc.currency,
        allocatedAmountPaise: reverseForThisAllocPaise,
        allocationType: "REVERSAL",
        reversalOfAllocationId: alloc._id,
        isReversed: false,
        reversalReason: params.reason,
        allocatedBy: params.session?.user?.id || "SYSTEM",
        allocatedByName: params.session?.user?.name || "Refund Automation",
        allocatedAt: new Date(),
      });

      reversalAllocations.push(reversal);

      // Mark original allocation as reversed
      alloc.isReversed = true;
      alloc.reversalReason = params.reason;
      await alloc.save();

      // Update instalment paid/outstanding/refunded amounts
      const inst = await PaymentInstallment.findById(alloc.installmentId);
      if (inst) {
        inst.paidAmountPaise = MoneyUtils.subtract(inst.paidAmountPaise, reverseForThisAllocPaise);
        inst.refundedAmountPaise = MoneyUtils.add(inst.refundedAmountPaise, reverseForThisAllocPaise);
        inst.outstandingAmountPaise = MoneyUtils.subtract(
          inst.adjustedAmountPaise,
          inst.paidAmountPaise
        );

        if (inst.paidAmountPaise === 0) {
          inst.status = inst.refundedAmountPaise > 0 ? "REFUNDED" : "DUE";
        } else {
          inst.status = "PARTIALLY_REFUNDED";
        }
        await inst.save();
      }

      remainingToReversePaise = MoneyUtils.subtract(
        remainingToReversePaise,
        reverseForThisAllocPaise
      );
    }

    return reversalAllocations;
  }
}
