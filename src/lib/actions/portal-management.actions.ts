"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { requireAdminSession } from "@/lib/auth/guard";
import { PortalInvitationService } from "@/lib/services/portal-invitation.service";
import { CustomerPortalAccess } from "@/models/CustomerPortalAccess";
import { CustomerPortalInvitation } from "@/models/CustomerPortalInvitation";
import { PortalSupportService } from "@/lib/services/portal-support.service";
import { logAuditEvent } from "@/lib/services/audit.service";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";
import { PortalAccessRole } from "@/types/portal";

/**
 * Staff sends a portal invitation to a customer
 */
export async function sendPortalInvitationAction(input: {
  partyId: string;
  bookingId?: string;
  applicantId?: string;
  invitedEmail: string;
  invitedPhone?: string;
  invitedName: string;
  accessRole?: PortalAccessRole;
}) {
  try {
    const session = await requireAdminSession();

    const res = await PortalInvitationService.sendInvitation({
      partyId: input.partyId,
      bookingId: input.bookingId,
      applicantId: input.applicantId,
      invitedEmail: input.invitedEmail,
      invitedPhone: input.invitedPhone,
      invitedName: input.invitedName,
      accessRole: input.accessRole,
      actorId: session.user.id,
      actorName: session.user.name,
    });

    if (input.bookingId) {
      revalidatePath(`/dashboard/bookings/${input.bookingId}`);
    }
    revalidatePath("/dashboard/kyc");
    return { success: true, inviteUrl: res.inviteUrl, invitationNumber: res.invitation.invitationNumber };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Staff resends a pending invitation
 */
export async function resendPortalInvitationAction(invitationId: string) {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const inv = await CustomerPortalInvitation.findById(invitationId);
    if (!inv) {
      return { success: false, error: "Invitation not found." };
    }

    const res = await PortalInvitationService.sendInvitation({
      partyId: inv.partyId,
      bookingId: inv.bookingId,
      applicantId: inv.applicantId,
      invitedEmail: inv.invitedEmail,
      invitedPhone: inv.invitedPhone,
      invitedName: inv.invitedName,
      accessRole: inv.accessRole,
      actorId: session.user.id,
      actorName: session.user.name,
    });

    return { success: true, inviteUrl: res.inviteUrl };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Staff revokes customer portal access
 */
export async function revokePortalAccessAction(accessId: string, reason: string) {
  try {
    const session = await requireAdminSession();
    await connectToDatabase();

    const access = await CustomerPortalAccess.findById(accessId).populate("accountId", "email name");
    if (!access) {
      return { success: false, error: "Portal access record not found." };
    }

    access.status = "REVOKED";
    access.revokedBy = session.user.id;
    access.revokedByName = session.user.name;
    access.revokedTimestamp = new Date();
    access.revocationReason = reason.trim();
    await access.save();

    // Alert customer
    const account = access.accountId as any;
    if (account?.email) {
      await CommunicationOutboxService.enqueueEvent({
        eventType: "PORTAL_ACCESS_REVOKED_CUSTOMER",
        aggregateType: "USER",
        aggregateId: access._id.toString(),
        recipientType: "CUSTOMER",
        recipientEmail: account.email,
        recipientName: account.name,
        variables: {
          customerName: account.name,
          revocationReason: reason.trim(),
        },
      });
    }

    // Audit log
    await logAuditEvent({
      actor: session.user,
      action: "PORTAL_ACCESS_REVOKED",
      targetPartyId: access.partyId,
      targetPortalAccountId: access.accountId,
      reason: `Staff ${session.user.name} revoked portal access: ${reason.trim()}`,
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Staff replies to a customer support ticket
 */
export async function staffReplySupportAction(params: {
  requestId: string;
  message: string;
  status?: "AWAITING_CUSTOMER" | "RESOLVED" | "CLOSED" | "IN_PROGRESS";
  resolutionSummary?: string;
}) {
  try {
    const session = await requireAdminSession();

    const ticket = await PortalSupportService.addStaffReply({
      requestId: params.requestId,
      staffId: session.user.id,
      staffName: session.user.name,
      message: params.message,
      status: params.status,
      resolutionSummary: params.resolutionSummary,
    });

    revalidatePath(`/dashboard/support`);
    revalidatePath(`/dashboard/support/${params.requestId}`);
    return { success: true, status: ticket.status };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
