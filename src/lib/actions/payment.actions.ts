"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { PermissionService } from "@/lib/services/permission.service";
import { PaymentPlanService, CreatePaymentPlanInput } from "@/lib/services/payment-plan.service";
import { PaymentTransactionService, CreatePaymentOrderInput, VerifyCheckoutReturnInput } from "@/lib/services/payment-transaction.service";
import { ManualPaymentService, SubmitManualPaymentInput } from "@/lib/services/manual-payment.service";
import { PaymentReceiptService } from "@/lib/services/payment-receipt.service";
import { RefundService, CreateRefundRequestInput } from "@/lib/services/refund.service";
import { PaymentReconciliationService } from "@/lib/services/payment-reconciliation.service";

export interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Server Action: Create Draft Payment Plan
 */
export async function createPaymentPlanAction(input: CreatePaymentPlanInput): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, message: "UNAUTHORIZED: Session expired." };

    const hasPerm = await PermissionService.userHasPermission(session.user, "PAYMENTS_CREATE");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return { success: false, message: "FORBIDDEN: Insufficient permissions to create payment plans." };
    }

    const result = await PaymentPlanService.createPlan(input, session);
    revalidatePath("/dashboard/payment-plans");
    revalidatePath(`/dashboard/bookings/${input.bookingId}`);

    return {
      success: true,
      message: `Created payment plan ${result.plan.paymentPlanNumber} with ${result.installments.length} instalments.`,
      data: { planId: result.plan._id.toString() },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to create payment plan." };
  }
}

/**
 * Server Action: Approve and Activate Payment Plan
 */
export async function activatePaymentPlanAction(planId: string): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, message: "UNAUTHORIZED: Session expired." };

    const hasPerm = await PermissionService.userHasPermission(session.user, "PAYMENTS_APPROVE_PLAN");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return { success: false, message: "FORBIDDEN: Insufficient permissions to approve payment plans." };
    }

    const plan = await PaymentPlanService.activatePlan(planId, session);
    revalidatePath("/dashboard/payment-plans");
    revalidatePath(`/dashboard/payment-plans/${planId}`);

    return {
      success: true,
      message: `Payment Plan ${plan.paymentPlanNumber} (v${plan.version}) is now ACTIVE.`,
      data: { planId: plan._id.toString() },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to activate payment plan." };
  }
}

/**
 * Server Action: Create Payment Order
 */
export async function createPaymentOrderAction(input: CreatePaymentOrderInput): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    const result = await PaymentTransactionService.createPaymentOrder(input, session || undefined);

    return {
      success: true,
      message: `Created payment order for ${result.checkoutConfig.amount} paise.`,
      data: result,
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to initiate payment." };
  }
}

/**
 * Server Action: Process Checkout Return / Verify Signature
 */
export async function processCheckoutReturnAction(input: VerifyCheckoutReturnInput): Promise<ActionResponse> {
  try {
    const result = await PaymentTransactionService.processCheckoutReturn(input);
    revalidatePath("/dashboard/payments");
    revalidatePath("/dashboard/receipts");

    return {
      success: true,
      message: "Payment signature verified and payment captured successfully.",
      data: {
        paymentNumber: result.payment.paymentNumber,
        receiptNumber: result.receipt?.receiptNumber,
      },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Payment verification failed." };
  }
}

/**
 * Server Action: Submit Offline Manual Payment
 */
export async function submitManualPaymentAction(input: SubmitManualPaymentInput): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, message: "UNAUTHORIZED: Session expired." };

    const hasPerm = await PermissionService.userHasPermission(session.user, "PAYMENTS_CREATE");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return { success: false, message: "FORBIDDEN: Insufficient permissions to record payments." };
    }

    const submission = await ManualPaymentService.submitManualPayment(input, session);
    revalidatePath("/dashboard/manual-payments");
    revalidatePath(`/dashboard/bookings/${input.bookingId}`);

    return {
      success: true,
      message: `Offline payment submission ${submission.submissionNumber} logged for review.`,
      data: { submissionId: submission._id.toString() },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to record manual payment." };
  }
}

