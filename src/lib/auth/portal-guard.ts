import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CustomerPortalAccess } from "@/models/CustomerPortalAccess";
import { CustomerParty } from "@/models/CustomerParty";
import { Booking } from "@/models/Booking";
import { CustomerKycCase } from "@/models/CustomerKycCase";
import { PaymentTransaction } from "@/models/PaymentTransaction";
import { CustomerSupportRequest } from "@/models/CustomerSupportRequest";
import { CustomerSession, CustomerScope, PortalAccessRole } from "@/types/portal";

export class PortalGuard {
  /**
   * Resolves the full customer authorization scope derived from their session
   */
  public static async resolveCustomerScope(session: CustomerSession): Promise<CustomerScope> {
    await connectToDatabase();

    const accountObjectId = new Types.ObjectId(session.user.id);
    const accessRecords = await CustomerPortalAccess.find({
      accountId: accountObjectId,
      status: "ACTIVE",
    }).lean();

    const partyIds: string[] = [];
    const bookingIdSet = new Set<string>();
    const applicantIdSet = new Set<string>();
    const accessRoles: Record<string, PortalAccessRole> = {};

    for (const access of accessRecords) {
      const pId = access.partyId.toString();
      partyIds.push(pId);
      accessRoles[pId] = access.accessRole;

      if (access.bookingIds && access.bookingIds.length > 0) {
        for (const bId of access.bookingIds) {
          bookingIdSet.add(bId.toString());
        }
      }

      if (access.applicantIds && access.applicantIds.length > 0) {
        for (const aId of access.applicantIds) {
          applicantIdSet.add(aId.toString());
        }
      }
    }

    // Also find any bookings directly mapped to these customer parties
    if (partyIds.length > 0) {
      const partyObjectIds = partyIds.map((id) => new Types.ObjectId(id));
      const partyRecords = await CustomerParty.find({
        _id: { $in: partyObjectIds },
        status: "ACTIVE",
      }).lean();

      for (const p of partyRecords) {
        if (p.bookingIds && p.bookingIds.length > 0) {
          for (const bId of p.bookingIds) {
            bookingIdSet.add(bId.toString());
          }
        }
      }

      // Also query bookings where customerPartyId is in partyObjectIds
      const directBookings = await Booking.find({
        customerPartyId: { $in: partyObjectIds },
        operationalStatus: { $ne: "CANCELLED" },
      })
        .select("_id")
        .lean();

      for (const b of directBookings) {
        bookingIdSet.add(b._id.toString());
      }
    }

    return {
      accountId: session.user.id,
      partyIds,
      bookingIds: Array.from(bookingIdSet),
      applicantIds: Array.from(applicantIdSet),
      accessRoles,
    };
  }

  /**
   * Asserts that the authenticated customer session owns or has explicit access to a booking
   */
  public static async assertCustomerBookingAccess(
    session: CustomerSession,
    bookingId: string | Types.ObjectId
  ): Promise<CustomerScope> {
    const scope = await this.resolveCustomerScope(session);
    const targetBookingIdStr = bookingId.toString();

    if (!scope.bookingIds.includes(targetBookingIdStr)) {
      // Double check active portal access record
      await connectToDatabase();
      const directAccess = await CustomerPortalAccess.findOne({
        accountId: new Types.ObjectId(session.user.id),
        bookingIds: new Types.ObjectId(targetBookingIdStr),
        status: "ACTIVE",
      }).lean();

      if (!directAccess) {
        throw new Error("ACCESS_DENIED: You do not have permission to view or manage this booking.");
      }
    }

    return scope;
  }

  /**
   * Asserts that the authenticated customer session owns or is linked to the KYC case
   */
  public static async assertCustomerKycAccess(
    session: CustomerSession,
    caseId: string | Types.ObjectId
  ): Promise<CustomerScope> {
    const scope = await this.resolveCustomerScope(session);
    await connectToDatabase();

    const kycCase = await CustomerKycCase.findById(caseId).lean();
    if (!kycCase) {
      throw new Error("NOT_FOUND: KYC case not found.");
    }

    const partyIdStr = kycCase.partyId?.toString();
    const bookingIdStr = kycCase.bookingId?.toString();

    const hasPartyAccess = partyIdStr && scope.partyIds.includes(partyIdStr);
    const hasBookingAccess = bookingIdStr && scope.bookingIds.includes(bookingIdStr);

    if (!hasPartyAccess && !hasBookingAccess) {
      throw new Error("ACCESS_DENIED: You do not have permission to view this KYC case.");
    }

    return scope;
  }

  /**
   * Asserts that the authenticated customer session owns the payment transaction
   */
  public static async assertCustomerPaymentAccess(
    session: CustomerSession,
    paymentId: string | Types.ObjectId
  ): Promise<CustomerScope> {
    const scope = await this.resolveCustomerScope(session);
    await connectToDatabase();

    const payment = await PaymentTransaction.findById(paymentId).lean();
    if (!payment) {
      throw new Error("NOT_FOUND: Payment record not found.");
    }

    const bookingIdStr = payment.bookingId?.toString();
    const partyIdStr = payment.partyId?.toString();

    const hasBooking = bookingIdStr && scope.bookingIds.includes(bookingIdStr);
    const hasParty = partyIdStr && scope.partyIds.includes(partyIdStr);

    if (!hasBooking && !hasParty) {
      throw new Error("ACCESS_DENIED: You do not have permission to view this payment.");
    }

    return scope;
  }

  /**
   * Asserts that the authenticated customer session owns the support ticket
   */
  public static async assertCustomerSupportAccess(
    session: CustomerSession,
    requestId: string | Types.ObjectId
  ): Promise<CustomerScope> {
    const scope = await this.resolveCustomerScope(session);
    await connectToDatabase();

    const supportReq = await CustomerSupportRequest.findById(requestId).lean();
    if (!supportReq) {
      throw new Error("NOT_FOUND: Support request not found.");
    }

    if (supportReq.accountId.toString() !== session.user.id) {
      throw new Error("ACCESS_DENIED: You do not have permission to access this support request.");
    }

    return scope;
  }
}
