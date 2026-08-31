import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PaymentReceipt, IPaymentReceipt } from "@/models/PaymentReceipt";
import { PaymentTransaction } from "@/models/PaymentTransaction";
import { PaymentAllocation } from "@/models/PaymentAllocation";

import { MoneyUtils } from "@/lib/utils/money";
import { logAuditEvent } from "@/lib/services/audit.service";
import { AdminSession } from "@/lib/auth/session";

export class PaymentReceiptService {
  /**
   * Generates next sequential receipt number (e.g. RDE-RCP-000123)
   */
  public static async generateReceiptNumber(): Promise<string> {
    await connectToDatabase();
    const count = await PaymentReceipt.countDocuments();
    const sequence = (count + 1).toString().padStart(6, "0");
    return `RDE-RCP-${sequence}`;
  }

  /**
   * Issues an immutable payment receipt upon captured/verified payment
   */
  public static async issueReceipt(params: {
    paymentId: string | Types.ObjectId;
    session?: AdminSession;
    actorId?: string;
    actorName?: string;
  }): Promise<IPaymentReceipt> {
    await connectToDatabase();

    const payment = await PaymentTransaction.findById(params.paymentId);
    if (!payment) {
      throw new Error("NOT_FOUND: Payment transaction not found.");
    }

    if (payment.status !== "CAPTURED") {
      throw new Error(`INVALID_STATE: Receipts can only be issued for CAPTURED payments (current: ${payment.status}).`);
    }

    // Check if receipt already issued for this payment
    const existingReceipt = await PaymentReceipt.findOne({
      paymentId: payment._id,
      receiptStatus: "ISSUED",
    });
    if (existingReceipt) {
      return existingReceipt;
    }

    // Collect allocations summary
    const allocations = await PaymentAllocation.find({
      paymentId: payment._id,
      allocationType: { $ne: "REVERSAL" },
      isReversed: false,
    }).populate("installmentId", "installmentKey description");

    const allocationSummary = allocations.map((a) => {
      const inst = a.installmentId as unknown as { installmentKey: string; description: string };
      return {
        installmentId: a.installmentId._id,
        installmentKey: inst?.installmentKey || "INST",
        installmentDescription: inst?.description || "Payment instalment",
        allocatedAmountPaise: a.allocatedAmountPaise,
      };
    });

    const receiptNumber = await this.generateReceiptNumber();
    const safeRef = payment.providerPaymentId
      ? `RZP-${payment.providerPaymentId.slice(-8)}`
      : payment.paymentNumber;

    const receipt = await PaymentReceipt.create({
      receiptNumber,
      paymentId: payment._id,
      bookingId: payment.bookingId,
      partyId: payment.partyId,
      currency: payment.currency || "INR",
      receivedAmountPaise: payment.capturedAmountPaise,
      allocations: allocationSummary,
      paymentMethod: payment.method,
      safePaymentReference: safeRef,
      paymentDate: payment.capturedAt || payment.paidAt || new Date(),
      receiptStatus: "ISSUED",
      issuedAt: new Date(),
      issuedBy: params.session?.user?.id || params.actorId || "SYSTEM",
      issuedByName: params.session?.user?.name || params.actorName || "System Issuance",
    });

    if (params.session) {
      await logAuditEvent({
        actor: params.session.user,
        action: "RECEIPT_ISSUED",
        targetReceiptId: receipt._id,
        targetPaymentId: payment._id,
        reason: `Issued official Payment Receipt ${receipt.receiptNumber} for ${MoneyUtils.format(receipt.receivedAmountPaise)}.`,
      });
    }

    return receipt;
  }

  /**
   * Voids an issued receipt with mandatory rationale
   */
  public static async voidReceipt(params: {
    receiptId: string;
    voidReason: string;
    session: AdminSession;
  }): Promise<IPaymentReceipt> {
    await connectToDatabase();

    const receipt = await PaymentReceipt.findById(params.receiptId);
    if (!receipt) throw new Error("NOT_FOUND: Receipt not found.");

    if (receipt.receiptStatus === "VOID") {
      return receipt;
    }

    receipt.receiptStatus = "VOID";
    receipt.voidReason = params.voidReason;
    receipt.voidedBy = params.session.user.id;
    receipt.voidedByName = params.session.user.name;
    receipt.voidedAt = new Date();
    await receipt.save();

    await logAuditEvent({
      actor: params.session.user,
      action: "RECEIPT_VOIDED",
      targetReceiptId: receipt._id,
      reason: `Voided Receipt ${receipt.receiptNumber}. Reason: ${params.voidReason}`,
    });

    return receipt;
  }

