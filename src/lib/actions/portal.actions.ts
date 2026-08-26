"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { getCustomerSession } from "@/lib/auth/customer-session";
import { PortalGuard } from "@/lib/auth/portal-guard";
import { Lead } from "@/models/Lead";
import { SiteVisit } from "@/models/SiteVisit";
import { PrivacyRequest } from "@/models/PrivacyRequest";
import { RefundRequest } from "@/models/RefundRequest";
import { PaymentTransaction } from "@/models/PaymentTransaction";
import { PortalSupportService } from "@/lib/services/portal-support.service";
import { logAuditEvent } from "@/lib/services/audit.service";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";
import { MoneyUtils } from "@/lib/utils/money";
import { RefundReasonCode } from "@/types/payment";
import { PrivacyRequestType } from "@/types/kyc";
import { SupportCategory, SupportPriority } from "@/types/portal";

/**
 * Customer requests a site visit
 */
export async function requestSiteVisitFromPortalAction(input: {
  propertyId: string;
  bookingId?: string;
  preferredDate: string;
  preferredTimeSlot: string;
  notes?: string;
}) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return { success: false, error: "UNAUTHORIZED: Please sign in." };
    }

    if (input.bookingId) {
      await PortalGuard.assertCustomerBookingAccess(session, input.bookingId);
    }

    await connectToDatabase();

    // Find or create lead for the customer
    let lead = await Lead.findOne({ normalizedEmail: session.user.email.toLowerCase() });
    if (!lead) {
      const phoneDigits = (session.user.phone || "+919876543210").replace(/\D/g, "");
      lead = await Lead.create({
        referenceNumber: `RDE-LD-${Date.now().toString(36).toUpperCase()}`,
        fullName: session.user.name || "Valued Customer",
        normalizedPhone: phoneDigits.length >= 10 ? `+91${phoneDigits.slice(-10)}` : "+919876543210",
        displayPhone: session.user.phone || "+91 98765 43210",
        normalizedEmail: session.user.email.toLowerCase(),
        displayEmail: session.user.email,
        preferredContactMethod: "EMAIL",
        status: "NEW",
        priority: "NORMAL",
        source: "OTHER",
        consentGranted: true,
        consentTextVersion: "1.0",
        privacyPolicyVersion: "1.0",
        consentPurpose: "Customer Portal Site Visit Booking",
        consentTimestamp: new Date(),
        consentSource: "PORTAL",
      });
    }

    const scheduledDate = new Date(`${input.preferredDate}T10:00:00.000Z`);
    if (scheduledDate.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
      return { success: false, error: "VALIDATION_ERROR: Cannot schedule a site visit in the past." };
    }

    const requestedStartAt = scheduledDate;
    const requestedEndAt = new Date(scheduledDate.getTime() + 60 * 60 * 1000);
    const referenceNumber = `RDE-SV-${Date.now().toString(36).toUpperCase()}`;

    const visit = await SiteVisit.create({
      referenceNumber,
      leadId: lead._id,
      propertyId: new Types.ObjectId(input.propertyId),
      requestedBy: "CUSTOMER",
      source: "PUBLIC_PROPERTY_PAGE",
      requestedStartAt,
      requestedEndAt,
      timezone: "Asia/Kolkata",
      durationMinutes: 60,
      bufferBeforeMinutes: 15,
      bufferAfterMinutes: 15,
      meetingMode: "IN_PERSON",
      visitorCount: 1,
      status: "REQUESTED",
      priority: "NORMAL",
      confirmationStatus: "UNCONFIRMED",
      timeline: [
        {
          eventType: "VISIT_REQUESTED",
          actorType: "CUSTOMER",
          summary: "Site visit requested via Customer Portal",
          occurredAt: new Date(),
        },
      ],
      notes: input.notes
        ? [
            {
              body: input.notes.trim(),
              authorId: session.user.id,
              authorEmail: session.user.email,
              authorName: session.user.name,
              createdAt: new Date(),
            },
          ]
        : [],
    });

    // Alert sales team
    await CommunicationOutboxService.enqueueEvent({
      eventType: "SITE_VISIT_REQUEST_RECEIVED_INTERNAL",
      aggregateType: "SITE_VISIT",
      aggregateId: visit._id.toString(),
      recipientType: "ADMIN_POOL",
      recipientEmail: "advisors@ratiwaldreamestates.com",
      recipientName: "Ratiwal Site Visit Desk",
      variables: {
        customerName: session.user.name,
        preferredDate: input.preferredDate,
        timeSlot: input.preferredTimeSlot,
      },
    });

    revalidatePath("/portal/site-visits");
    revalidatePath("/portal");
    return { success: true, visitId: visit._id.toString() };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Customer cancels an upcoming site visit
 */
export async function cancelSiteVisitFromPortalAction(visitId: string, reason?: string) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return { success: false, error: "UNAUTHORIZED: Please sign in." };
    }

    await connectToDatabase();
    const visit = await SiteVisit.findById(visitId);
    if (!visit) {
      return { success: false, error: "Site visit not found." };
    }

    visit.status = "CANCELLED";
    visit.cancellationReason = "CUSTOMER_REQUESTED";
    visit.cancellationNote = reason?.trim() || "Cancelled by customer via portal";
    visit.cancelledAt = new Date();
    await visit.save();

    revalidatePath("/portal/site-visits");
    revalidatePath("/portal");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Customer submits a support request
 */
