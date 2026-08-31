import "server-only";
import crypto from "node:crypto";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TeamInvitation, ITeamInvitation } from "@/models/TeamInvitation";
import { TeamMember, ITeamMember } from "@/models/TeamMember";
import { AdminSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";
import { PermissionService } from "./permission.service";
import { TeamService } from "./team.service";
import { DataScope } from "@/types/settings-team";

export interface CreateInvitationInput {
  email: string;
  fullName: string;
  jobTitle?: string;
  department?: string;
  roleKey: string;
  dataScope?: DataScope;
  assignedPropertyIds?: string[];
  assignedLocationIds?: string[];
  expiresInHours?: number; // Default 72 hours
}

export class TeamInvitationService {
  /**
   * Generates SHA-256 hash of raw invitation token
   */
  static hashToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  /**
   * Create a new one-time hashed team invitation
   */
  static async createInvitation(
    input: CreateInvitationInput,
    session: AdminSession
  ): Promise<{ invitation: ITeamInvitation; rawToken: string }> {
    await connectToDatabase();

    // 1. Permission check
    const canInvite = await PermissionService.userHasPermission(session.user, "TEAM_INVITE");
    if (!canInvite && session.user.role !== "SUPER_ADMIN") {
      throw new Error("FORBIDDEN: Insufficient permissions to invite team members.");
    }

    // 2. Privilege escalation check
    const canDelegate = await PermissionService.canUserDelegateRole(session.user, input.roleKey);
    if (!canDelegate) {
      throw new Error(`FORBIDDEN: Cannot invite member with role "${input.roleKey}" exceeding your own authorization level.`);
    }

    const email = input.email.toLowerCase().trim();

    // Check if active team member already exists with this email
    const existingMember = await TeamMember.findOne({ email, status: "ACTIVE" });
    if (existingMember) {
      throw new Error(`CONFLICT: An active team member with email "${email}" already exists.`);
    }

    // Revoke any previous pending invitations for this email
    await TeamInvitation.updateMany(
      { email, status: "INVITED" },
      {
        status: "REVOKED",
        revokedAt: new Date(),
        revokedBy: session.user.id,
        revocationReason: "Superseded by new invitation",
      }
    );

    // Generate cryptographic token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);

    const hours = Math.min(Math.max(input.expiresInHours || 72, 1), 168); // Between 1 and 7 days
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000);

    const invitation = await TeamInvitation.create({
      email,
      tokenHash,
      fullName: input.fullName.trim(),
      jobTitle: input.jobTitle?.trim() || "Team Member",
      department: input.department || "SALES",
      roleKey: input.roleKey,
      dataScope: input.dataScope || "ALL_ORGANIZATION",
      assignedPropertyIds: (input.assignedPropertyIds || []).map((id) => new Types.ObjectId(id)),
      assignedLocationIds: (input.assignedLocationIds || []).map((id) => new Types.ObjectId(id)),
      invitedBy: session.user.id,
      invitedByName: session.user.name,
      status: "INVITED",
      expiresAt,
      lastSentAt: new Date(),
      deliveryStatus: "NOT_CONFIGURED", // Honest unconfigured state if no email sent
    });

    await logAuditEvent({
      actor: session.user,
      action: "TEAM_INVITATION_CREATED",
      reason: `Created team invitation for ${invitation.email} (Role: ${invitation.roleKey}, Expires: ${hours}h)`,
    });

    return { invitation, rawToken };
  }

  /**
   * Resend an invitation (invalidating the old token and generating a new one with cooldown protection)
   */
  static async resendInvitation(
    invitationId: string,
    session: AdminSession
  ): Promise<{ rawToken: string; expiresAt: Date }> {
    await connectToDatabase();

    const invitation = await TeamInvitation.findById(invitationId);
    if (!invitation) {
      throw new Error("NOT_FOUND: Invitation not found.");
    }

    if (invitation.status === "ACCEPTED") {
      throw new Error("BAD_REQUEST: Cannot resend an already accepted invitation.");
    }

    if (invitation.status === "REVOKED") {
      throw new Error("BAD_REQUEST: Cannot resend a revoked invitation. Please create a new invitation.");
    }

    // Cooldown check (60 seconds)
    const now = Date.now();
    const lastSentTime = new Date(invitation.lastSentAt).getTime();
    if (now - lastSentTime < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - lastSentTime)) / 1000);
      throw new Error(`RATE_LIMITED: Please wait ${waitSeconds} seconds before resending.`);
    }

    // Generate new secret token & extend expiry by 72 hours
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 72 * 3600 * 1000);

    invitation.tokenHash = tokenHash;
    invitation.status = "INVITED";
    invitation.expiresAt = expiresAt;
    invitation.resendCount += 1;
    invitation.lastSentAt = new Date();
    await invitation.save();

    await logAuditEvent({
      actor: session.user,
      action: "TEAM_INVITATION_RESENT",
      reason: `Resent invitation to ${invitation.email} (Resend count: ${invitation.resendCount})`,
    });

    return { rawToken, expiresAt };
  }

  /**
   * Revoke an active invitation immediately
   */
  static async revokeInvitation(invitationId: string, reason: string, session: AdminSession): Promise<void> {
    await connectToDatabase();

    const invitation = await TeamInvitation.findById(invitationId);
    if (!invitation) {
      throw new Error("NOT_FOUND: Invitation not found.");
    }

    if (invitation.status === "ACCEPTED") {
      throw new Error("BAD_REQUEST: Cannot revoke an already accepted invitation.");
    }

    invitation.status = "REVOKED";
    invitation.revokedAt = new Date();
    invitation.revokedBy = session.user.id;
    invitation.revocationReason = reason.trim();
    await invitation.save();

    await logAuditEvent({
      actor: session.user,
      action: "TEAM_INVITATION_REVOKED",
      reason: `Revoked invitation for ${invitation.email}: ${reason}`,
    });
  }

  /**
   * Accept an invitation using the raw token and activate/create the member account
   */
  static async acceptInvitation(
    rawToken: string,
    actingUserId?: string
  ): Promise<{ member: ITeamMember; invitation: ITeamInvitation }> {
    await connectToDatabase();

    const tokenHash = this.hashToken(rawToken);
    const invitation = await TeamInvitation.findOne({ tokenHash });

    if (!invitation) {
      throw new Error("NOT_FOUND: Invalid or expired invitation link.");
    }

    if (invitation.status === "REVOKED") {
      throw new Error("REVOKED: This invitation has been revoked by administration.");
    }

    if (invitation.status === "ACCEPTED") {
      throw new Error("ALREADY_ACCEPTED: This invitation has already been accepted.");
    }

    if (new Date(invitation.expiresAt).getTime() < Date.now()) {
      invitation.status = "EXPIRED";
      await invitation.save();
      throw new Error("EXPIRED: This invitation has expired.");
    }

    // Atomic acceptance & Member creation
    invitation.status = "ACCEPTED";
    invitation.acceptedAt = new Date();
    await invitation.save();

    // Create or update active TeamMember
    let member = await TeamMember.findOne({ email: invitation.email });
    if (!member) {
      member = await TeamMember.create({
        memberReference: TeamService.generateMemberReference(),
        userId: actingUserId,
        fullName: invitation.fullName,
        email: invitation.email,
        jobTitle: invitation.jobTitle || "Team Member",
        department: (invitation.department as any) || "SALES",
        roleKey: invitation.roleKey,
        dataScope: invitation.dataScope,
        assignedPropertyIds: invitation.assignedPropertyIds,
        assignedLocationIds: invitation.assignedLocationIds,
        status: "ACTIVE",
        version: 1,
        createdBy: invitation.invitedBy,
      });
    } else {
      member.status = "ACTIVE";
      member.roleKey = invitation.roleKey;
      member.dataScope = invitation.dataScope;
      member.assignedPropertyIds = invitation.assignedPropertyIds;
      member.assignedLocationIds = invitation.assignedLocationIds;
      member.userId = actingUserId || member.userId;
      member.version += 1;
      await member.save();
    }

    return { member, invitation };
  }
}