  /**
   * Generates institutional HTML preview document
   */
  public static async renderReceiptHtml(receiptId: string): Promise<string> {
    await connectToDatabase();

    const receipt = await PaymentReceipt.findById(receiptId)
      .populate("bookingId")
      .populate("partyId", "displayName partyType")
      .lean();

    if (!receipt) throw new Error("NOT_FOUND: Receipt not found.");

    const booking = receipt.bookingId as any;
    const party = receipt.partyId as any;

    const formattedAmount = MoneyUtils.format(receipt.receivedAmountPaise, receipt.currency);

    const allocationsHtml = receipt.allocations
      .map(
        (a) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-weight: 600; color: #071a28;">${a.installmentKey}</td>
        <td style="padding: 10px 12px; color: #4a5568;">${a.installmentDescription}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #071a28;">${MoneyUtils.format(a.allocatedAmountPaise, receipt.currency)}</td>
      </tr>
    `
      )
      .join("");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt — ${receipt.receiptNumber}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 40px; color: #071a28; background: #fff; line-height: 1.5; }
    .receipt-container { max-width: 750px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #071a28; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: bold; font-family: Georgia, serif; color: #071a28; }
    .brand-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #087fc3; margin-top: 2px; font-weight: bold; }
    .receipt-badge { background: #eaf5fa; color: #087fc3; padding: 6px 14px; border-radius: 8px; font-weight: bold; font-size: 13px; text-align: right; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; font-size: 13px; }
    .meta-box { background: #fbfaf8; border: 1px solid #edf2f7; border-radius: 12px; padding: 14px; }
    .meta-label { font-size: 11px; text-transform: uppercase; color: #718096; font-weight: bold; margin-bottom: 4px; }
    .meta-value { font-weight: 600; color: #071a28; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    th { background: #fbfaf8; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #718096; font-weight: bold; border-bottom: 1px solid #e2e8f0; }
    .total-box { display: flex; justify-content: space-between; align-items: center; background: #071a28; color: #fff; padding: 16px 20px; border-radius: 12px; margin-bottom: 24px; }
    .disclaimer { font-size: 11px; color: #718096; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div>
        <div class="brand">Ratiwal Dream Estates</div>
        <div class="brand-tag">Luxury Land Conveyance & Plotted Townships</div>
      </div>
      <div class="receipt-badge">
        OFFICIAL PAYMENT RECEIPT<br>
        <span style="font-size: 11px; font-weight: normal; color: #4a5568;">#${receipt.receiptNumber}</span>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <div class="meta-label">Customer / Purchasing Entity</div>
        <div class="meta-value">${party?.displayName || "Buyer Entity"}</div>
        <div style="font-size: 12px; color: #718096;">Booking: ${booking?.bookingNumber || "—"}</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Payment Acknowledgement</div>
        <div class="meta-value">Method: ${receipt.paymentMethod.replace(/_/g, " ")}</div>
        <div style="font-size: 12px; color: #718096;">Date: ${new Date(receipt.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Instalment Key</th>
          <th>Milestone Description</th>
          <th style="text-align: right;">Allocated Amount</th>
        </tr>
      </thead>
      <tbody>
        ${allocationsHtml}
      </tbody>
    </table>

    <div class="total-box">
      <span style="font-weight: bold; font-size: 14px;">TOTAL AMOUNT RECEIVED</span>
      <span style="font-size: 20px; font-weight: bold;">${formattedAmount}</span>
    </div>

    <div class="disclaimer">
      <strong>Statutory Disclaimer:</strong> ${receipt.disclaimerText}
      <br><br>
      <em>Ratiwal Dream Estates Private Limited • Registered Office: Jaipur, Rajasthan, India.</em>
    </div>
  </div>
</body>
</html>
    `;
  }
}
