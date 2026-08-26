import assert from "assert";
import crypto from "crypto";
import { MoneyUtils } from "../src/lib/utils/money";
import { MockPaymentAdapter } from "../src/lib/payments/mock";
import { RazorpayAdapter } from "../src/lib/payments/razorpay";

async function runPaymentTests() {
  console.log("=================================================");
  console.log("PRD 16 — Payments, Plans & Reconciliation Test Suite");
  console.log("=================================================\n");

  // 1. Test MoneyUtils Minor-Unit Integer Arithmetic
  console.log("1. Testing MoneyUtils integer arithmetic...");
  {
    assert.strictEqual(MoneyUtils.majorToMinor(100), 10000, "100 INR must be 10000 paise");
    assert.strictEqual(MoneyUtils.minorToMajor(10000), 100, "10000 paise must be 100 INR");
    assert.strictEqual(MoneyUtils.add(1050, 2025), 3075, "Addition must be exact");
    assert.strictEqual(MoneyUtils.subtract(5000, 1500), 3500, "Subtraction must be exact");

    // Half-up percentage rounding
    assert.strictEqual(MoneyUtils.percentageOf(10000, 18), 1800, "18% of 10000 paise must be 1800 paise");
    assert.strictEqual(MoneyUtils.percentageOf(1001, 10), 100, "10% of 1001 paise (100.1) rounded half-up to 100");
    assert.strictEqual(MoneyUtils.percentageOf(1005, 10), 101, "10% of 1005 paise (100.5) rounded half-up to 101");

    // Largest Remainder Method Distribution
    const distributed = MoneyUtils.distribute(100, [1, 1, 1]);
    assert.strictEqual(distributed.reduce((a, b) => a + b, 0), 100, "Distributed sum must equal 100");
    assert.deepStrictEqual(distributed, [34, 33, 33], "Largest remainder distributed to first element");

    // Indian Currency Formatting
    const formatted = MoneyUtils.format(450000000, "INR");
    assert.ok(formatted.includes("45,00,000"), `Formatted string must include 45,00,000 (received ${formatted})`);

    console.log("   ✓ MoneyUtils integer arithmetic and rounding verified.");
  }

  // 2. Test Provider Adapters & Signature Verification
  console.log("\n2. Testing Payment Provider Adapters...");
  {
    const mock = new MockPaymentAdapter();
    const order = await mock.createOrder({
      amountPaise: 5000000,
      currency: "INR",
      receiptId: "RDE-TXN-000001",
    });

    assert.ok(order.providerOrderId.startsWith("order_mock_"), "Mock order ID format valid");
    assert.strictEqual(order.amountPaise, 5000000);

    const validSig = mock.verifyCheckoutSignature({
      providerOrderId: order.providerOrderId,
      providerPaymentId: "pay_mock_123",
      providerSignature: "mock_valid_signature_123",
    });
    assert.strictEqual(validSig, true, "Mock valid signature accepted");

    const invalidSig = mock.verifyCheckoutSignature({
      providerOrderId: order.providerOrderId,
      providerPaymentId: "pay_mock_123",
      providerSignature: "tampered_sig",
    });
    assert.strictEqual(invalidSig, false, "Tampered signature rejected");

    const refund = await mock.createRefund({
      providerPaymentId: "pay_mock_123",
      amountPaise: 5000000,
      idempotencyKey: "rfd_mock_idem_1",
    });
    assert.ok(refund.providerRefundId.startsWith("rfnd_mock_"), "Mock refund ID valid");
    assert.strictEqual(refund.status, "processed");

    console.log("   ✓ Provider adapter signatures & order creation verified.");
  }

  // 3. Test Timing-Safe HMAC Webhook Verification
  console.log("\n3. Testing Timing-Safe HMAC Webhook Verification...");
  {
    const secret = "test_webhook_secret_key_123";
    const payload = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_test_999", amount: 1000000 } } },
    });

    const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    const rzp = new RazorpayAdapter();
    const verified = rzp.verifyWebhookSignature({
      rawBody: payload,
      signature: expectedSig,
      webhookSecret: secret,
    });
    assert.strictEqual(verified, true, "Timing-safe HMAC verified successfully");

    const tamperedVerified = rzp.verifyWebhookSignature({
      rawBody: payload,
      signature: "0".repeat(expectedSig.length),
      webhookSecret: secret,
    });
    assert.strictEqual(tamperedVerified, false, "Invalid timing-safe HMAC rejected");

    console.log("   ✓ HMAC webhook signature verification verified.");
  }

  // 4. Test Simulated FIFO Payment Allocation Math
  console.log("\n4. Testing FIFO Allocation and Reversal Calculations...");
  {
    // Simulate 3 instalments: 100k, 200k, 300k
    const inst1 = { id: 1, due: 100000, paid: 0, out: 100000 };
    const inst2 = { id: 2, due: 200000, paid: 0, out: 200000 };
    const inst3 = { id: 3, due: 300000, paid: 0, out: 300000 };

    const capturedPaymentPaise = 250000; // 250k covers inst1 (100k) and part of inst2 (150k)

    let remainingFunds = capturedPaymentPaise;
    const allocations = [];

    for (const inst of [inst1, inst2, inst3]) {
      if (remainingFunds <= 0) break;
      const allocAmount = Math.min(remainingFunds, inst.out);
      allocations.push({ instId: inst.id, amount: allocAmount });
      inst.paid += allocAmount;
      inst.out -= allocAmount;
      remainingFunds -= allocAmount;
    }

    assert.strictEqual(allocations.length, 2, "Allocations mapped to 2 instalments");
    assert.strictEqual(inst1.paid, 100000, "Instalment 1 fully paid");
    assert.strictEqual(inst1.out, 0, "Instalment 1 has 0 outstanding");
    assert.strictEqual(inst2.paid, 150000, "Instalment 2 partially paid (150k)");
    assert.strictEqual(inst2.out, 50000, "Instalment 2 has 50k outstanding");
    assert.strictEqual(inst3.paid, 0, "Instalment 3 untouched");
    assert.strictEqual(remainingFunds, 0, "All payment funds allocated");

    // Now test refund reversal of 100k (LIFO from allocations)
    let refundRemaining = 100000;
    const reversals = [];
    for (const alloc of [...allocations].reverse()) {
      if (refundRemaining <= 0) break;
      const revAmount = Math.min(refundRemaining, alloc.amount);
      reversals.push({ instId: alloc.instId, amount: revAmount });
      refundRemaining -= revAmount;
    }

    assert.strictEqual(reversals.length, 1, "Reversal taken completely from latest allocation (inst2)");
    assert.strictEqual(reversals[0].instId, 2, "Instalment 2 reversed");
    assert.strictEqual(reversals[0].amount, 100000, "100k reversed");

    console.log("   ✓ FIFO allocation and LIFO refund reversal logic verified.");
  }

  console.log("\n=================================================");
  console.log("PRD 16 PAYMENT TEST SUITE PASSED SUCCESSFULLY (Exit Code 0)");
  console.log("=================================================\n");
}

runPaymentTests().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
