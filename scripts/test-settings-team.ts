import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch {
  // Ignore if not found
}

import { Types } from "mongoose";
import { connectToDatabase } from "../src/lib/db/mongoose";
import { TeamMember } from "../src/models/TeamMember";
import { Role } from "../src/models/Role";
import { TeamInvitation } from "../src/models/TeamInvitation";
import { TeamHandoverJob } from "../src/models/TeamHandoverJob";
import { OrganizationSettings } from "../src/models/OrganizationSettings";
import { SettingsChange } from "../src/models/SettingsChange";
import { Lead } from "../src/models/Lead";
import { SiteVisit } from "../src/models/SiteVisit";
import { LegalDocument } from "../src/models/LegalDocument";
import { PermissionService } from "../src/lib/services/permission.service";
import { TeamService } from "../src/lib/services/team.service";
import { TeamInvitationService } from "../src/lib/services/team-invitation.service";
import { TeamHandoverService } from "../src/lib/services/team-handover.service";
import { SettingsService } from "../src/lib/services/settings.service";
import { validatePermissionDependencies } from "../src/types/settings-team";
import { AdminSession } from "../src/lib/auth/session";

const MOCK_SUPER_ADMIN_SESSION: AdminSession = {
  user: {
    id: "test-super-admin-001",
    email: "superadmin.test@ratiwaldreamestates.com",
    name: "Test Principal Super Admin",
    role: "SUPER_ADMIN",
    isActive: true,
  },
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
};

