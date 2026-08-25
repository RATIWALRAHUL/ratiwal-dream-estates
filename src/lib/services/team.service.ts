import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TeamMember, ITeamMember } from "@/models/TeamMember";
import { Role } from "@/models/Role";
import { AdminSession, AdminUser } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";
import { PermissionService } from "./permission.service";
import { DataScope, MemberStatus } from "@/types/settings-team";
import { logger } from "@/lib/logger";

export interface CreateMemberInput {
  fullName: string;
  email: string;
  phoneMasked?: string;
  avatarUrl?: string;
  jobTitle?: string;
  department?: "SALES" | "LEGAL" | "OPERATIONS" | "MANAGEMENT" | "INVENTORY" | "MARKETING" | "OTHER";
  roleKey: string;
  dataScope?: DataScope;
  assignedPropertyIds?: string[];
  assignedLocationIds?: string[];
  customPermissionOverrides?: string[];
}

export interface UpdateMemberInput {
  memberId: string;
  currentVersion: number;
  fullName?: string;
  phoneMasked?: string;
  avatarUrl?: string;
  jobTitle?: string;
  department?: "SALES" | "LEGAL" | "OPERATIONS" | "MANAGEMENT" | "INVENTORY" | "MARKETING" | "OTHER";
  roleKey?: string;
  dataScope?: DataScope;
  assignedPropertyIds?: string[];
  assignedLocationIds?: string[];
  customPermissionOverrides?: string[];
}

export class TeamService {
  /**
   * Generates a unique, non-colliding human-friendly member reference code
   * Format: RDE-MEM-XXXXXX
   */
  static generateMemberReference(): string {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `RDE-MEM-${randomNum}`;
  }

  /**
   * Syncs / seeds initial Super Admin account into TeamMember collection if none exists
   */
  static async syncInitialSuperAdmin(sessionUser: AdminUser): Promise<ITeamMember> {
    await connectToDatabase();
    await PermissionService.seedSystemRoles(sessionUser.id);

    const email = sessionUser.email.toLowerCase();
    let member = await TeamMember.findOne({ email });

    if (!member) {
      member = await TeamMember.create({
        memberReference: this.generateMemberReference(),
        userId: sessionUser.id,
        fullName: sessionUser.name || "Principal Super Admin",
        email,
        jobTitle: "Principal Administrator",
        department: "MANAGEMENT",
        roleKey: sessionUser.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN",
        dataScope: "ALL_ORGANIZATION",
        status: "ACTIVE",
        version: 1,
        createdBy: "SYSTEM",
      });
      logger.info(`[TeamService] Synced initial Super Admin member: ${email}`);
    }

    return member;
  }

  /**
   * Create a new Team Member directly
   */
  static async createMember(input: CreateMemberInput, session: AdminSession): Promise<ITeamMember> {
    await connectToDatabase();

    // 1. Permission check
    const canManage = await PermissionService.userHasPermission(session.user, "TEAM_MANAGE");
    if (!canManage && session.user.role !== "SUPER_ADMIN") {
      throw new Error("FORBIDDEN: Insufficient permissions to create team members.");
    }

    // 2. Privilege escalation check
    const canDelegate = await PermissionService.canUserDelegateRole(session.user, input.roleKey);
    if (!canDelegate) {
      throw new Error(`FORBIDDEN: Cannot grant role "${input.roleKey}" exceeding your own authorization level.`);
    }

    const email = input.email.toLowerCase().trim();
    const existing = await TeamMember.findOne({ email });
    if (existing) {
      throw new Error(`CONFLICT: A team member with email "${email}" already exists.`);
    }

    const member = await TeamMember.create({
      memberReference: this.generateMemberReference(),
      fullName: input.fullName.trim(),
      email,
      phoneMasked: input.phoneMasked?.trim(),
      avatarUrl: input.avatarUrl?.trim(),
      jobTitle: input.jobTitle?.trim() || "Team Member",
      department: input.department || "SALES",
      roleKey: input.roleKey,
      dataScope: input.dataScope || "ALL_ORGANIZATION",
      assignedPropertyIds: (input.assignedPropertyIds || []).map((id) => new Types.ObjectId(id)),
      assignedLocationIds: (input.assignedLocationIds || []).map((id) => new Types.ObjectId(id)),
      customPermissionOverrides: input.customPermissionOverrides || [],
      status: "ACTIVE",
      version: 1,
      createdBy: session.user.id,
    });

    await logAuditEvent({
      actor: session.user,
      action: "TEAM_MEMBER_CREATED",
      targetMemberId: member._id,
      reason: `Created team member ${member.fullName} (${member.email}) with role ${member.roleKey}`,
    });

    return member;
  }

