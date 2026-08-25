/**
 * @file email-base.ts
 * @description Branded HTML email shell and helper utilities for Ratiwal Dream Estates.
 * Implements editorial luxury styling: Navy #071a28, Cyan #087fc3, Warm neutral #f8f7f4.
 */

export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface EmailRenderOptions {
  subject: string;
  previewText?: string;
  recipientName?: string;
  bodyContentHtml: string;
  actionButton?: {
    label: string;
    url: string;
  };
  detailsBoxHtml?: string;
}

export function renderBrandedEmailHtml(options: EmailRenderOptions): string {
  const siteUrl = process.env.SITE_URL || "https://ratiwaldreamestates.com";
  const logoUrl = `${siteUrl}/images/brand/ratiwal-logo.svg`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f3ee;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #071a28;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f3ee;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(7, 26, 40, 0.08);
      box-shadow: 0 4px 24px rgba(7, 26, 40, 0.04);
    }
    .header {
      background-color: #071a28;
      padding: 28px 36px;
      text-align: center;
      border-bottom: 3px solid #087fc3;
    }
    .header-title {
      color: #ffffff;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 1px;
      margin: 0;
      font-family: Georgia, serif;
    }
    .header-sub {
      color: #42b7e8;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .content {
      padding: 36px;
      line-height: 1.65;
      font-size: 14px;
      color: #2b3a42;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #071a28;
      margin-bottom: 16px;
      font-family: Georgia, serif;
    }
    .details-card {
      background-color: #f8f7f4;
      border-radius: 12px;
      border: 1px solid rgba(7, 26, 40, 0.06);
      padding: 20px;
      margin: 24px 0;
    }
    .btn {
      display: inline-block;
      background-color: #087fc3;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 24px;
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 20px 0;
    }
    .footer {
      background-color: #f8f7f4;
      padding: 24px 36px;
      border-top: 1px solid rgba(7, 26, 40, 0.06);
      text-align: center;
      font-size: 11px;
      color: #647581;
      line-height: 1.5;
    }
    .footer-links a {
      color: #087fc3;
      text-decoration: none;
      margin: 0 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <div class="container">
            <!-- Brand Header -->
            <div class="header">
              <h1 class="header-title">RATIWAL DREAM ESTATES</h1>
              <div class="header-sub">Strategic Plotted Land & Advisory</div>
            </div>

            <!-- Content Body -->
            <div class="content">
              ${options.recipientName ? `<div class="greeting">Dear ${escapeHtml(options.recipientName)},</div>` : ""}
              ${options.bodyContentHtml}

              ${options.detailsBoxHtml ? `<div class="details-card">${options.detailsBoxHtml}</div>` : ""}

              ${
                options.actionButton
                  ? `<div style="text-align: center; margin: 28px 0;">
                      <a href="${escapeHtml(options.actionButton.url)}" class="btn" target="_blank">${escapeHtml(
                      options.actionButton.label
                    )}</a>
                    </div>`
                  : ""
              }

              <p style="margin-top: 28px; font-size: 13px; color: #647581;">
                Warm regards,<br>
                <strong style="color: #071a28;">The Advisory Team</strong><br>
                Ratiwal Dream Estates
              </p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p style="margin: 0 0 8px 0;">
                Ratiwal Dream Estates · Direct JDA / RERA Verified Land Assets · Rajasthan & Mumbai Nodes
              </p>
              <p class="footer-links" style="margin: 0 0 12px 0;">
                <a href="${escapeHtml(siteUrl)}">Official Website</a> ·
                <a href="${escapeHtml(siteUrl)}/properties">Verified Properties</a> ·
                <a href="${escapeHtml(siteUrl)}/contact">Advisory Desk</a>
              </p>
              <p style="margin: 0; font-size: 10px; color: #8c9ba5;">
                This is a transactional message regarding your inquiry or appointment. No promotional spam.
              </p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

export function generatePlainTextEmail(options: EmailRenderOptions): string {
  const siteUrl = process.env.SITE_URL || "https://ratiwaldreamestates.com";
  let text = `RATIWAL DREAM ESTATES\nStrategic Plotted Land & Advisory\n==================================\n\n`;

  if (options.recipientName) {
    text += `Dear ${options.recipientName},\n\n`;
  }

  // Strip HTML tags for plain text fallback
  const cleanBody = options.bodyContentHtml
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "");

  text += `${cleanBody.trim()}\n\n`;

  if (options.actionButton) {
    text += `${options.actionButton.label}: ${options.actionButton.url}\n\n`;
  }

  text += `Warm regards,\nThe Advisory Team\nRatiwal Dream Estates\n${siteUrl}\n`;
  return text;
}
