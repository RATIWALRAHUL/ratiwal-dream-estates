/**
 * @file email.provider.ts
 * @description Provider adapter for Transactional Email.
 * Supports Resend API in LIVE mode and a structured simulator in TEST mode.
 */

import { FailureCategory } from "@/types/communication";

export interface EmailSendInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
}

export interface EmailSendResult {
  success: boolean;
  providerMessageId?: string;
  statusCode?: string;
  failureCategory?: FailureCategory;
  failureMessage?: string;
}

export class EmailProvider {
  /**
   * Mask email for safe privacy logging and UI display (e.g. "vi***a@domain.com")
   */
  public static maskEmail(email: string): string {
    if (!email || !email.includes("@")) return "masked@domain.com";
    const [local, domain] = email.split("@");
    if (local.length <= 2) {
      return `${local[0]}*@${domain}`;
    }
    return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
  }

  /**
   * Send transactional email through Resend or Test Simulator
   */
  public static async send(input: EmailSendInput): Promise<EmailSendResult> {
    const mode = (process.env.COMMUNICATIONS_MODE || "test").toLowerCase();
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Ratiwal Dream Estates <advisory@ratiwaldreamestates.com>";
    const replyTo = process.env.RESEND_REPLY_TO || "support@ratiwaldreamestates.com";

    // Non-production test allowlist check
    if (mode === "test" || !apiKey) {
      const allowlist = (process.env.COMMUNICATIONS_TEST_ALLOWLIST || "").split(",").map((s) => s.trim().toLowerCase());
      const testEmail = (process.env.COMMUNICATIONS_TEST_EMAIL || "").toLowerCase();

      const isAllowed =
        allowlist.includes("*") ||
        allowlist.includes(input.to.toLowerCase()) ||
        (testEmail && input.to.toLowerCase() === testEmail);

      const simulatedId = `sim_resend_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      return {
        success: true,
        providerMessageId: simulatedId,
        statusCode: "200_SIMULATED",
        failureMessage: isAllowed
          ? "Delivered to test sandbox simulator"
          : `Simulated in TEST mode (Recipient ${this.maskEmail(input.to)} not on test allowlist)`,
      };
    }

    // LIVE Resend API Delivery
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [input.to],
          reply_to: replyTo,
          subject: input.subject,
          html: input.html,
          text: input.text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const statusCode = String(response.status);
        let failureCategory: FailureCategory = "UNKNOWN";

        if (response.status === 429) failureCategory = "TRANSIENT_RATE_LIMIT";
        else if (response.status >= 500) failureCategory = "TRANSIENT_PROVIDER_5XX";
        else if (response.status === 401 || response.status === 403) failureCategory = "PERMANENT_CREDENTIALS";
        else if (response.status === 422 || response.status === 400) failureCategory = "PERMANENT_PAYLOAD_INVALID";

        return {
          success: false,
          statusCode,
          failureCategory,
          failureMessage: data?.message ? String(data.message).slice(0, 300) : "Resend API error",
        };
      }

      return {
        success: true,
        providerMessageId: data.id || `resend_${Date.now()}`,
        statusCode: "200",
      };
    } catch (err) {
      return {
        success: false,
        statusCode: "NETWORK_ERROR",
        failureCategory: "TRANSIENT_NETWORK",
        failureMessage: err instanceof Error ? err.message : "Network error contacting Resend API",
      };
    }
  }
}
