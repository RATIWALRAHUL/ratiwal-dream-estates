import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { OrganizationSettings, IOrganizationSettings } from "@/models/OrganizationSettings";
import { SettingsChange } from "@/models/SettingsChange";
import { AdminSession } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/services/audit.service";
import { PermissionService } from "./permission.service";
import {
  GeneralSettings,
  RegionalSettings,
  LeadCrmSettings,
  SiteVisitSettings,
  LegalVaultSettings,
  SecuritySettings,
  IntegrationStatusSummary,
} from "@/types/settings-team";
import { logger } from "@/lib/logger";

export class SettingsService {
  /**
   * Retrieves or initializes singleton organization settings
   */
  static async getSettings(): Promise<IOrganizationSettings> {
    await connectToDatabase();
    let settings = await OrganizationSettings.findOne({ settingsKey: "GLOBAL_SETTINGS" });

    if (!settings) {
      settings = await OrganizationSettings.create({
        settingsKey: "GLOBAL_SETTINGS",
        settingsVersion: 1,
      });
      logger.info("[SettingsService] Initialized default organization settings singleton.");
    }

    return settings;
  }

  /**
   * Update a specific section of settings with optimistic locking and audit logging
   */
  static async updateSettingsSection<T extends "general" | "regional" | "leads" | "siteVisits" | "legalVault" | "security">(params: {
    sectionKey: T;
    currentVersion: number;
    data: Partial<IOrganizationSettings[T]>;
    reason?: string;
    session: AdminSession;
  }): Promise<IOrganizationSettings> {
    await connectToDatabase();

    // 1. Permission check
    const canManage = await PermissionService.userHasPermission(params.session.user, "SETTINGS_MANAGE");
    if (!canManage && params.session.user.role !== "SUPER_ADMIN") {
      throw new Error("FORBIDDEN: Insufficient permissions to modify organization settings.");
    }

    const settings = await this.getSettings();

    // 2. Optimistic concurrency check
    if (settings.settingsVersion !== params.currentVersion) {
      throw new Error("CONFLICT: Settings were modified concurrently by another administrator. Please reload.");
    }

    const sectionEnumMap: Record<string, "GENERAL" | "REGIONAL" | "LEADS" | "SITE_VISITS" | "LEGAL_VAULT" | "SECURITY"> = {
      general: "GENERAL",
      regional: "REGIONAL",
      leads: "LEADS",
      siteVisits: "SITE_VISITS",
      legalVault: "LEGAL_VAULT",
      security: "SECURITY",
    };

    const previousSnapshot = JSON.parse(JSON.stringify(settings[params.sectionKey]));
    const newSnapshot = { ...previousSnapshot, ...params.data };

    // Apply update
    (settings as any)[params.sectionKey] = newSnapshot;
    settings.settingsVersion += 1;
    settings.updatedBy = params.session.user.id;
    await settings.save();

    // Append to SettingsChange audit log
    await SettingsChange.create({
      settingsSection: sectionEnumMap[params.sectionKey],
      previousSnapshot,
      newSnapshot,
      changedFieldKeys: Object.keys(params.data),
      versionBefore: params.currentVersion,
      versionAfter: settings.settingsVersion,
      actorId: params.session.user.id,
      actorEmail: params.session.user.email,
      reason: params.reason?.trim() || `Updated ${params.sectionKey} settings section`,
      isRollback: false,
    });

    await logAuditEvent({
      actor: params.session.user,
      action: "SETTINGS_UPDATED",
      reason: `Updated ${params.sectionKey} settings to version ${settings.settingsVersion}`,
    });

    return settings;
  }

