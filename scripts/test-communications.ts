import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load environment variables from .env.local if present in CLI environment
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
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {
  // Ignore
}

import { connectToDatabase } from "../src/lib/db/mongoose";
import { NotificationOutbox } from "../src/models/NotificationOutbox";
import { NotificationDelivery } from "../src/models/NotificationDelivery";
import { InAppNotification } from "../src/models/InAppNotification";
import { CommunicationConsent } from "../src/models/CommunicationConsent";
import { WebhookReceipt } from "../src/models/WebhookReceipt";
import { OutboxService } from "../src/lib/communications/services/outbox.service";
import { NotificationProcessorService } from "../src/lib/communications/services/processor.service";
import { ConsentService } from "../src/lib/communications/services/consent.service";
import { CommunicationService } from "../src/lib/services/communication.service";
import { Types } from "mongoose";

async function runTests() {
  console.log("================================================================================");
  console.log("PRD 9: Transactional Notifications & Communication Automation Test Suite");
  console.log("================================================================================\n");

  await connectToDatabase();
  console.log("✓ Connected to MongoDB for testing.");

  const testAggregateId = new Types.ObjectId();

  // ── TEST 1: Idempotent Outbox Enqueueing & In-App Creation ──────────────────
  console.log("\n[TEST 1] Testing Idempotent Outbox Enqueueing...");
  const enqueueResult1 = await OutboxService.enqueue({
    eventType: "INQUIRY_RECEIVED_CUSTOMER",
    aggregateType: "LEAD",
    aggregateId: testAggregateId,
    aggregateVersion: 1,
    recipientType: "CUSTOMER",
    recipientEmail: "rahulkumawat1408@gmail.com",
    recipientPhone: "+919876543210",
    recipientName: "Test Buyer",
    variables: {
      customerName: "Test Buyer",
      referenceNumber: "RDE-INQ-TEST1",
      propertyTitle: "Royal Palms Township",
    },
  });

  if (!enqueueResult1.outboxId || enqueueResult1.duplicate) {
    throw new Error("FAIL: Initial enqueue should succeed without duplicate flag.");
  }
  console.log("✓ Successfully enqueued first outbox event:", enqueueResult1.outboxId);

  // Re-enqueue identical event -> Must detect duplicate
  const enqueueResult2 = await OutboxService.enqueue({
    eventType: "INQUIRY_RECEIVED_CUSTOMER",
    aggregateType: "LEAD",
    aggregateId: testAggregateId,
    aggregateVersion: 1,
    recipientType: "CUSTOMER",
    recipientEmail: "rahulkumawat1408@gmail.com",
    recipientPhone: "+919876543210",
    recipientName: "Test Buyer",
    variables: {
      customerName: "Test Buyer",
      referenceNumber: "RDE-INQ-TEST1",
    },
  });

  if (!enqueueResult2.duplicate) {
    throw new Error("FAIL: Duplicate enqueue should be detected and suppressed.");
  }
  console.log("✓ Duplicate event safely suppressed by idempotency key.");

  // ── TEST 2: In-App Notification Generation ─────────────────────────────────
  console.log("\n[TEST 2] Testing In-App Notification Generation...");
  const internalEnqueue = await OutboxService.enqueue({
    eventType: "LEAD_CREATED_INTERNAL",
    aggregateType: "LEAD",
    aggregateId: testAggregateId,
    aggregateVersion: 1,
    recipientType: "ADMIN_POOL",
    channels: ["IN_APP"],
    variables: {
      leadName: "Test Prospect",
      leadPhone: "+919876543210",
      leadId: testAggregateId.toString(),
      source: "PROPERTY_DETAIL",
    },
  });

  const inAppNotif = await InAppNotification.findOne({ entityId: testAggregateId.toString() }).lean();
  if (!inAppNotif) {
    throw new Error("FAIL: In-App notification was not created.");
  }
  console.log("✓ In-App notification created:", inAppNotif.title);

  // ── TEST 3: Asynchronous Batch Worker Processor ────────────────────────────
  console.log("\n[TEST 3] Testing Batch Worker Processor...");
  const processResult = await NotificationProcessorService.processBatch(10);
  console.log("✓ Processed batch summary:", processResult);

  const updatedOutbox = await NotificationOutbox.findById(enqueueResult1.outboxId).lean();
  if (!updatedOutbox || updatedOutbox.status !== "SENT") {
    throw new Error(`FAIL: Outbox status should be SENT, received: ${updatedOutbox?.status}`);
  }
  console.log("✓ Outbox item transitioned to SENT.");

  const deliveryRecords = await NotificationDelivery.find({ outboxId: enqueueResult1.outboxId }).lean();
  if (deliveryRecords.length === 0) {
    throw new Error("FAIL: Delivery records were not created.");
  }
  console.log(`✓ Created ${deliveryRecords.length} delivery record(s) (Masked: ${deliveryRecords[0].maskedRecipient})`);

  // ── TEST 4: Reminder Scheduling & Cancellation Lifecycle ───────────────────
  console.log("\n[TEST 4] Testing Site-Visit Reminder Lifecycle...");
  const visitAggregateId = new Types.ObjectId();

  await OutboxService.enqueue({
    eventType: "SITE_VISIT_REMINDER_24H",
    aggregateType: "SITE_VISIT",
    aggregateId: visitAggregateId,
    aggregateVersion: 1,
    recipientType: "CUSTOMER",
    recipientEmail: "visitor@example.com",
    recipientPhone: "+919876543210",
    recipientName: "Visitor",
    scheduledFor: new Date(Date.now() + 86400000), // In 24 hours
    variables: {
      customerName: "Visitor",
      referenceNumber: "RDE-SV-REMTEST",
      propertyTitle: "Aerotropolis Prime",
    },
  });

  const cancelledCount = await OutboxService.cancelPendingReminders("SITE_VISIT", visitAggregateId, "RESCHEDULED");
  if (cancelledCount < 1) {
    throw new Error("FAIL: Expected pending reminder to be cancelled.");
  }

  const cancelledOutbox = await NotificationOutbox.findOne({
    aggregateId: visitAggregateId,
    eventType: "SITE_VISIT_REMINDER_24H",
  }).lean();

  if (cancelledOutbox?.status !== "CANCELLED") {
    throw new Error("FAIL: Cancelled reminder status mismatch.");
  }
  console.log("✓ Successfully cancelled pending reminder upon reschedule/cancel event.");

  // ── TEST 5: Consent & Suppression Enforcement ──────────────────────────────
  console.log("\n[TEST 5] Testing Consent & Hard-Bounce Suppression...");
  const bounceEmail = "bounced.user@example.com";
  await ConsentService.recordSuppression(bounceEmail, "EMAIL", "HARD_BOUNCE");

  const permissionCheck = await ConsentService.isDeliveryPermitted("EMAIL", bounceEmail);
  if (permissionCheck.permitted) {
    throw new Error("FAIL: Suppressed recipient should not be permitted for delivery.");
  }
  console.log("✓ Delivery correctly blocked for suppressed recipient:", permissionCheck.reason);

  // ── TEST 6: Operational Metrics Query ──────────────────────────────────────
  console.log("\n[TEST 6] Testing Operational Metrics Retrieval...");
  const metrics = await CommunicationService.getMetrics();
  console.log("✓ Operational Metrics:", {
    sent: metrics.sentCount,
    delivered: metrics.deliveredCount,
    deliveryRate: `${metrics.deliveryRatePercent}%`,
    emailStatus: metrics.providerStatus.email,
    whatsappStatus: metrics.providerStatus.whatsapp,
  });

  console.log("\n================================================================================");
  console.log("✅ ALL PRD 9 AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY!");
  console.log("================================================================================");

  process.exit(0);
}

runTests().catch((err) => {
  console.error("\n❌ PRD 9 TEST SUITE FAILED:", err);
  process.exit(1);
});
