import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TeamMember, ITeamMember } from "@/models/TeamMember";
import { TeamHandoverJob, ITeamHandoverJob } from "@/models/TeamHandoverJob";
import { Lead } from "@/models/Lead";
import { SiteVisit } from "@/models/SiteVisit";
import { LegalDocument } from "@/models/LegalDocument";
import { AdminSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";
import { TeamService } from "./team.service";
import { logger } from "@/lib/logger";

export interface MemberActiveWorkSummary {
  memberId: string;
  memberName: string;
  memberEmail: string;
  activeLeadsCount: number;
  upcomingSiteVisitsCount: number;
  pendingLegalReviewsCount: number;
  totalActiveItemsCount: number;
}

export class TeamHandoverService {
  /**
   * Inspects and computes active responsibilities for a member
   */
  static async calculateMemberActiveWork(memberId: string): Promise<MemberActiveWorkSummary> {
    await connectToDatabase();

    const member = await TeamMember.findById(memberId).lean();
    if (!member) {
      throw new Error("NOT_FOUND: Team member not found.");
    }

    const memberIdStr = member._id.toString();
    const userIdStr = member.userId || memberIdStr;
    const now = new Date();

    const [leadsCount, visitsCount, reviewsCount] = await Promise.all([
      Lead.countDocuments({
        $or: [
          { assignedToId: { $in: [memberIdStr, userIdStr] } },
          { assignedAdvisorId: { $in: [memberIdStr, userIdStr] } },
        ],
        status: { $nin: ["LOST", "WON", "ARCHIVED", "SPAM"] as any },
      }),
      SiteVisit.countDocuments({
        assignedAdvisorId: { $in: [memberIdStr, userIdStr] },
        scheduledStartAt: { $gte: now },
        status: { $in: ["REQUESTED", "PENDING_CONFIRMATION", "CONFIRMED"] as any },
      }),
      LegalDocument.countDocuments({
        currentReviewerId: { $in: [memberIdStr, userIdStr] },
        status: "UNDER_REVIEW",
      }),
    ]);

    return {
      memberId: memberIdStr,
      memberName: member.fullName,
      memberEmail: member.email,
      activeLeadsCount: leadsCount,
      upcomingSiteVisitsCount: visitsCount,
      pendingLegalReviewsCount: reviewsCount,
      totalActiveItemsCount: leadsCount + visitsCount + reviewsCount,
    };
  }

  /**
   * Execute atomic batch reassignment of all active work and optionally deactivate the source member
   */
  static async executeHandover(params: {
    sourceMemberId: string;
    targetMemberId: string;
    reason: string;
    deactivateSourceAfterHandover?: boolean;
    session: AdminSession;
  }): Promise<ITeamHandoverJob> {
    await connectToDatabase();

    const [sourceMember, targetMember] = await Promise.all([
      TeamMember.findById(params.sourceMemberId),
      TeamMember.findById(params.targetMemberId),
    ]);

    if (!sourceMember || !targetMember) {
      throw new Error("NOT_FOUND: Source or target team member not found.");
    }

    if (targetMember.status !== "ACTIVE") {
      throw new Error("BAD_REQUEST: Target member must be active to receive reassigned work.");
    }

    if (params.sourceMemberId === params.targetMemberId) {
      throw new Error("BAD_REQUEST: Source and target member cannot be the same.");
    }

    // Last Super Admin check if deactivation is requested
    if (params.deactivateSourceAfterHandover && sourceMember.roleKey === "SUPER_ADMIN") {
      const activeSuperAdmins = await TeamMember.countDocuments({
        roleKey: "SUPER_ADMIN",
        status: "ACTIVE",
      });
      if (activeSuperAdmins <= 1) {
        throw new Error("CONFLICT: Cannot deactivate the last active Super Admin of the organization.");
      }
    }

    const job = await TeamHandoverJob.create({
      sourceMemberId: sourceMember._id,
      targetMemberId: targetMember._id,
      reason: params.reason.trim(),
      requestedBy: params.session.user.id,
      status: "PROCESSING",
    });

    const sourceIds = [sourceMember._id.toString(), sourceMember.userId].filter(Boolean) as string[];
    const targetAdvisorId = targetMember.userId || targetMember._id.toString();
    const now = new Date();

    try {
      // 1. Reassign Leads
      const leadRes = await Lead.updateMany(
        {
          $or: [
            { assignedToId: { $in: sourceIds } },
            { assignedAdvisorId: { $in: sourceIds } },
          ],
          status: { $nin: ["LOST", "WON", "ARCHIVED", "SPAM"] as any },
        },
        {
          assignedToId: targetAdvisorId,
          assignedToName: targetMember.fullName,
          assignedToEmail: targetMember.email,
          assignedAdvisorId: targetAdvisorId,
          assignedAdvisorName: targetMember.fullName,
        }
      );

      // 2. Reassign Upcoming Site Visits
      const visitRes = await SiteVisit.updateMany(
        {
          assignedAdvisorId: { $in: sourceIds },
          scheduledStartAt: { $gte: now },
          status: { $in: ["REQUESTED", "PENDING_CONFIRMATION", "CONFIRMED"] as any },
        },
        {
          assignedAdvisorId: targetAdvisorId,
          assignedAdvisorName: targetMember.fullName,
        }
      );

      // 3. Reassign Pending Legal Document Reviews
      const reviewRes = await LegalDocument.updateMany(
        {
          currentReviewerId: { $in: sourceIds },
          status: "UNDER_REVIEW",
        },
        {
          currentReviewerId: targetAdvisorId,
          currentReviewerName: targetMember.fullName,
        }
      );

      // 4. Optionally deactivate source member
      if (params.deactivateSourceAfterHandover) {
        sourceMember.status = "DEACTIVATED";
        sourceMember.deactivationReason = params.reason.trim();
        sourceMember.deactivatedAt = new Date();
        sourceMember.deactivatedBy = params.session.user.id;
        sourceMember.version += 1;
        await sourceMember.save();
      }

      job.status = "COMPLETED";
      job.leadsReassignedCount = leadRes.modifiedCount;
      job.siteVisitsReassignedCount = visitRes.modifiedCount;
      job.legalReviewsReassignedCount = reviewRes.modifiedCount;
      job.completedAt = new Date();
      await job.save();

      await logAuditEvent({
        actor: params.session.user,
        action: "TEAM_HANDOVER_COMPLETED",
        targetMemberId: sourceMember._id,
        reason: `Completed work handover from ${sourceMember.fullName} to ${targetMember.fullName}: ${job.leadsReassignedCount} leads, ${job.siteVisitsReassignedCount} visits, ${job.legalReviewsReassignedCount} reviews.`,
      });

      return job;
    } catch (err: any) {
      job.status = "FAILED";
      job.errorMessage = err.message;
      await job.save();
      throw err;
    }
  }
}
