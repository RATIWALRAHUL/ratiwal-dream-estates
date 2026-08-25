"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/guard";
import { SettingsService } from "@/lib/services/settings.service";
import { Role } from "@/models/Role";
import { TeamMember } from "@/models/TeamMember";
import { logAuditEvent } from "@/lib/services/audit.service";
import { validatePermissionDependencies } from "@/types/settings-team";
import { connectToDatabase } from "@/lib/db/mongoose";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignore in non-request contexts
  }
}

/**
 * Update General Settings
 */
export async function updateGeneralSettingsAction(params: {
  currentVersion: number;
  data: any;
  reason?: string;
}) {
  try {
    const session = await requirePermission("SETTINGS_MANAGE");
    const settings = await SettingsService.updateSettingsSection({
      sectionKey: "general",
      currentVersion: params.currentVersion,
      data: params.data,
      reason: params.reason,
      session,
    });

    safeRevalidate("/dashboard/settings");
    safeRevalidate("/dashboard/settings/general");

    return {
      success: true as const,
      version: settings.settingsVersion,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to update general settings.",
    };
  }
}

/**
 * Update Regional Settings
 */
export async function updateRegionalSettingsAction(params: {
  currentVersion: number;
  data: any;
  reason?: string;
}) {
  try {
    const session = await requirePermission("SETTINGS_MANAGE");
    const settings = await SettingsService.updateSettingsSection({
      sectionKey: "regional",
      currentVersion: params.currentVersion,
      data: params.data,
      reason: params.reason,
      session,
    });

    safeRevalidate("/dashboard/settings");
    safeRevalidate("/dashboard/settings/regional");

    return {
      success: true as const,
      version: settings.settingsVersion,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to update regional settings.",
    };
  }
}

/**
 * Update Business & CRM Settings (Leads, Site Visits, Legal Vault)
 */
export async function updateBusinessSettingsAction(params: {
  currentVersion: number;
  leads?: any;
  siteVisits?: any;
  legalVault?: any;
  reason?: string;
}) {
  try {
    const session = await requirePermission("SETTINGS_MANAGE");
    let version = params.currentVersion;

    if (params.leads) {
      const res = await SettingsService.updateSettingsSection({
        sectionKey: "leads",
        currentVersion: version,
        data: params.leads,
        reason: params.reason,
        session,
      });
      version = res.settingsVersion;
    }

    if (params.siteVisits) {
      const res = await SettingsService.updateSettingsSection({
        sectionKey: "siteVisits",
        currentVersion: version,
        data: params.siteVisits,
        reason: params.reason,
        session,
      });
      version = res.settingsVersion;
    }

    if (params.legalVault) {
      const res = await SettingsService.updateSettingsSection({
        sectionKey: "legalVault",
        currentVersion: version,
        data: params.legalVault,
        reason: params.reason,
        session,
      });
      version = res.settingsVersion;
    }

    safeRevalidate("/dashboard/settings");
    safeRevalidate("/dashboard/settings/business");

    return {
      success: true as const,
      version,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to update business settings.",
    };
  }
}

/**
 * Update Security Settings
 */
export async function updateSecuritySettingsAction(params: {
  currentVersion: number;
  data: any;
  reason?: string;
}) {
  try {
    const session = await requirePermission("SETTINGS_MANAGE");
    const settings = await SettingsService.updateSettingsSection({
      sectionKey: "security",
      currentVersion: params.currentVersion,
      data: params.data,
      reason: params.reason,
      session,
    });

    safeRevalidate("/dashboard/settings");
    safeRevalidate("/dashboard/settings/security");

    return {
      success: true as const,
      version: settings.settingsVersion,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to update security settings.",
    };
  }
}

/**
 * Create a new Custom Role
 */
export async function createCustomRoleAction(params: {
  roleKey: string;
  displayName: string;
  description: string;
  permissionKeys: string[];
  defaultDataScope?: string;
}) {
  try {
    const session = await requirePermission("ROLES_MANAGE");
    await connectToDatabase();

    // 1. Dependency validation
    const depCheck = validatePermissionDependencies(params.permissionKeys);
    if (!depCheck.isValid) {
      throw new Error(`INVALID_DEPENDENCIES: Missing required dependencies: ${depCheck.missingDependencies.map((d) => `${d.permission} requires ${d.requires}`).join(", ")}`);
    }

    const roleKey = params.roleKey.toUpperCase().trim().replace(/[^A-Z0-9_]/g, "_");
    const existing = await Role.findOne({ roleKey });
    if (existing) {
      throw new Error(`CONFLICT: A role with key "${roleKey}" already exists.`);
    }

    const role = await Role.create({
      roleKey,
      displayName: params.displayName.trim(),
      description: params.description.trim(),
      roleType: "CUSTOM",
      permissionKeys: params.permissionKeys,
      defaultDataScope: (params.defaultDataScope as any) || "ALL_ORGANIZATION",
      isSystemRole: false,
      isActive: true,
      version: 1,
      createdBy: session.user.id,
    });

    await logAuditEvent({
      actor: session.user,
      action: "CUSTOM_ROLE_CREATED",
      reason: `Created custom role ${params.displayName} (${roleKey}) with ${params.permissionKeys.length} permissions.`,
    });

    safeRevalidate("/dashboard/settings/roles");

    return {
      success: true as const,
      roleId: (role as any)._id.toString(),
      roleKey: (role as any).roleKey,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to create custom role.",
    };
  }
}

/**
 * Archive a custom role (only if not assigned to active members)
 */
export async function archiveCustomRoleAction(roleKey: string) {
  try {
    const session = await requirePermission("ROLES_MANAGE");
    await connectToDatabase();

    const role = await Role.findOne({ roleKey });
    if (!role) {
      throw new Error("NOT_FOUND: Role not found.");
    }

    if (role.isSystemRole) {
      throw new Error("FORBIDDEN: Protected system roles cannot be archived or deleted.");
    }

    const activeMembersCount = await TeamMember.countDocuments({ roleKey, status: "ACTIVE" });
    if (activeMembersCount > 0) {
      throw new Error(`CONFLICT: Cannot archive role "${role.displayName}" because it is currently assigned to ${activeMembersCount} active team member(s).`);
    }

    role.isActive = false;
    role.version += 1;
    await role.save();

    await logAuditEvent({
      actor: session.user,
      action: "CUSTOM_ROLE_ARCHIVED",
      reason: `Archived custom role ${role.displayName} (${role.roleKey})`,
    });

    safeRevalidate("/dashboard/settings/roles");

    return { success: true as const };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to archive custom role.",
    };
  }
}

/**
 * Roll back settings to a previous version from SettingsChange history
 */
export async function rollbackSettingsAction(changeId: string) {
  try {
    const session = await requirePermission("SETTINGS_MANAGE");
    const settings = await SettingsService.rollbackSettings(changeId, session);

    safeRevalidate("/dashboard/settings");
    safeRevalidate("/dashboard/settings/history");

    return {
      success: true as const,
      version: settings.settingsVersion,
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error?.message || "Failed to roll back settings.",
    };
  }
}
