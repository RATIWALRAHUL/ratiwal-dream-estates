import Link from "next/link";
import { ArrowLeft, Phone, Mail, Building2, MapPin, MessageSquare } from "lucide-react";
import { LeadTimeline } from "./LeadTimeline";
import { LeadNotes } from "./LeadNotes";
import { LeadContactLog } from "./LeadContactLog";
import { LeadAssignmentPanel } from "./LeadAssignmentPanel";
import { LeadFollowUpPanel } from "./LeadFollowUpPanel";
import { LeadStatusPanel } from "./LeadStatusPanel";
import { LeadConsentPanel } from "./LeadConsentPanel";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadPriorityBadge } from "./LeadPriorityBadge";
import { formatPaiseToRupeeString } from "@/lib/utils/currency";
import type { LeadDetail } from "@/lib/services/lead.service";

interface LeadDetailViewProps {
  lead: LeadDetail;
  role: string;
  userId: string;
}

const TIMELINE_LABELS: Record<string, string> = {
  IMMEDIATELY: "Immediately", WITHIN_3_MONTHS: "Within 3 months",
  WITHIN_6_MONTHS: "Within 6 months", WITHIN_1_YEAR: "Within 1 year",
  MORE_THAN_1_YEAR: "More than 1 year", JUST_EXPLORING: "Just exploring",
};

const PURPOSE_LABELS: Record<string, string> = {
  SELF_USE: "Self use", INVESTMENT: "Investment",
  BOTH: "Both", NOT_DECIDED: "Not decided",
};

const SOURCE_LABELS: Record<string, string> = {
  PROPERTY_DETAIL: "Property Detail", PROPERTY_CARD: "Property Card",
  LOCATION_PAGE: "Location Page", HOMEPAGE_CTA: "Homepage CTA",
  CONTACT_PAGE: "Contact Page", ADVISOR_SECTION: "Advisor Section",
  DIRECT: "Direct", OTHER: "Other",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Asia/Kolkata", hour12: true,
  });
}

export function LeadDetailView({ lead, role, userId }: LeadDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/leads" className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            Client Advisory Pipeline
          </Link>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#647581] block">
                CLIENT ADVISORY · {lead.referenceNumber}
              </span>
              <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">{lead.fullName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <LeadStatusBadge status={lead.status} />
            <LeadPriorityBadge priority={lead.priority} showLabel />
            <span className="text-[10px] text-[#647581]">Received {formatDate(lead.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Identity */}
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold mb-4">Client Identity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#071a28]/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#071a28]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-semibold text-[#071a28]">{lead.displayPhone}</p>
                  <p className="text-[10px] text-[#647581]">Preferred: {lead.preferredContactMethod}</p>
                </div>
              </div>
              {lead.displayEmail && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#071a28]/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#071a28]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide">Email</p>
                    <p className="text-sm font-semibold text-[#071a28]">{lead.displayEmail}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inquiry Context */}
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold mb-4">Inquiry Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(lead.propertyTitle || lead.locationName) && (
                <div className="sm:col-span-2 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    {lead.propertyTitle ? <Building2 className="w-4 h-4 text-blue-600" /> : <MapPin className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide">{lead.propertyTitle ? "Property" : "Location"}</p>
                    <p className="text-sm font-semibold text-[#071a28]">{lead.propertyTitle ?? lead.locationName}</p>
                  </div>
                </div>
              )}

              {lead.budgetMinimumPaise !== undefined && (
                <div>
                  <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide mb-1">Budget</p>
                  <p className="text-sm font-semibold text-[#071a28]">
                    {formatPaiseToRupeeString(lead.budgetMinimumPaise)}
                    {lead.budgetMaximumPaise ? ` – ${formatPaiseToRupeeString(lead.budgetMaximumPaise)}` : ""}
                  </p>
                </div>
              )}

              {lead.purchaseTimeline && (
                <div>
                  <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide mb-1">Timeline</p>
                  <p className="text-sm font-semibold text-[#071a28]">{TIMELINE_LABELS[lead.purchaseTimeline] ?? lead.purchaseTimeline}</p>
                </div>
              )}

              {lead.investmentPurpose && (
                <div>
                  <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide mb-1">Purpose</p>
                  <p className="text-sm font-semibold text-[#071a28]">{PURPOSE_LABELS[lead.investmentPurpose] ?? lead.investmentPurpose}</p>
                </div>
              )}

              {lead.source && (
                <div>
                  <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide mb-1">Inquiry Source</p>
                  <p className="text-sm font-semibold text-[#071a28]">{SOURCE_LABELS[lead.source] ?? lead.source}</p>
                </div>
              )}
            </div>

            {lead.message && (
              <div className="mt-4 p-4 rounded-xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)]">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#647581]" />
                  <span className="text-[10px] font-mono uppercase tracking-wide text-[#647581]">Message</span>
                </div>
                <p className="text-sm text-[#071a28] leading-relaxed">{lead.message}</p>
              </div>
            )}
          </div>

          {/* Contact Log */}
          <LeadContactLog leadId={lead.id} attempts={lead.contactAttempts} />

          {/* Notes */}
          <LeadNotes leadId={lead.id} notes={lead.notes} version={lead.version} />

          {/* Timeline */}
          <LeadTimeline events={lead.timeline} />
        </div>

        {/* Side panel (1/3) */}
        <div className="space-y-4">
          <LeadStatusPanel
            leadId={lead.id}
            status={lead.status}
            priority={lead.priority}
            version={lead.version}
            archivedAt={lead.archivedAt}
          />
          <LeadAssignmentPanel
            leadId={lead.id}
            assignedToId={lead.assignedToId}
            assignedToName={lead.assignedToName}
            assignedToEmail={lead.assignedToEmail}
            assignedAt={lead.assignedAt}
            version={lead.version}
            role={role}
          />
          <LeadFollowUpPanel
            leadId={lead.id}
            nextFollowUpAt={lead.nextFollowUpAt}
            lastContactedAt={lead.lastContactedAt}
          />
          <LeadConsentPanel
            leadId={lead.id}
            consentGranted={lead.consentGranted}
            consentTextVersion={lead.consentTextVersion}
            privacyPolicyVersion={lead.privacyPolicyVersion}
            consentTimestamp={lead.consentTimestamp}
            consentSource={lead.consentSource}
            consentWithdrawnAt={lead.consentWithdrawnAt}
            role={role}
          />

          {/* Attribution (admin only) */}
          {(role === "ADMIN" || role === "SUPER_ADMIN") && (lead.utmSource || lead.landingPath) && (
            <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold mb-3">Attribution</h3>
              <div className="space-y-1 text-[10px] font-mono text-[#647581]">
                {lead.landingPath && <p>Page: {lead.landingPath}</p>}
                {lead.utmSource && <p>utm_source: {lead.utmSource}</p>}
                {lead.utmMedium && <p>utm_medium: {lead.utmMedium}</p>}
                {lead.utmCampaign && <p>utm_campaign: {lead.utmCampaign}</p>}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold mb-3">Record</h3>
            <div className="space-y-1 text-[10px] font-mono text-[#647581]">
              <p>Created: {formatDate(lead.createdAt)}</p>
              <p>Updated: {formatDate(lead.updatedAt)}</p>
              <p>v{lead.version}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