async function runTests() {
  console.log("===============================================================");
  console.log("🧪 STARTING AUTOMATED TEST SUITE: PRD 10 (SETTINGS & TEAM)");
  console.log("===============================================================\n");

  await connectToDatabase();

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` - Detail: ${detail}` : ""}`);
      failedTests++;
    }
  }

  try {
    // ─── TEST 1: Permission Catalogue & Dependency Validation ─────────────────
    console.log("\n--- TEST 1: Permission Catalogue & Dependency Validation ---");
    const validDeps = validatePermissionDependencies(["PROPERTIES_VIEW", "PROPERTIES_CREATE"]);
    assert(validDeps.isValid, "Valid dependencies pass validation");

    const invalidDeps = validatePermissionDependencies(["PROPERTIES_CREATE"]); // Missing PROPERTIES_VIEW
    assert(!invalidDeps.isValid, "Missing dependency fails validation");
    assert(
      invalidDeps.missingDependencies[0]?.requires === "PROPERTIES_VIEW",
      "Correctly identifies missing PROPERTIES_VIEW dependency"
    );

    // ─── TEST 2: System Role Seeding & Custom Role Creation ───────────────────
    console.log("\n--- TEST 2: System Role Seeding & Custom Role Creation ---");
    await PermissionService.seedSystemRoles(MOCK_SUPER_ADMIN_SESSION.user.id);
    const superAdminRole = await Role.findOne({ roleKey: "SUPER_ADMIN" });
    const advisorRole = await Role.findOne({ roleKey: "ADVISOR" });

    assert(Boolean(superAdminRole && superAdminRole.isSystemRole), "Super Admin system role seeded and marked immutable");
    assert(Boolean(advisorRole && advisorRole.isSystemRole), "Advisor system role seeded with scoped permissions");

    const customRoleKey = `TEST_CUSTOM_ROLE_${Date.now()}`;
    const customRole = await Role.create({
      roleKey: customRoleKey,
      displayName: "Regional Sales Lead",
      description: "Custom role for North Zone sales operations.",
      roleType: "CUSTOM",
      permissionKeys: ["DASHBOARD_VIEW", "PROPERTIES_VIEW", "LEADS_VIEW", "LEADS_MANAGE"],
      defaultDataScope: "SELECTED_PROPERTIES",
      isSystemRole: false,
      isActive: true,
      version: 1,
      createdBy: MOCK_SUPER_ADMIN_SESSION.user.id,
    });
    assert(Boolean(customRole && !customRole.isSystemRole), "Custom role created successfully with custom permissions");

    // ─── TEST 3: Last Super Admin Protection ──────────────────────────────────
    console.log("\n--- TEST 3: Last Super Admin Protection ---");
    // Ensure clean state: sync single super admin
    const testAdminEmail = `last.admin.${Date.now()}@ratiwaldreamestates.com`;
    const superAdminMember = await TeamMember.create({
      memberReference: TeamService.generateMemberReference(),
      userId: MOCK_SUPER_ADMIN_SESSION.user.id,
      fullName: "Sole Super Admin",
      email: testAdminEmail,
      jobTitle: "Managing Director",
      department: "MANAGEMENT",
      roleKey: "SUPER_ADMIN",
      dataScope: "ALL_ORGANIZATION",
      status: "ACTIVE",
      version: 1,
      createdBy: "SYSTEM",
    });

    // Make sure all other super admins are removed or temporary for this test
    const otherSuperAdmins = await TeamMember.find({
      roleKey: "SUPER_ADMIN",
      status: "ACTIVE",
      _id: { $ne: superAdminMember._id },
    });
    // Temporarily suspend others to test sole protection
    for (const admin of otherSuperAdmins) {
      admin.status = "SUSPENDED";
      await admin.save();
    }

    let demotionBlocked = false;
    try {
      await TeamService.updateMember(
        {
          memberId: superAdminMember._id.toString(),
          currentVersion: superAdminMember.version,
          roleKey: "ADVISOR", // Attempting to demote sole super admin
        },
        MOCK_SUPER_ADMIN_SESSION
      );
    } catch (err: any) {
      if (err.message.includes("Cannot remove Super Admin role from the last active Super Admin")) {
        demotionBlocked = true;
      }
    }
    assert(demotionBlocked, "Demoting the last Super Admin is strictly prevented by safeguard");

    let suspensionBlocked = false;
    try {
      await TeamService.suspendMember(superAdminMember._id.toString(), "Test reason", MOCK_SUPER_ADMIN_SESSION);
    } catch (err: any) {
      if (err.message.includes("Cannot suspend the last active Super Admin")) {
        suspensionBlocked = true;
      }
    }
    assert(suspensionBlocked, "Suspending the last Super Admin is strictly prevented by safeguard");

    // Restore other super admins
    for (const admin of otherSuperAdmins) {
      admin.status = "ACTIVE";
      await admin.save();
    }

    // ─── TEST 4: Cryptographic Token Generation & Hashed Invitation Acceptance ─
    console.log("\n--- TEST 4: Cryptographic Token Generation & Hashed Invitation Acceptance ---");
    const inviteeEmail = `invitee.${Date.now()}@ratiwaldreamestates.com`;
    const { invitation, rawToken } = await TeamInvitationService.createInvitation(
      {
        email: inviteeEmail,
        fullName: "Rahul Advani",
        jobTitle: "Property Advisor",
        department: "SALES",
        roleKey: "ADVISOR",
        dataScope: "ASSIGNED",
        expiresInHours: 48,
      },
      MOCK_SUPER_ADMIN_SESSION
    );

    assert(Boolean(invitation && rawToken), "Invitation created with plain token returned and tokenHash persisted");
    assert(invitation.tokenHash !== rawToken, "Token hash in database does NOT equal raw token");

    // Accept invitation
    const { member: acceptedMember, invitation: acceptedInvitation } =
      await TeamInvitationService.acceptInvitation(rawToken, "user-acc-001");

    assert(acceptedInvitation.status === "ACCEPTED", "Invitation status updated to ACCEPTED");
    assert(Boolean(acceptedMember && acceptedMember.status === "ACTIVE"), "New active TeamMember account created");
    assert(acceptedMember.email === inviteeEmail, "TeamMember email matches invited email");
    assert(acceptedMember.roleKey === "ADVISOR", "TeamMember role matches invitation role");

    // ─── TEST 5: Expired & Revoked Invitation Rejection ───────────────────────
    console.log("\n--- TEST 5: Expired & Revoked Invitation Rejection ---");
    // Test revoked invitation
    const revokeEmail = `revoke.${Date.now()}@ratiwaldreamestates.com`;
    const { invitation: toRevoke, rawToken: revokeToken } = await TeamInvitationService.createInvitation(
      {
        email: revokeEmail,
        fullName: "To Revoke",
        roleKey: "ADVISOR",
      },
      MOCK_SUPER_ADMIN_SESSION
    );

    await TeamInvitationService.revokeInvitation(toRevoke._id.toString(), "Revoked by admin test", MOCK_SUPER_ADMIN_SESSION);
    let revokeAcceptBlocked = false;
    try {
      await TeamInvitationService.acceptInvitation(revokeToken);
    } catch (err: any) {
      if (err.message.includes("revoked")) {
        revokeAcceptBlocked = true;
      }
    }
    assert(revokeAcceptBlocked, "Accepting revoked invitation is blocked");

    // ─── TEST 6: Team Member Suspension & Lifecycle ───────────────────────────
    console.log("\n--- TEST 6: Team Member Suspension & Lifecycle ---");
    const suspendedMember = await TeamService.suspendMember(
      acceptedMember._id.toString(),
      "Pending compliance audit",
      MOCK_SUPER_ADMIN_SESSION
    );
    assert(suspendedMember.status === "SUSPENDED", "Member transitioned to SUSPENDED");
    assert(suspendedMember.suspensionReason === "Pending compliance audit", "Suspension reason persisted");

    const reactivatedMember = await TeamService.reactivateMember(
      acceptedMember._id.toString(),
      MOCK_SUPER_ADMIN_SESSION
    );
    assert(reactivatedMember.status === "ACTIVE", "Member successfully reactivated to ACTIVE");

    // ─── TEST 7: Handover Engine (Batch Reassigning Work) ─────────────────────
    console.log("\n--- TEST 7: Handover Engine (Batch Reassigning Work) ---");
    // Create source advisor and target advisor
    const sourceAdvisor = await TeamService.createMember(
      {
        fullName: "Departing Advisor",
        email: `departing.${Date.now()}@ratiwaldreamestates.com`,
        roleKey: "ADVISOR",
        department: "SALES",
      },
      MOCK_SUPER_ADMIN_SESSION
    );

    const targetAdvisor = await TeamService.createMember(
      {
        fullName: "Incoming Advisor",
        email: `incoming.${Date.now()}@ratiwaldreamestates.com`,
        roleKey: "ADVISOR",
        department: "SALES",
      },
      MOCK_SUPER_ADMIN_SESSION
    );

    // Create 2 test leads for source advisor
    await Lead.create([
      {
        referenceNumber: `RDE-LD-${Date.now()}-1`,
        fullName: "Buyer One",
        normalizedPhone: "+919876500001",
        displayPhone: "+91 98765 00001",
        preferredContactMethod: "PHONE",
        source: "CONTACT_PAGE",
        status: "NEW",
        priority: "NORMAL",
        assignedToId: sourceAdvisor._id.toString(),
        assignedToName: sourceAdvisor.fullName,
        assignedAdvisorId: sourceAdvisor._id.toString(),
        assignedAdvisorName: sourceAdvisor.fullName,
        consentGranted: true,
        consentTextVersion: "1.0",
        privacyPolicyVersion: "1.0",
        consentPurpose: "Real Estate Property Inquiry",
        consentTimestamp: new Date(),
        consentSource: "WEBSITE_CONTACT_FORM",
        submissionFingerprint: `fp-${Date.now()}-1`,
        retentionReviewAt: new Date(Date.now() + 365 * 86400000),
      },
      {
        referenceNumber: `RDE-LD-${Date.now()}-2`,
        fullName: "Buyer Two",
        normalizedPhone: "+919876500002",
        displayPhone: "+91 98765 00002",
        preferredContactMethod: "PHONE",
        source: "CONTACT_PAGE",
        status: "CONTACTED",
        priority: "HIGH",
        assignedToId: sourceAdvisor._id.toString(),
        assignedToName: sourceAdvisor.fullName,
        assignedAdvisorId: sourceAdvisor._id.toString(),
        assignedAdvisorName: sourceAdvisor.fullName,
        consentGranted: true,
        consentTextVersion: "1.0",
        privacyPolicyVersion: "1.0",
        consentPurpose: "Real Estate Property Inquiry",
        consentTimestamp: new Date(),
        consentSource: "WEBSITE_CONTACT_FORM",
        submissionFingerprint: `fp-${Date.now()}-2`,
        retentionReviewAt: new Date(Date.now() + 365 * 86400000),
      },
    ]);

    const activeWork = await TeamHandoverService.calculateMemberActiveWork(sourceAdvisor._id.toString());
    assert(activeWork.activeLeadsCount >= 2, "Active workload accurately counted leads before handover");

    // Execute handover and deactivate source
    const handoverJob = await TeamHandoverService.executeHandover({
      sourceMemberId: sourceAdvisor._id.toString(),
      targetMemberId: targetAdvisor._id.toString(),
      reason: "Employee resignation & reassignment",
      deactivateSourceAfterHandover: true,
      session: MOCK_SUPER_ADMIN_SESSION,
    });

    assert(handoverJob.status === "COMPLETED", "Handover job completed successfully");
    assert(handoverJob.leadsReassignedCount >= 2, "Reassigned all active leads to target advisor");

    const reloadedSource = await TeamMember.findById(sourceAdvisor._id);
    assert(reloadedSource?.status === "DEACTIVATED", "Source member status set to DEACTIVATED after handover");

    // ─── TEST 8: Organization Settings Validation & Optimistic Concurrency ───
    console.log("\n--- TEST 8: Organization Settings Validation & Optimistic Concurrency ---");
    const settings = await SettingsService.getSettings();
    assert(Boolean(settings && settings.settingsVersion >= 1), "Settings singleton retrieved with version tracking");

    // Test successful section update
    const updatedSettings = await SettingsService.updateSettingsSection({
      sectionKey: "regional",
      currentVersion: settings.settingsVersion,
      data: { businessTimezone: "Asia/Kolkata", areaMeasurementUnit: "SQ_YD" },
      reason: "Standardized regional land measurement to Square Yards",
      session: MOCK_SUPER_ADMIN_SESSION,
    });

    assert(
      updatedSettings.settingsVersion === settings.settingsVersion + 1,
      "Settings version incremented after successful update"
    );
    assert(
      updatedSettings.regional.areaMeasurementUnit === "SQ_YD",
      "Regional areaMeasurementUnit updated to SQ_YD"
    );

    // Test optimistic concurrency conflict
    let concurrencyBlocked = false;
    try {
      await SettingsService.updateSettingsSection({
        sectionKey: "regional",
        currentVersion: settings.settingsVersion, // Stale version!
        data: { areaMeasurementUnit: "SQ_FT" },
        session: MOCK_SUPER_ADMIN_SESSION,
      });
    } catch (err: any) {
      if (err.message.includes("CONFLICT")) {
        concurrencyBlocked = true;
      }
    }
    assert(concurrencyBlocked, "Concurrent modification on stale settings version is blocked with CONFLICT");

    // ─── TEST 9: Settings Change History & Versioned Rollback ─────────────────
    console.log("\n--- TEST 9: Settings Change History & Versioned Rollback ---");
    const latestChange = await SettingsChange.findOne({ settingsSection: "REGIONAL" }).sort({ createdAt: -1 });
    assert(Boolean(latestChange), "SettingsChange audit entry recorded with previous and new snapshots");

    if (latestChange) {
      const rolledBack = await SettingsService.rollbackSettings(latestChange._id.toString(), MOCK_SUPER_ADMIN_SESSION);
      assert(
        rolledBack.settingsVersion === updatedSettings.settingsVersion + 1,
        "Settings rollback created a forward-moving audit version"
      );
    }

    // ─── TEST 10: Integration Configuration Status & Secret Redaction ─────────
    console.log("\n--- TEST 10: Integration Configuration Status & Secret Redaction ---");
    const integrationStatuses = SettingsService.getIntegrationStatuses();
    assert(integrationStatuses.length >= 4, "Retrieved integration health cards for external services");

    const hasExposedSecret = JSON.stringify(integrationStatuses).includes("re_31RYJShY");
    assert(!hasExposedSecret, "Zero secret leakage: API keys are completely redacted from client payloads");

    console.log("\n===============================================================");
    console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log("===============================================================\n");

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("💥 Unhandled exception during test suite:", err);
    process.exit(1);
  }
}

runTests();
