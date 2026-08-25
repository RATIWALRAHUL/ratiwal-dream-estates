import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Role, IRole } from "@/models/Role";
import { TeamMember } from "@/models/TeamMember";
import { AdminUser } from "@/lib/auth/session";
import {
  PERMISSION_CATALOGUE,
  SYSTEM_ROLE_DEFINITIONS,
  SYSTEM_ROLE_KEYS,
  SystemRoleKey,
  validatePermissionDependencies,
} from "@/types/settings-team";
import { logger } from "@/lib/logger";

export class PermissionService {
  /**
   * Seeds default system roles in MongoDB if they do not exist
   */
  static async seedSystemRoles(actorId: string): Promise<void> {
    await connectToDatabase();

    for (const key of SYSTEM_ROLE_KEYS) {
      const def = SYSTEM_ROLE_DEFINITIONS[key];
      const existing = await Role.findOne({ roleKey: key });
      if (!existing) {
        await Role.create({
          roleKey: key,
          displayName: def.displayName,
          description: def.description,
          roleType: "SYSTEM",
          permissionKeys: def.permissions,
          defaultDataScope: def.defaultDataScope,
          isSystemRole: true,
          isActive: true,
          version: 1,
          createdBy: actorId,
        });
        logger.info(`[PermissionService] Seeded system role: ${key}`);
      }
    }
  }

  /**
   * Get all effective permissions for a given role key
   */
  static async getPermissionsForRole(roleKey: string): Promise<string[]> {
    await connectToDatabase();

    // 1. If Super Admin, return everything
    if (roleKey === "SUPER_ADMIN") {
      return Object.keys(PERMISSION_CATALOGUE);
    }

    // 2. Check Role model
    const role = await Role.findOne({ roleKey, isActive: true }).lean();
    if (role) {
      return role.permissionKeys;
    }

    // 3. Fallback to hardcoded system definitions
    if (SYSTEM_ROLE_KEYS.includes(roleKey as SystemRoleKey)) {
      return SYSTEM_ROLE_DEFINITIONS[roleKey as SystemRoleKey].permissions;
    }

    return [];
  }

  /**
   * Check if an active user has a specific permission
   */
  static async userHasPermission(user: AdminUser, permissionKey: string): Promise<boolean> {
    if (!user.isActive) return false;
    if (user.role === "SUPER_ADMIN") return true;

    // Check DB member custom overrides if exists
    await connectToDatabase();
    const member = await TeamMember.findOne({ email: user.email.toLowerCase(), status: "ACTIVE" }).lean();
    if (member?.customPermissionOverrides && member.customPermissionOverrides.includes(permissionKey)) {
      return true;
    }

    const effectiveRoleKey = member?.roleKey || user.role;
    const permissions = await this.getPermissionsForRole(effectiveRoleKey);
    return permissions.includes(permissionKey);
  }

  /**
   * Validates whether a user is allowed to delegate/assign a specific role to another member
   * Rules: Users cannot assign roles containing permissions they themselves do not possess,
   * and only Super Admins can assign or grant Super Admin.
   */
  static async canUserDelegateRole(actor: AdminUser, targetRoleKey: string): Promise<boolean> {
    if (actor.role === "SUPER_ADMIN") return true;
    if (targetRoleKey === "SUPER_ADMIN") return false; // Non-super admins cannot grant Super Admin

    const targetPermissions = await this.getPermissionsForRole(targetRoleKey);
    const actorPermissions = await this.getPermissionsForRole(actor.role);
    const actorSet = new Set(actorPermissions);

    for (const perm of targetPermissions) {
      if (!actorSet.has(perm)) {
        return false; // Actor is attempting privilege escalation
      }
    }

    return true;
  }
}
