import "server-only";
import crypto from "crypto";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CustomerPortalInvitation, ICustomerPortalInvitation } from "@/models/CustomerPortalInvitation";
import { CustomerPortalAccount, ICustomerPortalAccount } from "@/models/CustomerPortalAccount";
import { CustomerPortalAccess } from "@/models/CustomerPortalAccess";
import { CustomerParty } from "@/models/CustomerParty";
import { Booking } from "@/models/Booking";
import { logAuditEvent } from "@/lib/services/audit.service";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";
import { hashCustomerPassword, createCustomerSessionToken } from "@/lib/auth/customer-session";
import { PortalAccessRole } from "@/types/portal";

export interface SendPortalInvitationInput {
  partyId: string | Types.ObjectId;
  bookingId?: string | Types.ObjectId;
  applicantId?: string | Types.ObjectId;
  invitedEmail: string;
  invitedPhone?: string;
  invitedName: string;
  accessRole?: PortalAccessRole;
  actorId: string;
  actorName: string;
}

export interface ClaimPortalInvitationInput {
  token: string;
  password?: string; // If creating new account or setting password
  name?: string;
  phone?: string;
}

export class PortalInvitationService {
  /**
   * Hashes a raw one-time invitation token
   */
  public static hashToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  /**
   * Sends or resends a one-time portal invitation
   */
  public static async sendInvitation(input: SendPortalInvitationInput): Promise<{
    invitation: ICustomerPortalInvitation;
    rawToken: string;
    inviteUrl: string;
  }> {
    await connectToDatabase();

    const partyObjectId = new Types.ObjectId(input.partyId);
    const party = await CustomerParty.findById(partyObjectId);
    if (!party) {
      throw new Error("NOT_FOUND: Customer party record not found.");
    }

    const email = input.invitedEmail.trim().toLowerCase();

    // Supersede any existing pending invitations for this party & email
    await CustomerPortalInvitation.updateMany(
      {
        partyId: partyObjectId,
        invitedEmail: email,
        status: "PENDING",
      },
      {
        $set: {
          status: "SUPERSEDED",
          revocationReason: "SUPERSEDED_BY_NEW_INVITATION",
          revokedTimestamp: new Date(),
        },
      }
    );

    // Generate cryptographic one-time token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);

    // Expiry: 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Generate invitation number RDE-INV-XXXXXX
    const count = await CustomerPortalInvitation.countDocuments();
    const invitationNumber = `RDE-INV-${String(count + 1).padStart(6, "0")}`;

    const invitation = await CustomerPortalInvitation.create({
      invitationNumber,
      partyId: partyObjectId,
      bookingId: input.bookingId ? new Types.ObjectId(input.bookingId) : undefined,
      applicantId: input.applicantId ? new Types.ObjectId(input.applicantId) : undefined,
      invitedEmail: email,
      invitedPhone: input.invitedPhone?.trim(),
      invitedName: input.invitedName.trim(),
      accessRole: input.accessRole || "PRIMARY_CUSTOMER",
      tokenHash,
      status: "PENDING",
      expiresAt,
      invitedBy: input.actorId,
      invitedByName: input.actorName,
      sentTimestamp: new Date(),
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ratiwaldreamestates.com";
    const inviteUrl = `${baseUrl}/portal/claim?token=${rawToken}`;

    // Enqueue Transactional Communication Outbox Event
    await CommunicationOutboxService.enqueueEvent({
      eventType: "PORTAL_INVITATION_CUSTOMER",
      aggregateType: "USER",
      aggregateId: invitation._id.toString(),
      recipientType: "CUSTOMER",
      recipientEmail: email,
      recipientPhone: input.invitedPhone?.trim(),
      recipientName: input.invitedName.trim(),
      variables: {
        invitationNumber,
        inviteUrl,
        customerName: input.invitedName.trim(),
        expiresAt: expiresAt.toISOString(),
      },
    });

    // Audit log
    await logAuditEvent({
      actor: { id: input.actorId, role: "SUPER_ADMIN", email: "admin@ratiwaldreamestates.com", name: input.actorName, isActive: true },
      action: "PORTAL_INVITATION_SENT",
      targetPartyId: partyObjectId,
      targetPortalInvitationId: invitation._id,
      reason: `Portal invitation ${invitationNumber} sent to ${email}`,
    });

    return {
      invitation,
      rawToken,
      inviteUrl,
    };
  }

  /**
   * Verifies an invitation token and returns safe summary
   */
  public static async verifyInvitationToken(rawToken: string): Promise<{
    valid: boolean;
    reason?: string;
    invitation?: {
      invitationNumber: string;
      invitedEmail: string;
      invitedName: string;
      accessRole: string;
      expiresAt: string;
    };
  }> {
    await connectToDatabase();

    const tokenHash = this.hashToken(rawToken);
    const invitation = await CustomerPortalInvitation.findOne({ tokenHash });

    if (!invitation) {
      return { valid: false, reason: "INVALID_TOKEN: Invitation token not found or invalid." };
    }

    if (invitation.status !== "PENDING") {
      return { valid: false, reason: `INVITATION_${invitation.status}: Invitation is no longer pending.` };
    }

    if (new Date(invitation.expiresAt).getTime() <= Date.now()) {
      invitation.status = "EXPIRED";
      await invitation.save();
      return { valid: false, reason: "INVITATION_EXPIRED: This invitation has expired. Please request a new invite." };
    }

    return {
      valid: true,
      invitation: {
        invitationNumber: invitation.invitationNumber,
        invitedEmail: invitation.invitedEmail,
        invitedName: invitation.invitedName,
        accessRole: invitation.accessRole,
        expiresAt: invitation.expiresAt.toISOString(),
      },
    };
  }

  /**
   * Claims an invitation and activates customer portal access
   */
  public static async claimInvitation(input: ClaimPortalInvitationInput): Promise<{
    success: boolean;
    sessionToken: string;
    accountId: string;
    email: string;
    name: string;
  }> {
    await connectToDatabase();

    const tokenHash = this.hashToken(input.token);
    const invitation = await CustomerPortalInvitation.findOne({ tokenHash });

    if (!invitation) {
      throw new Error("INVALID_TOKEN: Invitation token not found.");
    }

    if (invitation.status !== "PENDING") {
      throw new Error(`INVITATION_INACTIVE: This invitation has already been ${invitation.status.toLowerCase()}.`);
    }

    if (new Date(invitation.expiresAt).getTime() <= Date.now()) {
      invitation.status = "EXPIRED";
      await invitation.save();
      throw new Error("INVITATION_EXPIRED: This invitation has expired.");
    }

    const email = invitation.invitedEmail.toLowerCase();

    // Check if account already exists
    let account = await CustomerPortalAccount.findOne({ email });

    if (!account) {
      if (!input.password || input.password.length < 8) {
        throw new Error("VALIDATION_ERROR: A secure password of at least 8 characters is required to activate your account.");
      }

      const { hash, salt } = hashCustomerPassword(input.password);

      account = await CustomerPortalAccount.create({
        email,
        phone: input.phone || invitation.invitedPhone,
        name: input.name || invitation.invitedName,
        passwordHash: hash,
        passwordSalt: salt,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: !!(input.phone || invitation.invitedPhone),
        lastLoginAt: new Date(),
      });
    } else {
      // If account exists, update password if provided
      if (input.password && input.password.length >= 8) {
        const { hash, salt } = hashCustomerPassword(input.password);
        account.passwordHash = hash;
        account.passwordSalt = salt;
      }
      account.isActive = true;
      account.lastLoginAt = new Date();
      await account.save();
    }

    // Resolve or upsert CustomerPortalAccess
    let access = await CustomerPortalAccess.findOne({
      accountId: account._id,
      partyId: invitation.partyId,
    });

    const bookingIds = invitation.bookingId ? [invitation.bookingId] : [];
    const applicantIds = invitation.applicantId ? [invitation.applicantId] : [];

    if (!access) {
      access = await CustomerPortalAccess.create({
        accountId: account._id,
        partyId: invitation.partyId,
        applicantIds,
        bookingIds,
        accessRole: invitation.accessRole,
        status: "ACTIVE",
        grantedBy: invitation.invitedBy,
        grantedByName: invitation.invitedByName,
        grantedTimestamp: new Date(),
      });
    } else {
      access.status = "ACTIVE";
      if (invitation.bookingId && !access.bookingIds.some((b) => b.equals(invitation.bookingId!))) {
        access.bookingIds.push(invitation.bookingId);
      }
      if (invitation.applicantId && !access.applicantIds.some((a) => a.equals(invitation.applicantId!))) {
        access.applicantIds.push(invitation.applicantId);
      }
      await access.save();
    }

    // Mark invitation accepted atomically
    invitation.status = "ACCEPTED";
    invitation.acceptedByAccountId = account._id;
    invitation.acceptedTimestamp = new Date();
    await invitation.save();

    // Create session token
    const sessionToken = createCustomerSessionToken({
      id: account._id.toString(),
      email: account.email,
      phone: account.phone,
      name: account.name,
      isActive: account.isActive,
      isEmailVerified: account.isEmailVerified,
      isPhoneVerified: account.isPhoneVerified,
      lastLoginAt: account.lastLoginAt?.toISOString(),
      mfaEnabled: account.mfaEnabled,
    });

    // Enqueue staff notification that portal is activated
    await CommunicationOutboxService.enqueueEvent({
      eventType: "PORTAL_ACTIVATED_INTERNAL",
      aggregateType: "USER",
      aggregateId: account._id.toString(),
      recipientType: "ADMIN_POOL",
      recipientEmail: "support@ratiwaldreamestates.com",
      recipientName: "Ratiwal Customer Support",
      variables: {
        customerName: account.name,
        customerEmail: account.email,
        partyId: invitation.partyId.toString(),
        invitationNumber: invitation.invitationNumber,
      },
    });

    // Audit log
    await logAuditEvent({
      actor: { id: account._id.toString(), role: "CUSTOMER", email: account.email, name: account.name },
      action: "PORTAL_ACCOUNT_CLAIMED",
      targetPartyId: invitation.partyId,
      targetPortalAccountId: account._id,
      targetPortalInvitationId: invitation._id,
      reason: `Customer ${account.name} claimed portal invitation ${invitation.invitationNumber}`,
    });

    return {
      success: true,
      sessionToken,
      accountId: account._id.toString(),
      email: account.email,
      name: account.name,
    };
  }
}
