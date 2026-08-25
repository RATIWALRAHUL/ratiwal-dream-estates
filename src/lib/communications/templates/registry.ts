/**
 * @file registry.ts
 * @description Central template registry and message generator for all 14 communication event types.
 */

import {
  NotificationEventType,
  NotificationChannel,
} from "@/types/communication";
import { renderBrandedEmailHtml, generatePlainTextEmail, escapeHtml } from "./email-base";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface RenderedWhatsApp {
  templateName: string;
  language: string;
  bodyText: string;
  parameters: string[]; // Ordered template parameters
}

export interface RenderedInApp {
  title: string;
  message: string;
  deepLink?: string;
}

export interface RenderedMessage {
  email?: RenderedEmail;
  whatsapp?: RenderedWhatsApp;
  inApp?: RenderedInApp;
}

export class TemplateRegistry {
  /**
   * Render message payloads for an event and variable payload
   */
  public static render(
    eventType: NotificationEventType,
    variables: Record<string, unknown>
  ): RenderedMessage {
    const siteUrl = process.env.SITE_URL || "https://ratiwaldreamestates.com";

    switch (eventType) {
      case "INQUIRY_RECEIVED_CUSTOMER": {
        const customerName = String(variables.customerName || "Valued Client");
        const refNo = String(variables.referenceNumber || "RDE-INQ");
        const propertyTitle = variables.propertyTitle ? String(variables.propertyTitle) : undefined;

        const subject = `We have received your inquiry [Ref: ${refNo}] - Ratiwal Dream Estates`;
        const bodyContentHtml = `
          <p>Thank you for reaching out to <strong>Ratiwal Dream Estates</strong>.</p>
          <p>We have safely recorded your inquiry${propertyTitle ? ` regarding <strong>${escapeHtml(propertyTitle)}</strong>` : ""}. A dedicated senior land advisor is reviewing your request and will connect with you via your preferred contact channel shortly.</p>
          <p>Our team specializes in clear-title plotted assets, JDA/RERA documentation diligence, and micro-market growth corridors across Jaipur and Mumbai.</p>
        `;

        const detailsBoxHtml = `
          <table style="width: 100%; font-size: 12px; color: #071a28;">
            <tr>
              <td style="color: #647581; padding: 4px 0;">Inquiry Reference:</td>
              <td style="font-weight: 700; font-family: monospace; text-align: right;">${escapeHtml(refNo)}</td>
            </tr>
            ${propertyTitle ? `<tr>
              <td style="color: #647581; padding: 4px 0;">Property / Location:</td>
              <td style="font-weight: 600; text-align: right;">${escapeHtml(propertyTitle)}</td>
            </tr>` : ""}
          </table>
        `;

        const emailHtml = renderBrandedEmailHtml({
          subject,
          recipientName: customerName,
          bodyContentHtml,
          detailsBoxHtml,
        });

        const emailText = generatePlainTextEmail({
          subject,
          recipientName: customerName,
          bodyContentHtml,
        });

        return {
          email: { subject, html: emailHtml, text: emailText },
          whatsapp: {
            templateName: "inquiry_received_customer",
            language: "en",
            bodyText: `Namaste ${customerName}, we have received your inquiry (Ref: ${refNo})${propertyTitle ? ` for ${propertyTitle}` : ""}. A Ratiwal Dream Estates advisor will connect with you shortly.`,
            parameters: [customerName, refNo, propertyTitle || "General Inquiry"],
          },
        };
      }

      case "LEAD_CREATED_INTERNAL": {
        const leadName = String(variables.leadName || "New Prospect");
        const leadPhone = String(variables.leadPhone || "N/A");
        const leadId = String(variables.leadId || "");
        const source = String(variables.source || "WEBSITE");

        return {
          inApp: {
            title: `New Lead Captured: ${leadName}`,
            message: `Prospect ${leadName} (${leadPhone}) submitted via ${source}.`,
            deepLink: leadId ? `/dashboard/leads/${leadId}` : `/dashboard/leads`,
          },
          email: {
            subject: `[Internal Alert] New Lead Captured: ${leadName}`,
            html: renderBrandedEmailHtml({
              subject: `New Lead: ${leadName}`,
              bodyContentHtml: `<p>A new prospect inquiry has been recorded in the CRM.</p>`,
              detailsBoxHtml: `
                <table style="width: 100%; font-size: 12px;">
                  <tr><td style="color: #647581;">Name:</td><td><strong>${escapeHtml(leadName)}</strong></td></tr>
                  <tr><td style="color: #647581;">Phone:</td><td><strong>${escapeHtml(leadPhone)}</strong></td></tr>
                  <tr><td style="color: #647581;">Source:</td><td>${escapeHtml(source)}</td></tr>
                </table>
              `,
              actionButton: leadId ? { label: "Open CRM Record", url: `${siteUrl}/dashboard/leads/${leadId}` } : undefined,
            }),
            text: `New Lead: ${leadName} (${leadPhone})\nSource: ${source}\nCRM: ${siteUrl}/dashboard/leads/${leadId}`,
          },
        };
      }

      case "LEAD_ASSIGNED_INTERNAL": {
        const advisorName = String(variables.advisorName || "Advisor");
        const leadName = String(variables.leadName || "Prospect");
        const leadId = String(variables.leadId || "");

        return {
          inApp: {
            title: `Lead Assigned to You`,
            message: `Lead ${leadName} has been assigned to your advisory portfolio.`,
            deepLink: leadId ? `/dashboard/leads/${leadId}` : `/dashboard/leads`,
          },
          email: {
            subject: `[Lead Assignment] ${leadName} assigned to you`,
            html: renderBrandedEmailHtml({
              subject: `Lead Assigned: ${leadName}`,
              recipientName: advisorName,
              bodyContentHtml: `<p>You have been assigned as the primary advisor for prospect <strong>${escapeHtml(leadName)}</strong>. Please review their requirements and schedule initial discovery.</p>`,
              actionButton: leadId ? { label: "View Lead in Dashboard", url: `${siteUrl}/dashboard/leads/${leadId}` } : undefined,
            }),
            text: `Dear ${advisorName},\n\nYou have been assigned lead: ${leadName}.\nDashboard: ${siteUrl}/dashboard/leads/${leadId}`,
          },
        };
      }

      case "SITE_VISIT_REQUEST_RECEIVED_CUSTOMER": {
        const customerName = String(variables.customerName || "Valued Client");
        const refNo = String(variables.referenceNumber || "RDE-SV");
        const propertyTitle = String(variables.propertyTitle || "Plotted Asset");
        const preferredTime = String(variables.preferredTime || "Requested Schedule");

        const subject = `Site Visit Request Recorded [Ref: ${refNo}] - Ratiwal Dream Estates`;
        const bodyContentHtml = `
          <p>Thank you for scheduling a property inspection with <strong>Ratiwal Dream Estates</strong>.</p>
          <p>We have received your requested visit for <strong>${escapeHtml(propertyTitle)}</strong>. Our operations desk is reviewing plot accessibility, gate logistics, and advisor availability.</p>
          <p>You will receive a formal confirmation once your inspection itinerary is locked.</p>
        `;

        const detailsBoxHtml = `
          <table style="width: 100%; font-size: 12px;">
            <tr><td style="color: #647581;">Booking Reference:</td><td style="font-weight: 700; font-family: monospace; text-align: right;">${escapeHtml(refNo)}</td></tr>
            <tr><td style="color: #647581;">Property:</td><td style="font-weight: 600; text-align: right;">${escapeHtml(propertyTitle)}</td></tr>
            <tr><td style="color: #647581;">Requested Time:</td><td style="text-align: right;">${escapeHtml(preferredTime)}</td></tr>
          </table>
        `;

        return {
          email: {
            subject,
            html: renderBrandedEmailHtml({ subject, recipientName: customerName, bodyContentHtml, detailsBoxHtml }),
            text: generatePlainTextEmail({ subject, recipientName: customerName, bodyContentHtml }),
          },
          whatsapp: {
            templateName: "site_visit_request_received_customer",
            language: "en",
            bodyText: `Namaste ${customerName}, your site visit request for ${propertyTitle} (Ref: ${refNo}) has been recorded for ${preferredTime}. We will confirm once advisor logistics are locked.`,
            parameters: [customerName, propertyTitle, refNo, preferredTime],
          },
        };
      }

      case "SITE_VISIT_CONFIRMED_CUSTOMER": {
        const customerName = String(variables.customerName || "Valued Client");
        const refNo = String(variables.referenceNumber || "RDE-SV");
        const propertyTitle = String(variables.propertyTitle || "Plotted Asset");
        const scheduledTime = String(variables.scheduledTime || "");
        const meetingPoint = String(variables.meetingPoint || "Main Gate / Site Office");
        const advisorName = String(variables.advisorName || "Property Advisor");
        const advisorPhone = String(variables.advisorPhone || "+91 98765 43210");

        const subject = `Confirmed: Site Visit Itinerary [${refNo}] - ${propertyTitle}`;
        const bodyContentHtml = `
          <p>Your property site visit has been <strong>confirmed and locked</strong>.</p>
          <p>Your assigned property advisor, <strong>${escapeHtml(advisorName)}</strong>, will meet you on-site to walk plot boundary demarcations, sector road connectivity, and review verified revenue records.</p>
        `;

        const detailsBoxHtml = `
          <table style="width: 100%; font-size: 12px; line-height: 1.8;">
            <tr><td style="color: #647581;">Visit Reference:</td><td style="font-weight: 700; font-family: monospace; text-align: right;">${escapeHtml(refNo)}</td></tr>
            <tr><td style="color: #647581;">Property:</td><td style="font-weight: 600; text-align: right;">${escapeHtml(propertyTitle)}</td></tr>
            <tr><td style="color: #647581;">Confirmed Date & Time:</td><td style="font-weight: 700; color: #087fc3; text-align: right;">${escapeHtml(scheduledTime)}</td></tr>
            <tr><td style="color: #647581;">Meeting Location:</td><td style="text-align: right;">${escapeHtml(meetingPoint)}</td></tr>
            <tr><td style="color: #647581;">Assigned Advisor:</td><td style="text-align: right;">${escapeHtml(advisorName)} (${escapeHtml(advisorPhone)})</td></tr>
          </table>
        `;

        return {
          email: {
            subject,
            html: renderBrandedEmailHtml({ subject, recipientName: customerName, bodyContentHtml, detailsBoxHtml }),
            text: generatePlainTextEmail({ subject, recipientName: customerName, bodyContentHtml }),
          },
          whatsapp: {
            templateName: "site_visit_confirmed_customer",
            language: "en",
            bodyText: `Confirmed! Site visit for ${propertyTitle} is scheduled on ${scheduledTime}. Meeting Point: ${meetingPoint}. Advisor: ${advisorName} (${advisorPhone}). Ref: ${refNo}`,
            parameters: [customerName, propertyTitle, scheduledTime, meetingPoint, advisorName, refNo],
          },
        };
      }

      case "SITE_VISIT_RESCHEDULED_CUSTOMER": {
        const customerName = String(variables.customerName || "Valued Client");
        const refNo = String(variables.referenceNumber || "RDE-SV");
        const propertyTitle = String(variables.propertyTitle || "Plotted Asset");
        const newScheduledTime = String(variables.newScheduledTime || "");
        const reason = String(variables.reason || "Schedule adjustment");

        const subject = `Updated Itinerary: Site Visit Rescheduled [${refNo}] - ${propertyTitle}`;
        const bodyContentHtml = `
          <p>Please note that your site visit for <strong>${escapeHtml(propertyTitle)}</strong> has been rescheduled.</p>
          <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
          <p>Your new confirmed appointment details are outlined below:</p>
        `;

        const detailsBoxHtml = `
          <table style="width: 100%; font-size: 12px; line-height: 1.8;">
            <tr><td style="color: #647581;">Visit Reference:</td><td style="font-weight: 700; font-family: monospace; text-align: right;">${escapeHtml(refNo)}</td></tr>
            <tr><td style="color: #647581;">Property:</td><td style="font-weight: 600; text-align: right;">${escapeHtml(propertyTitle)}</td></tr>
            <tr><td style="color: #647581;">New Date & Time:</td><td style="font-weight: 700; color: #087fc3; text-align: right;">${escapeHtml(newScheduledTime)}</td></tr>
          </table>
        `;

        return {
          email: {
            subject,
            html: renderBrandedEmailHtml({ subject, recipientName: customerName, bodyContentHtml, detailsBoxHtml }),
            text: generatePlainTextEmail({ subject, recipientName: customerName, bodyContentHtml }),
          },
          whatsapp: {
            templateName: "site_visit_rescheduled_customer",
            language: "en",
            bodyText: `Your site visit for ${propertyTitle} (Ref: ${refNo}) has been rescheduled to ${newScheduledTime}.`,
            parameters: [customerName, propertyTitle, newScheduledTime, refNo],
          },
        };
      }

      case "SITE_VISIT_CANCELLED_CUSTOMER": {
        const customerName = String(variables.customerName || "Valued Client");
        const refNo = String(variables.referenceNumber || "RDE-SV");
        const propertyTitle = String(variables.propertyTitle || "Plotted Asset");
        const reason = String(variables.reason || "Operational cancellation");

        const subject = `Notice: Site Visit Cancelled [${refNo}] - ${propertyTitle}`;
        const bodyContentHtml = `
          <p>This message confirms that your scheduled site visit for <strong>${escapeHtml(propertyTitle)}</strong> (Ref: ${escapeHtml(refNo)}) has been cancelled.</p>
          <p><strong>Note:</strong> ${escapeHtml(reason)}</p>
          <p>If you wish to reschedule or discuss alternative plotted investment opportunities, please feel free to contact our advisory desk.</p>
        `;

        return {
          email: {
            subject,
            html: renderBrandedEmailHtml({ subject, recipientName: customerName, bodyContentHtml }),
            text: generatePlainTextEmail({ subject, recipientName: customerName, bodyContentHtml }),
          },
          whatsapp: {
            templateName: "site_visit_cancelled_customer",
            language: "en",
            bodyText: `Notice: Site visit for ${propertyTitle} (Ref: ${refNo}) has been cancelled. Reach out anytime to reschedule.`,
            parameters: [customerName, propertyTitle, refNo],
          },
        };
      }

      case "SITE_VISIT_REMINDER_24H": {
        const customerName = String(variables.customerName || "Valued Client");
        const refNo = String(variables.referenceNumber || "RDE-SV");
        const propertyTitle = String(variables.propertyTitle || "Plotted Asset");
        const scheduledTime = String(variables.scheduledTime || "Tomorrow");
        const meetingPoint = String(variables.meetingPoint || "Main Gate");

        const subject = `Reminder: Site Visit Tomorrow [${refNo}] - ${propertyTitle}`;
        const bodyContentHtml = `
          <p>This is a friendly reminder of your scheduled site inspection for <strong>${escapeHtml(propertyTitle)}</strong> tomorrow.</p>
          <p>Our advisor will be waiting for you at the meeting point with complete project maps and master plan dossiers.</p>
        `;

        const detailsBoxHtml = `
          <table style="width: 100%; font-size: 12px; line-height: 1.8;">
            <tr><td style="color: #647581;">Date & Time:</td><td style="font-weight: 700; color: #087fc3; text-align: right;">${escapeHtml(scheduledTime)}</td></tr>
            <tr><td style="color: #647581;">Meeting Location:</td><td style="text-align: right;">${escapeHtml(meetingPoint)}</td></tr>
          </table>
        `;

        return {
          email: {
            subject,
            html: renderBrandedEmailHtml({ subject, recipientName: customerName, bodyContentHtml, detailsBoxHtml }),
            text: generatePlainTextEmail({ subject, recipientName: customerName, bodyContentHtml }),
          },
          whatsapp: {
            templateName: "site_visit_reminder_24h",
            language: "en",
            bodyText: `Reminder: Your site visit for ${propertyTitle} is tomorrow at ${scheduledTime}. Location: ${meetingPoint}. Ref: ${refNo}`,
            parameters: [customerName, propertyTitle, scheduledTime, meetingPoint, refNo],
          },
        };
      }

      case "SITE_VISIT_REMINDER_2H": {
        const customerName = String(variables.customerName || "Valued Client");
        const refNo = String(variables.referenceNumber || "RDE-SV");
        const propertyTitle = String(variables.propertyTitle || "Plotted Asset");
        const scheduledTime = String(variables.scheduledTime || "in 2 hours");
        const meetingPoint = String(variables.meetingPoint || "Main Gate");
        const advisorPhone = String(variables.advisorPhone || "+91 98765 43210");

        return {
          whatsapp: {
            templateName: "site_visit_reminder_2h",
            language: "en",
            bodyText: `Your visit for ${propertyTitle} starts in 2 hours (${scheduledTime}) at ${meetingPoint}. Advisor Helpline: ${advisorPhone}. Ref: ${refNo}`,
            parameters: [customerName, propertyTitle, scheduledTime, meetingPoint, advisorPhone, refNo],
          },
          email: {
            subject: `Starting Soon: Site Visit for ${propertyTitle}`,
            html: renderBrandedEmailHtml({
              subject: `Starting Soon: ${propertyTitle}`,
              recipientName: customerName,
              bodyContentHtml: `<p>Your inspection for <strong>${escapeHtml(propertyTitle)}</strong> commences at <strong>${escapeHtml(scheduledTime)}</strong> at <strong>${escapeHtml(meetingPoint)}</strong>.</p>`,
            }),
            text: `Your visit for ${propertyTitle} is in 2 hours at ${scheduledTime}. Meeting Point: ${meetingPoint}. Advisor: ${advisorPhone}`,
          },
        };
      }

      default: {
        return {
          inApp: {
            title: `Notification: ${eventType}`,
            message: JSON.stringify(variables),
          },
        };
      }
    }
  }
}
