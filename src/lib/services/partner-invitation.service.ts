import "server-only";

import { createHash, randomBytes } from "crypto";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ChannelPartner } from "@/models/ChannelPartner";
import { PartnerAccount } from "@/models/PartnerAccount";
import { PartnerInvitation, IPartnerInvitation } from "@/models/PartnerInvitation";
import { PartnerAgreement } from "@/models/PartnerAgreement";
import { PartnerType } from "@/types/partner";
import { hashPartnerPassword, createPartnerSessionToken } from "@/lib/auth/partner-session";
import { CommunicationOutboxService } from "@/lib/services/communication-outbox.service";
import { logAuditEvent } from "@/lib/services/audit.service";

export interface SendPartnerInvitationInput {
  partnerId: string;
  invitedEmail: string;
  invitedPhone?: string;
  invitedName: string;
  actorId: string;
  actorName: string;
  expiresInDays?: number;
}

export class PartnerInvitationService {
  /**
   * Hashes a raw invitation token with SHA-256
   */
  public static hashToken(rawToken: string): string {
    return createHash("sha256").update(rawToken).digest("hex");
  }

  /**
   * Issues a cryptographic one-time invitation for a channel partner
   */
  public static async sendInvitation(input: SendPartnerInvitationInput): Promise<{
    invitation: IPartnerInvitation;
    rawToken: string;
    inviteUrl: string;
  }> {
    await connectToDatabase();

    const partner = await ChannelPartner.findById(input.partnerId);
    if (!partner) {
      throw new Error("NOT_FOUND: Channel partner record not found.");
    }

    const email = input.invitedEmail.toLowerCase().trim();

    // Invalidate prior pending invitations for this email
    await PartnerInvitation.updateMany(
      { invitedEmail: email, status: "PENDING" },
      { $set: { status: "SUPERSEDED" } }
    );

    // Generate 32-byte cryptographically secure random token
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);

    const count = await PartnerInvitation.countDocuments();
    const invitationNumber = `RDE-PINV-${String(count + 1).padStart(6, "0")}`;
    const expiresAt = new Date(Date.now() + (input.expiresInDays || 7) * 24 * 60 * 60 * 1000);

    const invitation = await PartnerInvitation.create({
      invitationNumber,
      partnerId: partner._id,
      partnerType: partner.partnerType,
      invitedEmail: email,
      invitedPhone: input.invitedPhone?.trim(),
      invitedName: input.invitedName.trim(),
      tokenHash,
      status: "PENDING",
      expiresAt,
      invitedBy: input.actorId,
      invitedByName: input.actorName,
      sentTimestamp: new Date(),
    });

    // Update partner status if in DRAFT
    if (partner.status === "DRAFT") {
      partner.status = "INVITED";
      await partner.save();
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ratiwaldreamestates.com";
    const inviteUrl = `${baseUrl}/partner/claim?token=${rawToken}`;

    // Enqueue Outbox Notification
    await CommunicationOutboxService.enqueueEvent({
      eventType: "PARTNER_INVITED",
      aggregateType: "USER",
      aggregateId: invitation._id.toString(),
      recipientType: "CUSTOMER",
      recipientEmail: email,
      recipientPhone: input.invitedPhone?.trim(),
      recipientName: input.invitedName.trim(),
      variables: {
        invitationNumber,
        inviteUrl,
        partnerName: partner.displayName,
        expiresAt: expiresAt.toISOString(),
      },
    });

    // Audit Log
    await logAuditEvent({
      actor: { id: input.actorId, role: "SUPER_ADMIN", email: "admin@ratiwaldreamestates.com", name: input.actorName, isActive: true },
      action: "PARTNER_INVITATION_SENT",
      targetPartnerId: partner._id,
      reason: `Channel partner invitation ${invitationNumber} sent to ${email}`,
    });

    return { invitation, rawToken, inviteUrl };
  }

  /**
   * Verifies an invitation token without consuming it
   */
  public static async verifyInvitationToken(rawToken: string): Promise<{
    invitation: IPartnerInvitation;
    partner: any;
  }> {
    await connectToDatabase();

    const tokenHash = this.hashToken(rawToken);
    const invitation = await PartnerInvitation.findOne({
      tokenHash,
      status: "PENDING",
      expiresAt: { $gt: new Date() },
    }).populate("partnerId");

    if (!invitation || !invitation.partnerId) {
      throw new Error("INVALID_TOKEN: Invitation is invalid, expired, or has already been used.");
    }

    return {
      invitation,
      partner: invitation.partnerId,
    };
  }

  /**
   * Claims an invitation and activates the partner account
   */
  public static async claimInvitation(params: {
    rawToken: string;
    password: string;
    phone?: string;
  }): Promise<{
    sessionToken: string;
    partner: any;
    account: any;
  }> {
    await connectToDatabase();

    const { invitation, partner } = await this.verifyInvitationToken(params.rawToken);
    const email = invitation.invitedEmail.toLowerCase().trim();

    // Check if account already exists
    let account = await PartnerAccount.findOne({ email });
    const { hash, salt } = hashPartnerPassword(params.password);

    if (!account) {
      account = await PartnerAccount.create({
        partnerId: partner._id,
        email,
        phone: params.phone?.trim() || invitation.invitedPhone || partner.phone,
        name: invitation.invitedName,
        passwordHash: hash,
        passwordSalt: salt,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: !!params.phone,
      });
    } else {
      account.passwordHash = hash;
      account.passwordSalt = salt;
      account.isActive = true;
      await account.save();
    }

    // Enable portal access on partner and advance state if INVITED
    partner.portalAccessEnabled = true;
    if (partner.status === "INVITED" || partner.status === "DRAFT") {
      partner.status = "ONBOARDING";
      partner.onboardingDate = new Date();
    }
    await partner.save();

    // Mark invitation accepted
    invitation.status = "ACCEPTED";
    invitation.acceptedByAccountId = account._id;
    invitation.acceptedTimestamp = new Date();
    await invitation.save();

    // Create session token
    const sessionToken = createPartnerSessionToken({
      id: account._id.toString(),
      partnerId: partner._id.toString(),
      email: account.email,
      name: account.name,
      phone: account.phone,
      partnerType: partner.partnerType,
      partnerCode: partner.partnerCode,
      companyName: partner.displayName || partner.legalName,
      isActive: account.isActive,
      isEmailVerified: account.isEmailVerified,
      isPhoneVerified: account.isPhoneVerified,
      complianceStatus: partner.complianceStatus || partner.status,
    });

    // Enqueue internal alert
    await CommunicationOutboxService.enqueueEvent({
      eventType: "PARTNER_APPROVED",
      aggregateType: "USER",
      aggregateId: partner._id.toString(),
      recipientType: "ADMIN_POOL",
      recipientEmail: "partners@ratiwaldreamestates.com",
      recipientName: "Ratiwal Partner Desk",
      variables: {
        partnerCode: partner.partnerCode,
        partnerName: partner.displayName,
        accountEmail: account.email,
      },
    });

    // Audit Log
    await logAuditEvent({
      actor: { id: account._id.toString(), role: "PARTNER", email: account.email, name: account.name },
      action: "PARTNER_ACCOUNT_CLAIMED",
      targetPartnerId: partner._id,
      reason: `Partner claimed invitation and set up credentials for ${partner.partnerCode}`,
    });

    return { sessionToken, partner, account };
  }
}