/**
 * Server Action: Review / Verify Offline Manual Payment
 */
export async function reviewManualPaymentAction(params: {
  submissionId: string;
  decision: "VERIFY" | "REJECT" | "ACTION_REQUIRED";
  rejectionReason?: string;
  actionRequiredReason?: string;
  verificationNotes?: string;
}): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, message: "UNAUTHORIZED: Session expired." };

    const hasPerm = await PermissionService.userHasPermission(session.user, "PAYMENTS_VERIFY_MANUAL");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return { success: false, message: "FORBIDDEN: Insufficient permissions to verify manual payments." };
    }

    const result = await ManualPaymentService.reviewManualPayment({ ...params, session });
    revalidatePath("/dashboard/manual-payments");
    revalidatePath("/dashboard/payments");
    revalidatePath("/dashboard/receipts");

    return {
      success: true,
      message: `Manual payment submission ${params.decision.toLowerCase()}ed successfully.`,
      data: result,
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to review manual payment." };
  }
}

/**
 * Server Action: Create Refund Request
 */
export async function createRefundRequestAction(input: CreateRefundRequestInput): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, message: "UNAUTHORIZED: Session expired." };

    const hasPerm = await PermissionService.userHasPermission(session.user, "PAYMENTS_CREATE");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return { success: false, message: "FORBIDDEN: Insufficient permissions to request refunds." };
    }

    const req = await RefundService.createRefundRequest(input, session);
    revalidatePath("/dashboard/refunds");

    return {
      success: true,
      message: `Refund request ${req.requestNumber} created successfully.`,
      data: { requestId: req._id.toString() },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to create refund request." };
  }
}

/**
 * Server Action: Approve & Execute Refund
 */
export async function approveAndExecuteRefundAction(requestId: string): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, message: "UNAUTHORIZED: Session expired." };

    const hasPerm = await PermissionService.userHasPermission(session.user, "PAYMENTS_REFUND_MANAGE");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return { success: false, message: "FORBIDDEN: Insufficient permissions to approve refunds." };
    }

    const result = await RefundService.approveAndExecuteRefund({ requestId, session });
    revalidatePath("/dashboard/refunds");
    revalidatePath("/dashboard/payments");

    return {
      success: true,
      message: `Refund ${result.refundExecution.refundNumber} executed successfully (${result.refundExecution.status}).`,
      data: result,
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to execute refund." };
  }
}

/**
 * Server Action: Void Receipt
 */
export async function voidReceiptAction(params: {
  receiptId: string;
  voidReason: string;
}): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, message: "UNAUTHORIZED: Session expired." };

    const hasPerm = await PermissionService.userHasPermission(session.user, "PAYMENTS_MANAGE");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return { success: false, message: "FORBIDDEN: Insufficient permissions to void receipts." };
    }

    const receipt = await PaymentReceiptService.voidReceipt({ ...params, session });
    revalidatePath("/dashboard/receipts");

    return {
      success: true,
      message: `Receipt ${receipt.receiptNumber} voided.`,
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Failed to void receipt." };
  }
}

/**
 * Server Action: Run Payment Reconciliation
 */
export async function runPaymentReconciliationAction(): Promise<ActionResponse> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, message: "UNAUTHORIZED: Session expired." };

    const hasPerm = await PermissionService.userHasPermission(session.user, "PAYMENTS_RECONCILE");
    if (!hasPerm && session.user.role !== "SUPER_ADMIN") {
      return { success: false, message: "FORBIDDEN: Insufficient permissions to run reconciliation." };
    }

    const result = await PaymentReconciliationService.runReconciliation(session);
    revalidatePath("/dashboard/payments/reconciliation");

    return {
      success: true,
      message: `Reconciliation completed. ${result.totalScanned} records audited, ${result.anomalies.length} anomalies detected.`,
      data: result,
    };
  } catch (error) {
    return { success: false, message: (error as Error).message || "Reconciliation failed." };
  }
}
