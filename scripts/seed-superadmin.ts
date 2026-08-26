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

import { connectToDatabase } from "../src/lib/db/mongoose";
import { AdminAuthAccount } from "../src/models/AdminAuthAccount";
import { TeamMember } from "../src/models/TeamMember";
import { DashboardAuthService } from "../src/lib/services/dashboard-auth.service";

async function seedSuperAdmin() {
  console.log("=================================================");
  console.log("   SEEDING SUPER ADMIN ACCOUNT                   ");
  console.log("=================================================\n");

  const email = "rahulkumawat1408@gmail.com".toLowerCase().trim();
  const rawPassword = "ratiwaldreamestate";
  const fullName = "Rahul Kumawat";

  try {
    await connectToDatabase();
    console.log("Connected to MongoDB successfully.\n");

    const salt = DashboardAuthService.generateSalt();
    const passwordHash = DashboardAuthService.hashPassword(rawPassword, salt);

    // 1. Upsert Team Member
    let teamMember = await TeamMember.findOne({ email });
    if (!teamMember) {
      const refSuffix = Math.floor(100000 + Math.random() * 900000);
      teamMember = await TeamMember.create({
        memberReference: `RDE-MEM-${refSuffix}`,
        fullName,
        email,
        phoneMasked: "+91 98*** ***45",
        jobTitle: "Principal / Super Administrator",
        department: "MANAGEMENT",
        roleKey: "SUPER_ADMIN",
        dataScope: "ALL_ORGANIZATION",
        assignedPropertyIds: [],
        assignedLocationIds: [],
        status: "ACTIVE",
        version: 1,
        createdBy: "SYSTEM_SEED",
      });
      console.log(`✓ Created TeamMember record: ${teamMember.memberReference} (${teamMember.fullName})`);
    } else {
      teamMember.fullName = fullName;
      teamMember.roleKey = "SUPER_ADMIN";
      teamMember.dataScope = "ALL_ORGANIZATION";
      teamMember.status = "ACTIVE";
      await teamMember.save();
      console.log(`✓ Updated TeamMember record: ${teamMember.memberReference} (${teamMember.fullName})`);
    }

    // 2. Upsert AdminAuthAccount
    let account = await AdminAuthAccount.findOne({ email });
    if (!account) {
      account = await AdminAuthAccount.create({
        email,
        phone: "+919829012345",
        phoneNormalized: "+919829012345",
        passwordHash,
        passwordSalt: salt,
        name: fullName,
        role: "SUPER_ADMIN",
        isActive: true,
        mfaEnabled: false,
        failedLoginAttempts: 0,
        teamMemberId: teamMember._id,
      });
      console.log(`✓ Created AdminAuthAccount: ${account.email} (Role: ${account.role})`);
    } else {
      account.name = fullName;
      account.passwordHash = passwordHash;
      account.passwordSalt = salt;
      account.role = "SUPER_ADMIN";
      account.isActive = true;
      account.failedLoginAttempts = 0;
      account.lockUntil = undefined;
      account.teamMemberId = teamMember._id;
      await account.save();
      console.log(`✓ Updated AdminAuthAccount: ${account.email} (Role: ${account.role})`);
    }

    // Link teamMember userId to account ID
    teamMember.userId = account._id.toString();
    await teamMember.save();

    console.log("\n=================================================");
    console.log("   SUPER ADMIN SEEDED SUCCESSFULLY!              ");
    console.log("=================================================");
    console.log(`Email:    ${email}`);
    console.log(`Password: ${rawPassword}`);
    console.log(`Role:     SUPER_ADMIN`);
    console.log(`Status:   ACTIVE`);
    console.log("=================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding Super Admin:", error);
    process.exit(1);
  }
}

seedSuperAdmin();
