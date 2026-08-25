/**
 * @file consent.service.ts
 * @description Manages user consent, suppression lists, bounce/complaint handling, and opt-outs.
 */

import { connectToDatabase } from "@/lib/db/mongoose";
import { CommunicationConsent } from "@/models/CommunicationConsent";
import { NotificationChannel } from "@/types/communication";
import crypto from "crypto";

export class ConsentService {
  /**
   * Derive a privacy-safe deterministic recipient key (hash)
   */
  public static hashRecipient(recipient: string): string {
    const clean = recipient.trim().toLowerCase();
    return crypto.createHash("sha256").update(clean).digest("hex");
  }

  /**
   * Check if transactional communication is permitted for a channel and recipient
   */
  public static async isDeliveryPermitted(
    channel: NotificationChannel,
    recipient: string
  ): Promise<{ permitted: boolean; reason?: string }> {
    if (channel === "IN_APP") {
      return { permitted: true };
    }

    if (!recipient) {
      return { permitted: false, reason: "MISSING_RECIPIENT" };
    }

    await connectToDatabase();
    const recipientKey = this.hashRecipient(recipient);

    const consentRecord = await CommunicationConsent.findOne({
      recipientKey,
      channel,
      purpose: "TRANSACTIONAL",
    }).lean();

    if (!consentRecord) {
      // Default to permitted for standard website-originated transactional interactions unless explicitly suppressed
      return { permitted: true };
    }

    if (consentRecord.consentStatus === "WITHDRAWN") {
      return { permitted: false, reason: "CONSENT_WITHDRAWN" };
    }

    if (consentRecord.consentStatus === "SUPPRESSED_BOUNCE") {
      return { permitted: false, reason: "SUPPRESSED_HARD_BOUNCE" };
    }

    if (consentRecord.consentStatus === "SUPPRESSED_COMPLAINT") {
      return { permitted: false, reason: "SUPPRESSED_SPAM_COMPLAINT" };
    }

    if (consentRecord.consentStatus === "SUPPRESSED_OPT_OUT") {
      return { permitted: false, reason: "SUPPRESSED_USER_OPT_OUT" };
    }

    return { permitted: true };
  }

  /**
   * Record or update transactional consent granted
   */
  public static async recordConsent(
    recipient: string,
    channel: NotificationChannel,
    source: string = "WEBSITE_FORM",
    version: string = "v1.0"
  ): Promise<void> {
    await connectToDatabase();
    const recipientKey = this.hashRecipient(recipient);

    await CommunicationConsent.findOneAndUpdate(
      { recipientKey, channel, purpose: "TRANSACTIONAL" },
      {
        $set: {
          consentStatus: "GRANTED",
          consentSource: source,
          consentWordingVersion: version,
          consentTimestamp: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  /**
   * Record suppression (hard bounce, spam complaint, or user opt-out)
   */
  public static async recordSuppression(
    recipient: string,
    channel: NotificationChannel,
    reason: "HARD_BOUNCE" | "SPAM_COMPLAINT" | "USER_OPT_OUT"
  ): Promise<void> {
    await connectToDatabase();
    const recipientKey = this.hashRecipient(recipient);

    let status: "SUPPRESSED_BOUNCE" | "SUPPRESSED_COMPLAINT" | "SUPPRESSED_OPT_OUT" = "SUPPRESSED_OPT_OUT";
    if (reason === "HARD_BOUNCE") status = "SUPPRESSED_BOUNCE";
    else if (reason === "SPAM_COMPLAINT") status = "SUPPRESSED_COMPLAINT";

    await CommunicationConsent.findOneAndUpdate(
      { recipientKey, channel, purpose: "TRANSACTIONAL" },
      {
        $set: {
          consentStatus: status,
          suppressionReason: reason,
          withdrawalTimestamp: new Date(),
          bounceStatus: reason === "HARD_BOUNCE" ? "HARD" : "NONE",
          complaintStatus: reason === "SPAM_COMPLAINT" ? "REPORTED" : "NONE",
        },
      },
      { upsert: true, returnDocument: "after" }
    );
  }
}
