"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession, requirePermission } from "@/lib/auth/guard";
import { TeamService, CreateMemberInput, UpdateMemberInput } from "@/lib/services/team.service";
import { TeamInvitationService, CreateInvitationInput } from "@/lib/services/team-invitation.service";
import { TeamHandoverService } from "@/lib/services/team-handover.service";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignore in non-request contexts
  }
}

/**
 * Invite a new team member with secure hashed token
 */
export async function createTeamInvitationAction(input: CreateInvitationInput) {
  try {
    const session = await requirePermission("TEAM_INVITE");
    const result = await TeamInvitationService.createInvitation(input, session);

    safeRevalidate("/dashboard/team");
    safeRevalidate("/dashboard/team/invitations");

    return {
      success: true as const,
      invitationId: result.invitation._id.toString(),
      rawToken: result.rawToken,
      expiresAt: result.invitation.expiresAt.toISOString(),
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to create team invitation.",
    };
  }
}

/**
 * Resend a pending team invitation with cooldown protection
 */
export async function resendTeamInvitationAction(invitationId: string) {
  try {
    const session = await requirePermission("TEAM_INVITE");
    const result = await TeamInvitationService.resendInvitation(invitationId, session);

    safeRevalidate("/dashboard/team/invitations");

    return {
      success: true as const,
      rawToken: result.rawToken,
      expiresAt: result.expiresAt.toISOString(),
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to resend team invitation.",
    };
  }
}

/**
 * Revoke a pending team invitation
 */
export async function revokeTeamInvitationAction(invitationId: string, reason: string) {
  try {
    const session = await requirePermission("TEAM_MANAGE");
    await TeamInvitationService.revokeInvitation(invitationId, reason, session);

    safeRevalidate("/dashboard/team/invitations");

    return { success: true as const };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to revoke team invitation.",
    };
  }
}

/**
 * Update team member details, role, or scopes
 */
export async function updateTeamMemberAction(input: UpdateMemberInput) {
  try {
    const session = await requirePermission("TEAM_MANAGE");
    const member = await TeamService.updateMember(input, session);

    safeRevalidate("/dashboard/team");
    safeRevalidate(`/dashboard/team/${input.memberId}`);
    safeRevalidate(`/dashboard/team/${input.memberId}/permissions`);

    return {
      success: true as const,
      memberId: member._id.toString(),
      version: member.version,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to update team member.",
    };
  }
}

/**
 * Suspend an active team member with reason
 */
export async function suspendTeamMemberAction(memberId: string, reason: string) {
  try {
    const session = await requirePermission("TEAM_MANAGE");
    const member = await TeamService.suspendMember(memberId, reason, session);

    safeRevalidate("/dashboard/team");
    safeRevalidate(`/dashboard/team/${memberId}`);

    return {
      success: true as const,
      status: member.status,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to suspend team member.",
    };
  }
}

/**
 * Reactivate a suspended or deactivated team member
 */
export async function reactivateTeamMemberAction(memberId: string) {
  try {
    const session = await requirePermission("TEAM_MANAGE");
    const member = await TeamService.reactivateMember(memberId, session);

    safeRevalidate("/dashboard/team");
    safeRevalidate(`/dashboard/team/${memberId}`);

    return {
      success: true as const,
      status: member.status,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to reactivate team member.",
    };
  }
}

/**
 * Execute work handover from source member to target member
 */
export async function executeTeamHandoverAction(params: {
  sourceMemberId: string;
  targetMemberId: string;
  reason: string;
  deactivateSourceAfterHandover?: boolean;
}) {
  try {
    const session = await requirePermission("TEAM_HANDOVER");
    const job = await TeamHandoverService.executeHandover({
      ...params,
      session,
    });

    safeRevalidate("/dashboard/team");
    safeRevalidate(`/dashboard/team/${params.sourceMemberId}`);
    safeRevalidate(`/dashboard/team/${params.targetMemberId}`);

    return {
      success: true as const,
      jobId: job._id.toString(),
      leadsReassignedCount: job.leadsReassignedCount,
      siteVisitsReassignedCount: job.siteVisitsReassignedCount,
      legalReviewsReassignedCount: job.legalReviewsReassignedCount,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to execute work handover.",
    };
  }
}
