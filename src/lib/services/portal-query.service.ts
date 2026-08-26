import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PortalGuard } from "@/lib/auth/portal-guard";
import { CustomerSession, CustomerProfileDTO } from "@/types/portal";
import { Booking } from "@/models/Booking";
import { CustomerParty } from "@/models/CustomerParty";
import { Property } from "@/models/Property";
import { InventoryUnit } from "@/models/InventoryUnit";
import { CustomerKycCase } from "@/models/CustomerKycCase";
import { KycApplicant } from "@/models/KycApplicant";
import { KycDocument } from "@/models/KycDocument";
import { PaymentPlan } from "@/models/PaymentPlan";
import { PaymentInstallment } from "@/models/PaymentInstallment";
import { PaymentTransaction } from "@/models/PaymentTransaction";
import { PaymentReceipt } from "@/models/PaymentReceipt";
import { RefundRequest } from "@/models/RefundRequest";
import { SiteVisit } from "@/models/SiteVisit";
import { LegalDocument } from "@/models/LegalDocument";
import { CustomerPortalAccount } from "@/models/CustomerPortalAccount";
import { CustomerSupportRequest } from "@/models/CustomerSupportRequest";
import { MoneyUtils } from "@/lib/utils/money";

export class PortalQueryService {
  /**
   * Fetches high-level portal dashboard summary for authenticated customer
   */
  public static async getPortalHomeData(session: CustomerSession) {
    const scope = await PortalGuard.resolveCustomerScope(session);
    await connectToDatabase();

    const bookingObjectIds = scope.bookingIds.map((id) => new Types.ObjectId(id));
    const partyObjectIds = scope.partyIds.map((id) => new Types.ObjectId(id));

    // 1. Fetch latest active booking
    const bookings = await Booking.find({
      _id: { $in: bookingObjectIds },
      status: { $ne: "CANCELLED" },
    })
      .sort({ createdAt: -1 })
      .populate("propertyId", "title slug heroImage locationId")
      .populate("unitId", "unitNumber plotNumber plotAreaSqYd launchPrice")
      .lean();

    const primaryBooking = bookings[0] || null;

    // 2. Fetch KYC status
    const kycCases = await CustomerKycCase.find({
      $or: [
        { bookingId: { $in: bookingObjectIds } },
        { partyId: { $in: partyObjectIds } },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const activeKyc = kycCases[0] || null;

    // 3. Fetch active payment plan and upcoming/overdue instalments
    const paymentPlans = await PaymentPlan.find({
      bookingId: { $in: bookingObjectIds },
      status: "ACTIVE",
    }).lean();

    const planIds = paymentPlans.map((p) => p._id);
    const upcomingInstalments = await PaymentInstallment.find({
      planId: { $in: planIds },
      status: { $in: ["UPCOMING", "DUE", "OVERDUE", "PARTIALLY_PAID"] },
    })
      .sort({ dueDate: 1, sequence: 1 })
      .limit(3)
      .lean();

    const nextInstalment = upcomingInstalments[0] || null;

    // 4. Calculate total outstanding across active plans
    let totalPlanAmountPaise = 0;
    let totalPaidAmountPaise = 0;
    let totalOutstandingAmountPaise = 0;

    for (const plan of paymentPlans) {
      totalPlanAmountPaise = MoneyUtils.add(totalPlanAmountPaise, plan.totalConsiderationPaise || 0);
      totalPaidAmountPaise = MoneyUtils.add(totalPaidAmountPaise, plan.totalAmountCoveredPaise || 0);
      totalOutstandingAmountPaise = MoneyUtils.add(
        totalOutstandingAmountPaise,
        MoneyUtils.subtract(plan.totalConsiderationPaise || 0, plan.totalAmountCoveredPaise || 0, true)
      );
    }

    // 5. Fetch upcoming site visits
    const siteVisits = await SiteVisit.find({
      $or: [
        { bookingId: { $in: bookingObjectIds } },
        { visitorEmail: session.user.email.toLowerCase() },
      ],
      status: { $in: ["REQUESTED", "CONFIRMED", "RESCHEDULE_REQUESTED"] },
      scheduledDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .sort({ scheduledDate: 1 })
      .populate("propertyId", "title slug")
      .limit(2)
      .lean();

    // 6. Fetch recent support tickets
    const openSupportRequests = await CustomerSupportRequest.find({
      accountId: new Types.ObjectId(session.user.id),
      status: { $in: ["OPEN", "ASSIGNED", "AWAITING_CUSTOMER", "IN_PROGRESS"] },
    })
      .sort({ updatedAt: -1 })
      .limit(3)
      .lean();

    return {
      user: session.user,
      bookingsCount: bookings.length,
      primaryBooking,
      bookings,
      activeKyc,
      nextInstalment,
      financialSummary: {
        totalPlanAmountRupees: MoneyUtils.toMajorUnits(totalPlanAmountPaise),
        totalPaidAmountRupees: MoneyUtils.toMajorUnits(totalPaidAmountPaise),
        totalOutstandingAmountRupees: MoneyUtils.toMajorUnits(totalOutstandingAmountPaise),
        formattedOutstanding: MoneyUtils.formatINR(totalOutstandingAmountPaise),
      },
      upcomingSiteVisits: siteVisits,
      openSupportRequests,
    };
  }

  /**
   * Fetches detailed booking for customer
   */
  public static async getCustomerBookingDetails(session: CustomerSession, bookingId: string) {
    await PortalGuard.assertCustomerBookingAccess(session, bookingId);
    await connectToDatabase();

    const booking = await Booking.findById(bookingId)
      .populate("propertyId", "title slug heroImage locationId propertyType description")
      .populate("unitId", "unitNumber plotNumber plotAreaSqYd dimensions orientation launchPrice")
      .populate("customerPartyId", "partyReference displayName partyType")
      .lean();

    if (!booking) {
      throw new Error("NOT_FOUND: Booking not found.");
    }

    // Fetch payment plan
    const paymentPlan = await PaymentPlan.findOne({
      bookingId: booking._id,
      status: "ACTIVE",
    }).lean();

    let instalments: any[] = [];
    if (paymentPlan) {
      instalments = await PaymentInstallment.find({ planId: paymentPlan._id })
        .sort({ sequence: 1 })
        .lean();
    }

    // Fetch payments & receipts
    const payments = await PaymentTransaction.find({
      bookingId: booking._id,
      status: { $in: ["CAPTURED", "PARTIALLY_REFUNDED", "REFUNDED", "CREATED", "PENDING"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    const receipts = await PaymentReceipt.find({
      bookingId: booking._id,
      status: "ISSUED",
    })
      .sort({ receiptNumber: -1 })
      .lean();

    // Fetch KYC case
    const kycCase = await CustomerKycCase.findOne({
      bookingId: booking._id,
    }).lean();

    let applicants: any[] = [];
    if (kycCase) {
      applicants = await KycApplicant.find({ kycCaseId: kycCase._id }).lean();
    }

    const isKycComplete =
      kycCase?.status === "COMPLETED" ||
      kycCase?.status === "INTERNALLY_VERIFIED" ||
      kycCase?.status === "PROVIDER_VERIFIED";

    // Calculate milestone progress
    const milestones = [
      {
        key: "BOOKING_CREATED",
        title: "Booking Created",
        description: `Booking reference ${booking.bookingNumber} generated.`,
        isCompleted: true,
        completedAt: booking.createdAt,
      },
      {
        key: "KYC_VERIFICATION",
        title: "Customer KYC Verification",
        description: isKycComplete ? "KYC completed and verified." : "Identity verification in progress.",
        isCompleted: isKycComplete,
        status: kycCase?.status || "PENDING",
      },
      {
        key: "PAYMENT_PLAN",
        title: "Payment Plan Activation",
        description: paymentPlan ? `Plan ${paymentPlan.paymentPlanNumber} active.` : "Milestone schedule pending.",
        isCompleted: !!paymentPlan,
        completedAt: paymentPlan?.createdAt,
      },
      {
        key: "TOKEN_RECEIVED",
        title: "Booking Token Allocation",
        description:
          payments.some((p) => p.status === "CAPTURED")
            ? "Booking advance payment received & allocated."
            : "Booking token payment pending.",
        isCompleted: payments.some((p) => p.status === "CAPTURED"),
      },
      {
        key: "OPERATIONAL_CONFIRMED",
        title: "Operational Booking Confirmed",
        description:
          booking.status === "CONFIRMED"
            ? "Operational booking confirmed by sales desk."
            : "Awaiting final confirmation.",
        isCompleted: booking.status === "CONFIRMED",
      },
    ];

    return {
      booking,
      paymentPlan,
      instalments,
      payments,
      receipts,
      kycCase,
      applicants,
      milestones,
    };
  }

  /**
   * Fetches customer payment plans and ledger
   */
  public static async getCustomerPaymentData(session: CustomerSession) {
    const scope = await PortalGuard.resolveCustomerScope(session);
    await connectToDatabase();

    const bookingObjectIds = scope.bookingIds.map((id) => new Types.ObjectId(id));

    const paymentPlans = await PaymentPlan.find({
      bookingId: { $in: bookingObjectIds },
    })
      .populate("bookingId", "bookingNumber totalApprovedAmountRupees")
      .sort({ createdAt: -1 })
      .lean();

    const planIds = paymentPlans.map((p) => p._id);
    const instalments = await PaymentInstallment.find({
      planId: { $in: planIds },
    })
      .sort({ installmentIndex: 1 })
      .lean();

    const transactions = await PaymentTransaction.find({
      bookingId: { $in: bookingObjectIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    const receipts = await PaymentReceipt.find({
      bookingId: { $in: bookingObjectIds },
      status: "ISSUED",
    })
      .sort({ receiptDate: -1 })
      .lean();

    const refunds = await RefundRequest.find({
      bookingId: { $in: bookingObjectIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    return {
      paymentPlans,
      instalments,
      transactions,
      receipts,
      refunds,
    };
  }

  /**
   * Fetches customer KYC case and applicants
   */
  public static async getCustomerKycData(session: CustomerSession) {
    const scope = await PortalGuard.resolveCustomerScope(session);
    await connectToDatabase();

    const bookingObjectIds = scope.bookingIds.map((id) => new Types.ObjectId(id));
    const partyObjectIds = scope.partyIds.map((id) => new Types.ObjectId(id));

    const kycCases = await CustomerKycCase.find({
      $or: [
        { bookingId: { $in: bookingObjectIds } },
        { partyId: { $in: partyObjectIds } },
      ],
    })
      .populate("bookingId", "bookingNumber")
      .populate("partyId", "displayName partyReference")
      .sort({ createdAt: -1 })
      .lean();

    const caseIds = kycCases.map((c) => c._id);
    const applicants = await KycApplicant.find({
      kycCaseId: { $in: caseIds },
    }).lean();

    const applicantIds = applicants.map((a) => a._id);
    const documents = await KycDocument.find({
      applicantId: { $in: applicantIds },
    }).lean();

    return {
      kycCases,
      applicants,
      documents,
    };
  }

  /**
   * Fetches customer-visible approved documents
   */
  public static async getCustomerDocuments(session: CustomerSession) {
    const scope = await PortalGuard.resolveCustomerScope(session);
    await connectToDatabase();

    const bookingObjectIds = scope.bookingIds.map((id) => new Types.ObjectId(id));

    // 1. Official payment receipts
    const receipts = await PaymentReceipt.find({
      bookingId: { $in: bookingObjectIds },
      status: "ISSUED",
    })
      .sort({ receiptDate: -1 })
      .lean();

    // 2. Approved public or customer-scoped legal documents
    const bookings = await Booking.find({ _id: { $in: bookingObjectIds } }).select("propertyId").lean();
    const propertyIds = bookings.map((b) => b.propertyId).filter(Boolean);

    const legalDocs = await LegalDocument.find({
      propertyId: { $in: propertyIds },
      classification: "PUBLIC_APPROVED",
      status: "INTERNALLY_VERIFIED",
    })
      .select("title category documentReference currentVersionNumber updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    return {
      receipts,
      approvedPropertyDocuments: legalDocs,
    };
  }

  /**
   * Fetches customer profile & communication preferences
   */
  public static async getCustomerProfile(session: CustomerSession): Promise<CustomerProfileDTO> {
    await connectToDatabase();

    const account = await CustomerPortalAccount.findById(session.user.id).lean();
    if (!account) {
      throw new Error("NOT_FOUND: Customer account not found.");
    }

    const scope = await PortalGuard.resolveCustomerScope(session);

    // Mask email: j***n@example.com
    const maskEmail = (email: string) => {
      const [user, domain] = email.split("@");
      if (!user || !domain) return email;
      const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user[0]}***`;
      return `${maskedUser}@${domain}`;
    };

    // Mask phone: +91 98*** **321
    const maskPhone = (phone?: string) => {
      if (!phone) return "Not provided";
      if (phone.length <= 4) return phone;
      return `${phone.slice(0, 3)}***${phone.slice(-3)}`;
    };

    return {
      name: account.name,
      emailMasked: maskEmail(account.email),
      phoneMasked: maskPhone(account.phone),
      linkedBookingsCount: scope.bookingIds.length,
      communicationPreferences: account.communicationPreferences || {
        transactionalEmail: true,
        transactionalWhatsapp: true,
        marketingConsent: false,
        preferredLanguage: "en",
      },
      security: {
        lastLoginAt: account.lastLoginAt?.toISOString(),
        mfaEnabled: account.mfaEnabled,
      },
    };
  }
}