export async function createSupportRequestAction(input: {
  subject: string;
  category: any;
  description: string;
  priority?: any;
  bookingId?: string;
}) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return { success: false, error: "UNAUTHORIZED: Please sign in." };
    }

    const ticket = await PortalSupportService.createSupportRequest(session, input);
    revalidatePath("/portal/support");
    revalidatePath("/portal");
    return { success: true, requestId: ticket._id.toString(), requestNumber: ticket.requestNumber };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Customer replies to an open support request
 */
export async function addSupportMessageAction(input: {
  requestId: string;
  message: string;
}) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return { success: false, error: "UNAUTHORIZED: Please sign in." };
    }

    const ticket = await PortalSupportService.addCustomerMessage(session, input.requestId, input.message);
    revalidatePath(`/portal/support/${input.requestId}`);
    return { success: true, requestId: ticket._id.toString() };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Customer submits a formal privacy or DPDP request
 */
export async function submitPrivacyRequestFromPortalAction(input: {
  requestType: "ACCESS" | "RECTIFICATION" | "ERASURE" | "CONSENT_WITHDRAWAL" | "GRIEVANCE";
  requestSummary: string;
}) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return { success: false, error: "UNAUTHORIZED: Please sign in." };
    }

    const scope = await PortalGuard.resolveCustomerScope(session);
    await connectToDatabase();

    const partyId = scope.partyIds[0];
    if (!partyId) {
      return { success: false, error: "Customer profile not linked." };
    }

    const mappedType: PrivacyRequestType =
      input.requestType === "RECTIFICATION" ? "CORRECTION" : (input.requestType as PrivacyRequestType);

    const count = await PrivacyRequest.countDocuments();
    const requestNumber = `RDE-PRQ-${String(count + 1).padStart(6, "0")}`;

    const req = await PrivacyRequest.create({
      requestNumber,
      partyId: new Types.ObjectId(partyId),
      requestType: mappedType,
      status: "RECEIVED",
      requesterEmailMasked: session.user.email
        ? session.user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
        : "cust***@ratiwal.com",
      identityVerificationMethod: "OTP_VERIFIED",
      requestDetails: input.requestSummary.trim(),
      receivedAt: new Date(),
      dueByDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Alert Data Protection Officer
    await CommunicationOutboxService.enqueueEvent({
      eventType: "PRIVACY_REQUEST_CREATED_INTERNAL",
      aggregateType: "USER",
      aggregateId: req._id.toString(),
      recipientType: "ADMIN_POOL",
      recipientEmail: "privacy@ratiwaldreamestates.com",
      recipientName: "Ratiwal Data Protection Officer",
      variables: {
        requestNumber,
        customerName: session.user.name,
        requestType: input.requestType,
      },
    });

    revalidatePath("/portal/privacy");
    return { success: true, requestNumber };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Customer submits a refund request for an eligible payment
 */
export async function submitRefundRequestFromPortalAction(input: {
  paymentId: string;
  reasonCode: RefundReasonCode;
  explanation: string;
  refundAmountRupees: number;
}) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return { success: false, error: "UNAUTHORIZED: Please sign in." };
    }

    await PortalGuard.assertCustomerPaymentAccess(session, input.paymentId);
    await connectToDatabase();

    const payment = await PaymentTransaction.findById(input.paymentId);
    if (!payment || payment.status !== "CAPTURED") {
      return { success: false, error: "Only successfully captured payments are eligible for refund requests." };
    }

    const requestedAmountPaise = MoneyUtils.toMinorUnits(input.refundAmountRupees);
    const maxRefundablePaise = MoneyUtils.subtract(
      payment.capturedAmountPaise || payment.amountPaise,
      payment.refundedAmountPaise || 0
    );

    if (requestedAmountPaise <= 0 || requestedAmountPaise > maxRefundablePaise) {
      return {
        success: false,
        error: `Requested refund amount exceeds maximum eligible balance of ₹${MoneyUtils.toMajorUnits(maxRefundablePaise).toLocaleString("en-IN")}.`,
      };
    }

    const count = await RefundRequest.countDocuments();
    const requestNumber = `RDE-RRQ-${String(count + 1).padStart(6, "0")}`;

    const refundReq = await RefundRequest.create({
      requestNumber,
      bookingId: payment.bookingId,
      partyId: payment.partyId,
      paymentId: payment._id,
      currency: "INR",
      reasonCode: input.reasonCode,
      explanation: input.explanation.trim(),
      requestedAmountPaise,
      status: "SUBMITTED",
      requestedBy: session.user.id,
      requestedByName: session.user.name,
      idempotencyKey: `ref_req_${payment._id}_${Date.now()}`,
    });

    // Alert finance team
    await CommunicationOutboxService.enqueueEvent({
      eventType: "REFUND_REQUESTED_INTERNAL",
      aggregateType: "PAYMENT",
      aggregateId: refundReq._id.toString(),
      recipientType: "ADMIN_POOL",
      recipientEmail: "finance@ratiwaldreamestates.com",
      recipientName: "Ratiwal Finance Desk",
      variables: {
        requestNumber,
        customerName: session.user.name,
        amountFormatted: MoneyUtils.formatINR(requestedAmountPaise),
        reasonCode: input.reasonCode,
      },
    });

    revalidatePath("/portal/refunds");
    revalidatePath("/portal/payments");
    return { success: true, requestNumber };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
