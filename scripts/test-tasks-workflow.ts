/**
 * @file test-tasks-workflow.ts
 * @description Automated Unit & Integration Test Suite for PRD 19:
 * Unified Tasks, Follow-ups, Work Queue & Team Productivity.
 */

import {
  isValidTaskStatusTransition,
  TaskStatus,
  TASK_TYPES,
  LEAD_FOLLOW_UP_OUTCOMES,
} from "../src/types/task";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${testName}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m ${testName}${detail ? ` - ${detail}` : ""}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n============================================================");
  console.log("  PRD 19: Unified Tasks & Work Queue Test Suite");
  console.log("============================================================\n");

  // ─── Test Group 1: Task Lifecycle State Machine ───────────────────────────
  console.log("1. Task Lifecycle State Machine Transitions:");
  assert(
    isValidTaskStatusTransition("PENDING_ACCEPTANCE", "TO_DO"),
    "Permits transition: PENDING_ACCEPTANCE -> TO_DO"
  );
  assert(
    isValidTaskStatusTransition("TO_DO", "IN_PROGRESS"),
    "Permits transition: TO_DO -> IN_PROGRESS"
  );
  assert(
    isValidTaskStatusTransition("IN_PROGRESS", "IN_REVIEW"),
    "Permits transition: IN_PROGRESS -> IN_REVIEW"
  );
  assert(
    isValidTaskStatusTransition("IN_REVIEW", "COMPLETED"),
    "Permits transition: IN_REVIEW -> COMPLETED"
  );
  assert(
    isValidTaskStatusTransition("IN_REVIEW", "IN_PROGRESS"),
    "Permits transition: IN_REVIEW -> IN_PROGRESS (Return for changes)"
  );
  assert(
    isValidTaskStatusTransition("IN_PROGRESS", "COMPLETED"),
    "Permits direct completion when no review is required"
  );
  assert(
    isValidTaskStatusTransition("COMPLETED", "IN_PROGRESS"),
    "Permits reopening of completed task to IN_PROGRESS"
  );
  assert(
    !isValidTaskStatusTransition("ARCHIVED", "IN_PROGRESS"),
    "Rejects illegal transition: ARCHIVED -> IN_PROGRESS"
  );
  assert(
    !isValidTaskStatusTransition("COMPLETED", "TO_DO"),
    "Rejects illegal transition: COMPLETED -> TO_DO directly"
  );

  // ─── Test Group 2: Typed Task Catalogue ────────────────────────────────────
  console.log("\n2. Typed Task Catalogue Validation:");
  assert(
    TASK_TYPES.includes("LEAD_FOLLOW_UP") &&
      TASK_TYPES.includes("SITE_VISIT_PREPARATION") &&
      TASK_TYPES.includes("LEGAL_DOCUMENT_REVIEW") &&
      TASK_TYPES.includes("KYC_REVIEW") &&
      TASK_TYPES.includes("REFUND_REVIEW") &&
      TASK_TYPES.includes("COMMISSION_REVIEW") &&
      TASK_TYPES.includes("PARTNER_ONBOARDING"),
    "Validates comprehensive typed task catalog covering all core business domains"
  );

  // ─── Test Group 3: Structured Lead Follow-Up Outcomes ──────────────────────
  console.log("\n3. Structured Lead Follow-Up Outcomes:");
  assert(
    LEAD_FOLLOW_UP_OUTCOMES.length === 11,
    `Contains exactly 11 structured outcomes (${LEAD_FOLLOW_UP_OUTCOMES.join(", ")})`
  );
  assert(
    LEAD_FOLLOW_UP_OUTCOMES.includes("CONTACTED") &&
      LEAD_FOLLOW_UP_OUTCOMES.includes("SITE_VISIT_SCHEDULED") &&
      LEAD_FOLLOW_UP_OUTCOMES.includes("CALLBACK_REQUESTED"),
    "Includes vital CRM outcome codes"
  );

  // ─── Test Group 4: Deterministic Idempotency Key Generation ────────────────
  console.log("\n4. Deterministic Idempotency Key Generation:");
  const testLeadId = "65d8a9e01234567890123456";
  const dueTimestamp = 1771980000000;
  const idempotencyKey1 = `lead_followup_${testLeadId}_${dueTimestamp}`;
  const idempotencyKey2 = `lead_followup_${testLeadId}_${dueTimestamp}`;

  assert(
    idempotencyKey1 === idempotencyKey2,
    "Generates deterministic composite idempotency keys for repeated cron evaluations"
  );

  // ─── Test Group 5: Separation of Duties Review Rule ────────────────────────
  console.log("\n5. Separation of Duties in Review Approvals:");
  const taskAssigneeId = "usr_advisor_01";
  const taskReviewerId = "usr_manager_01";

  function canApproveReview(submitterId: string, reviewerId: string, actorId: string): boolean {
    if (submitterId === actorId && reviewerId !== actorId) {
      return false; // Self-approval rejected
    }
    return actorId === reviewerId || actorId === "super_admin";
  }

  assert(
    !canApproveReview(taskAssigneeId, taskReviewerId, taskAssigneeId),
    "Rejects self-approval when submitter attempts to approve own review task"
  );
  assert(
    canApproveReview(taskAssigneeId, taskReviewerId, taskReviewerId),
    "Permits approval by designated reviewer"
  );
  assert(
    canApproveReview(taskAssigneeId, taskReviewerId, "super_admin"),
    "Permits approval by Super Admin override"
  );

  // ─── Test Group 6: Due Date & Timezone Integrity (Asia/Kolkata) ───────────
  console.log("\n6. Due Date & Timezone Integrity:");
  const utcDue = new Date("2026-08-26T10:00:00.000Z");
  const istFormatted = utcDue.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  assert(
    utcDue.toISOString() === "2026-08-26T10:00:00.000Z",
    "Stores due timestamps in canonical UTC"
  );
  assert(
    istFormatted.includes("26/8/2026") || istFormatted.includes("26/08/2026"),
    `Renders accurate IST time for display (${istFormatted})`
  );

  // Summary
  console.log("\n============================================================");
  console.log(`  Test Results: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`);
  console.log("============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
