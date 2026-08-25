/**
 * @file whatsapp.provider.ts
 * @description Provider adapter for Meta WhatsApp Cloud API.
 * Supports Meta Cloud API in LIVE mode and a structured simulator in TEST mode.
 */

import { FailureCategory } from "@/types/communication";

export interface WhatsAppSendInput {
  toPhone: string; // E.164 formatted number e.g. "+919876543210"
  templateName: string;
  language?: string;
  parameters: string[];
  idempotencyKey?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  providerMessageId?: string;
  statusCode?: string;
  failureCategory?: FailureCategory;
  failureMessage?: string;
}

export class WhatsAppProvider {
  /**
   * Mask phone number for safe privacy logging and UI display (e.g. "+91 98*** **210")
   */
  public static maskPhone(phone: string): string {
    if (!phone || phone.length < 8) return "+91 ***** *****";
    const clean = phone.replace(/\s+/g, "");
    return `${clean.slice(0, 4)} *** **${clean.slice(-3)}`;
  }

  /**
   * Send WhatsApp Template Message via Meta Cloud API or Test Simulator
   */
  public static async send(input: WhatsAppSendInput): Promise<WhatsAppSendResult> {
    const mode = (process.env.COMMUNICATIONS_MODE || "test").toLowerCase();
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";

    // Non-production test allowlist check
    if (mode === "test" || !token || !phoneId) {
      const allowlist = (process.env.COMMUNICATIONS_TEST_ALLOWLIST || "").split(",").map((s) => s.trim());
      const testPhone = process.env.COMMUNICATIONS_TEST_WHATSAPP_NUMBER || "";

      const cleanTo = input.toPhone.replace(/\D/g, "");
      const isAllowed =
        allowlist.includes("*") ||
        allowlist.some((a) => cleanTo.endsWith(a.replace(/\D/g, ""))) ||
        (testPhone && cleanTo.endsWith(testPhone.replace(/\D/g, "")));

      const simulatedId = `sim_wamid_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      return {
        success: true,
        providerMessageId: simulatedId,
        statusCode: "200_SIMULATED",
        failureMessage: isAllowed
          ? "Delivered to WhatsApp sandbox simulator"
          : `Simulated in TEST mode (Phone ${this.maskPhone(input.toPhone)} not on test allowlist)`,
      };
    }

    // LIVE Meta WhatsApp Cloud API Delivery
    try {
      const cleanTo = input.toPhone.replace(/\D/g, "");
      const url = `https://graph.facebook.com/${apiVersion}/${phoneId}/messages`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanTo,
          type: "template",
          template: {
            name: input.templateName,
            language: { code: input.language || "en" },
            components: [
              {
                type: "body",
                parameters: input.parameters.map((p) => ({
                  type: "text",
                  text: String(p).slice(0, 1000),
                })),
              },
            ],
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorObj = data?.error;
        const code = errorObj?.code ? String(errorObj.code) : String(response.status);
        let failureCategory: FailureCategory = "UNKNOWN";

        if (response.status === 429 || errorObj?.code === 130429) {
          failureCategory = "TRANSIENT_RATE_LIMIT";
        } else if (response.status >= 500) {
          failureCategory = "TRANSIENT_PROVIDER_5XX";
        } else if (errorObj?.code === 132000 || errorObj?.code === 132001) {
          failureCategory = "PERMANENT_UNAPPROVED_TEMPLATE";
        } else if (errorObj?.code === 131026 || errorObj?.code === 131047) {
          failureCategory = "PERMANENT_MISSING_CONSENT";
        } else if (response.status === 401 || response.status === 403) {
          failureCategory = "PERMANENT_CREDENTIALS";
        }

        return {
          success: false,
          statusCode: code,
          failureCategory,
          failureMessage: errorObj?.message ? String(errorObj.message).slice(0, 300) : "Meta WhatsApp API error",
        };
      }

      const msgId = data?.messages?.[0]?.id || `wamid_${Date.now()}`;
      return {
        success: true,
        providerMessageId: msgId,
        statusCode: "200",
      };
    } catch (err) {
      return {
        success: false,
        statusCode: "NETWORK_ERROR",
        failureCategory: "TRANSIENT_NETWORK",
        failureMessage: err instanceof Error ? err.message : "Network error contacting Meta WhatsApp API",
      };
    }
  }
}