  /**
   * Safe rollback to a previous version from SettingsChange history
   */
  static async rollbackSettings(changeId: string, session: AdminSession): Promise<IOrganizationSettings> {
    await connectToDatabase();

    if (session.user.role !== "SUPER_ADMIN") {
      throw new Error("FORBIDDEN: Only Super Administrators can roll back system settings.");
    }

    const change = await SettingsChange.findById(changeId);
    if (!change) {
      throw new Error("NOT_FOUND: Settings change record not found.");
    }

    const settings = await this.getSettings();
    const sectionMap: Record<string, "general" | "regional" | "leads" | "siteVisits" | "legalVault" | "security"> = {
      GENERAL: "general",
      REGIONAL: "regional",
      LEADS: "leads",
      SITE_VISITS: "siteVisits",
      LEGAL_VAULT: "legalVault",
      SECURITY: "security",
    };

    const sectionProp = sectionMap[change.settingsSection];
    if (!sectionProp) {
      throw new Error("BAD_REQUEST: Cannot roll back unknown section.");
    }

    const previousSnapshot = JSON.parse(JSON.stringify(settings[sectionProp]));
    const rollbackSnapshot = change.previousSnapshot;

    (settings as any)[sectionProp] = rollbackSnapshot;
    settings.settingsVersion += 1;
    settings.updatedBy = session.user.id;
    await settings.save();

    await SettingsChange.create({
      settingsSection: change.settingsSection,
      previousSnapshot,
      newSnapshot: rollbackSnapshot,
      changedFieldKeys: Object.keys(rollbackSnapshot),
      versionBefore: settings.settingsVersion - 1,
      versionAfter: settings.settingsVersion,
      actorId: session.user.id,
      actorEmail: session.user.email,
      reason: `Rolled back ${sectionProp} settings to version ${change.versionBefore}`,
      isRollback: true,
    });

    await logAuditEvent({
      actor: session.user,
      action: "SETTINGS_ROLLED_BACK",
      reason: `Rolled back ${sectionProp} settings from change ${change._id}`,
    });

    return settings;
  }

  /**
   * Returns secret-safe read-only integration health status
   */
  static getIntegrationStatuses(): IntegrationStatusSummary[] {
    const hasResend = Boolean(process.env.RESEND_API_KEY);
    const hasImageKit = Boolean(process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY);
    const hasMongo = Boolean(process.env.MONGODB_URI);
    const hasGoogleMaps = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY);

    return [
      {
        providerKey: "resend_email",
        displayName: "Resend Email Service",
        category: "EMAIL",
        status: hasResend ? "CONFIGURED" : "NOT_CONFIGURED",
        safeDescription: hasResend
          ? "Live transactional email delivery configured via Resend API."
          : "API key not configured; outgoing emails are simulated locally.",
        lastCheckedAt: new Date().toISOString(),
      },
      {
        providerKey: "imagekit_storage",
        displayName: "ImageKit Media & Storage",
        category: "STORAGE",
        status: hasImageKit ? "CONFIGURED" : "NOT_CONFIGURED",
        safeDescription: hasImageKit
          ? "Cloud media storage and CDN optimization active."
          : "Private storage fallback active.",
        lastCheckedAt: new Date().toISOString(),
      },
      {
        providerKey: "mongodb_atlas",
        displayName: "MongoDB Atlas Primary Database",
        category: "DATABASE",
        status: hasMongo ? "CONFIGURED" : "NOT_CONFIGURED",
        safeDescription: "MongoDB replica set connection active with Mongoose singleton.",
        lastCheckedAt: new Date().toISOString(),
      },
      {
        providerKey: "whatsapp_business",
        displayName: "WhatsApp Business API",
        category: "MESSAGING",
        status: "SIMULATOR",
        safeDescription: "Test simulator active. Webhooks and templates ready for provider binding.",
        lastCheckedAt: new Date().toISOString(),
      },
      {
        providerKey: "google_maps",
        displayName: "Google Maps Platform",
        category: "MAPS",
        status: hasGoogleMaps ? "CONFIGURED" : "NOT_CONFIGURED",
        safeDescription: hasGoogleMaps
          ? "Interactive micro-market location maps and road distance matrix configured."
          : "Demo map mode active.",
        lastCheckedAt: new Date().toISOString(),
      },
    ];
  }
}
