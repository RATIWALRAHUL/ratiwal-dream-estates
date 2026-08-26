import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CustomerSupportRequest, ICustomerSupportRequest } from "@/models/CustomerSupportRequest";
import { PortalGuard } from "@/lib/auth/portal-guard";
import { CustomerSession, SupportCategory, SupportPriority } from "@/types/portal";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";
import { logAuditEvent } from "@/lib/services/audit.service";

export interface CreateSupportRequestInput {
  category: SupportCategory;
  subject: string;
  description: string;
  bookingId?: string;
  priority?: SupportPriority;
  attachments?: string[];
}

export class PortalSupportService {
  public static async createSupportRequest(
    session: CustomerSession,
    input: CreateSupportRequestInput
  ): Promise<ICustomerSupportRequest> {
    return this.createTicket(session, input);
  }

  /**
   * Creates a new customer support ticket
   */
  public static async createTicket(
    session: CustomerSession,
    input: CreateSupportRequestInput
  ): Promise<ICustomerSupportRequest> {
    const scope = await PortalGuard.resolveCustomerScope(session);
    await connectToDatabase();

    const partyId = scope.partyIds[0];
    if (!partyId) {
      throw new Error("VALIDATION_ERROR: No customer party profile associated with this account.");
    }

    const count = await CustomerSupportRequest.countDocuments();
    const requestNumber = `RDE-SRQ-${String(count + 1).padStart(6, "0")}`;

    const ticket = await CustomerSupportRequest.create({
      requestNumber,
      accountId: new Types.ObjectId(session.user.id),
      partyId: new Types.ObjectId(partyId),
      bookingId: input.bookingId ? new Types.ObjectId(input.bookingId) : undefined,
      category: input.category,
      subject: input.subject.trim(),
      sanitizedDescription: input.description.trim(),
      priority: input.priority || "NORMAL",
      status: "OPEN",
      messages: [
        {
          senderType: "CUSTOMER",
          senderId: session.user.id,
          senderName: session.user.name,
          message: input.description.trim(),
          attachmentKeys: input.attachments || [],
          sentAt: new Date(),
        },
      ],
    });

    // Alert customer support staff
    await CommunicationOutboxService.enqueueEvent({
      eventType: "CUSTOMER_SUPPORT_CREATED_INTERNAL",
      aggregateType: "USER",
      aggregateId: ticket._id.toString(),
      recipientType: "ADMIN_POOL",
      recipientEmail: "support@ratiwaldreamestates.com",
      recipientName: "Ratiwal Customer Support",
      variables: {
        requestNumber,
        customerName: session.user.name,
        subject: ticket.subject,
        category: ticket.category,
      },
    });

    // Audit log
    await logAuditEvent({
      actor: { id: session.user.id, role: "CUSTOMER", email: session.user.email, name: session.user.name },
      action: "CUSTOMER_SUPPORT_CREATED",
      targetPartyId: new Types.ObjectId(partyId),
      targetSupportRequestId: ticket._id,
      reason: `Customer opened support ticket ${requestNumber}: ${ticket.subject}`,
    });

    return ticket;
  }

  /**
   * Adds a message to an existing support ticket (from customer)
   */
  public static async addCustomerMessage(
    session: CustomerSession,
    requestId: string,
    message: string,
    attachments?: string[]
  ): Promise<ICustomerSupportRequest> {
    await PortalGuard.assertCustomerSupportAccess(session, requestId);
    await connectToDatabase();

    const ticket = await CustomerSupportRequest.findById(requestId);
    if (!ticket) {
      throw new Error("NOT_FOUND: Support request not found.");
    }

    ticket.messages.push({
      senderType: "CUSTOMER",
      senderId: session.user.id,
      senderName: session.user.name,
      message: message.trim(),
      attachmentKeys: attachments || [],
      sentAt: new Date(),
    });

    if (ticket.status === "AWAITING_CUSTOMER" || ticket.status === "RESOLVED") {
      ticket.status = "IN_PROGRESS";
    }

    await ticket.save();

    await logAuditEvent({
      actor: { id: session.user.id, role: "CUSTOMER", email: session.user.email, name: session.user.name },
      action: "CUSTOMER_SUPPORT_UPDATED",
      targetSupportRequestId: ticket._id,
      reason: `Customer replied to support ticket ${ticket.requestNumber}`,
    });

    return ticket;
  }

  /**
   * Staff response to a customer support ticket
   */
  public static async addStaffReply(params: {
    requestId: string;
    staffId: string;
    staffName: string;
    message: string;
    status?: "AWAITING_CUSTOMER" | "RESOLVED" | "CLOSED" | "IN_PROGRESS";
    resolutionSummary?: string;
  }): Promise<ICustomerSupportRequest> {
    await connectToDatabase();

    const ticket = await CustomerSupportRequest.findById(params.requestId).populate(
      "accountId",
      "email name phone"
    );
    if (!ticket) {
      throw new Error("NOT_FOUND: Support request not found.");
    }

    ticket.messages.push({
      senderType: "STAFF",
      senderId: params.staffId,
      senderName: params.staffName,
      message: params.message.trim(),
      sentAt: new Date(),
    });

    if (params.status) {
      ticket.status = params.status;
    }

    if (params.resolutionSummary) {
      ticket.resolutionSummary = params.resolutionSummary.trim();
    }

    if (params.status === "RESOLVED" || params.status === "CLOSED") {
      ticket.closedAt = new Date();
      ticket.closedBy = params.staffName;
    }

    await ticket.save();

    // Notify customer
    const account = ticket.accountId as any;
    if (account?.email) {
      await CommunicationOutboxService.enqueueEvent({
        eventType: "CUSTOMER_SUPPORT_UPDATED_CUSTOMER",
        aggregateType: "USER",
        aggregateId: ticket._id.toString(),
        recipientType: "CUSTOMER",
        recipientEmail: account.email,
        recipientPhone: account.phone,
        recipientName: account.name,
        variables: {
          requestNumber: ticket.requestNumber,
          customerName: account.name,
          staffReply: params.message.trim(),
          status: ticket.status,
        },
      });
    }

    await logAuditEvent({
      actor: { id: params.staffId, role: "SUPER_ADMIN", email: "support@ratiwaldreamestates.com", name: params.staffName, isActive: true },
      action: "CUSTOMER_SUPPORT_UPDATED",
      targetSupportRequestId: ticket._id,
      reason: `Staff ${params.staffName} replied to ticket ${ticket.requestNumber}`,
    });

    return ticket;
  }
}