  /**
   * Update team member details, role, or scopes with optimistic locking and Super Admin safeguards
   */
  static async updateMember(input: UpdateMemberInput, session: AdminSession): Promise<ITeamMember> {
    await connectToDatabase();

    const member = await TeamMember.findById(input.memberId);
    if (!member) {
      throw new Error("NOT_FOUND: Team member not found.");
    }

    // 1. Optimistic locking check
    if (member.version !== input.currentVersion) {
      throw new Error("CONFLICT: Member record was modified concurrently. Please refresh.");
    }

    // 2. Permission check
    const canManage = await PermissionService.userHasPermission(session.user, "TEAM_MANAGE");
    if (!canManage && session.user.role !== "SUPER_ADMIN") {
      throw new Error("FORBIDDEN: Insufficient permissions to manage team members.");
    }

    // 3. Last Super Admin protection on role change
    if (input.roleKey && input.roleKey !== member.roleKey) {
      if (member.roleKey === "SUPER_ADMIN" && input.roleKey !== "SUPER_ADMIN") {
        const activeSuperAdmins = await TeamMember.countDocuments({
          roleKey: "SUPER_ADMIN",
          status: "ACTIVE",
        });

        if (activeSuperAdmins <= 1) {
          throw new Error("CONFLICT: Cannot remove Super Admin role from the last active Super Admin of the organization.");
        }
      }

      // Check delegation permission
      const canDelegate = await PermissionService.canUserDelegateRole(session.user, input.roleKey);
      if (!canDelegate) {
        throw new Error(`FORBIDDEN: Cannot grant role "${input.roleKey}" exceeding your own authorization level.`);
      }

      member.roleKey = input.roleKey;
    }

    if (input.fullName) member.fullName = input.fullName.trim();
    if (input.phoneMasked !== undefined) member.phoneMasked = input.phoneMasked.trim();
    if (input.avatarUrl !== undefined) member.avatarUrl = input.avatarUrl.trim();
    if (input.jobTitle) member.jobTitle = input.jobTitle.trim();
    if (input.department) member.department = input.department;
    if (input.dataScope) member.dataScope = input.dataScope;
    if (input.assignedPropertyIds) {
      member.assignedPropertyIds = input.assignedPropertyIds.map((id) => new Types.ObjectId(id));
    }
    if (input.assignedLocationIds) {
      member.assignedLocationIds = input.assignedLocationIds.map((id) => new Types.ObjectId(id));
    }
    if (input.customPermissionOverrides) {
      member.customPermissionOverrides = input.customPermissionOverrides;
    }

    member.version += 1;
    member.updatedBy = session.user.id;
    await member.save();

    await logAuditEvent({
      actor: session.user,
      action: "TEAM_MEMBER_UPDATED",
      targetMemberId: member._id,
      reason: `Updated team member profile ${member.fullName} (${member.email})`,
    });

    return member;
  }

  /**
   * Suspend a member with reason and Super Admin protection
   */
  static async suspendMember(memberId: string, reason: string, session: AdminSession): Promise<ITeamMember> {
    await connectToDatabase();

    const member = await TeamMember.findById(memberId);
    if (!member) {
      throw new Error("NOT_FOUND: Team member not found.");
    }

    // Last Super Admin protection
    if (member.roleKey === "SUPER_ADMIN") {
      const activeSuperAdmins = await TeamMember.countDocuments({
        roleKey: "SUPER_ADMIN",
        status: "ACTIVE",
      });
      if (activeSuperAdmins <= 1) {
        throw new Error("CONFLICT: Cannot suspend the last active Super Admin of the organization.");
      }
    }

    member.status = "SUSPENDED";
    member.suspensionReason = reason.trim();
    member.suspendedAt = new Date();
    member.suspendedBy = session.user.id;
    member.version += 1;
    await member.save();

    await logAuditEvent({
      actor: session.user,
      action: "TEAM_MEMBER_SUSPENDED",
      targetMemberId: member._id,
      reason: `Suspended member ${member.fullName}: ${reason}`,
    });

    return member;
  }

  /**
   * Reactivate a suspended or deactivated member
   */
  static async reactivateMember(memberId: string, session: AdminSession): Promise<ITeamMember> {
    await connectToDatabase();

    const member = await TeamMember.findById(memberId);
    if (!member) {
      throw new Error("NOT_FOUND: Team member not found.");
    }

    member.status = "ACTIVE";
    member.suspensionReason = undefined;
    member.suspendedAt = undefined;
    member.suspendedBy = undefined;
    member.deactivationReason = undefined;
    member.deactivatedAt = undefined;
    member.deactivatedBy = undefined;
    member.version += 1;
    await member.save();

    await logAuditEvent({
      actor: session.user,
      action: "TEAM_MEMBER_REACTIVATED",
      targetMemberId: member._id,
      reason: `Reactivated team member ${member.fullName} (${member.email})`,
    });

    return member;
  }

  /**
   * Query team members with pagination, search, and filters
   */
  static async queryMembers(params: {
    department?: string;
    roleKey?: string;
    status?: MemberStatus;
    search?: string;
    page?: number;
    perPage?: number;
  }): Promise<{ members: ITeamMember[]; total: number; page: number; perPage: number }> {
    await connectToDatabase();

    const page = Math.max(params.page || 1, 1);
    const perPage = Math.min(Math.max(params.perPage || 25, 1), 100);
    const skip = (page - 1) * perPage;

    const filter: Record<string, unknown> = {};

    if (params.department) filter.department = params.department;
    if (params.roleKey) filter.roleKey = params.roleKey;
    if (params.status) filter.status = params.status;

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      filter.$or = [
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { memberReference: { $regex: q, $options: "i" } },
        { jobTitle: { $regex: q, $options: "i" } },
      ];
    }

    const [members, total] = await Promise.all([
      TeamMember.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      TeamMember.countDocuments(filter),
    ]);

    return {
      members: members as unknown as ITeamMember[],
      total,
      page,
      perPage,
    };
  }
}
