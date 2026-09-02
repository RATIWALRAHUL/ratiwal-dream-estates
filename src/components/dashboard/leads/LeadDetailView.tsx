import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  MapPin,
  MessageSquare,
  Globe,
  Clock,
  Target,
  Coins,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { LeadTimeline } from "./LeadTimeline";
import { LeadNotes } from "./LeadNotes";
import { LeadContactLog } from "./LeadContactLog";
import { LeadRequirementsEditor } from "./LeadRequirementsEditor";
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
  IMMEDIATELY: "Immediately (Urgent)",
  WITHIN_3_MONTHS: "Within 3 months",
  WITHIN_6_MONTHS: "Within 6 months",
  WITHIN_1_YEAR: "Within 1 year",
  MORE_THAN_1_YEAR: "More than 1 year",
  JUST_EXPLORING: "Exploring Options",
};

const PURPOSE_LABELS: Record<string, string> = {
  SELF_USE: "End-Use / Construction",
  INVESTMENT: "Long-term Wealth / Capital Growth",
  BOTH: "Dual (Investment + Use)",
  NOT_DECIDED: "Undecided",
};

const SOURCE_LABELS: Record<string, string> = {
  PROPERTY_DETAIL: "Property Detail Page",
  PROPERTY_CARD: "Property Listing Card",
  LOCATION_PAGE: "Location Growth Corridor",
  HOMEPAGE_CTA: "Homepage Discovery CTA",
  CONTACT_PAGE: "Contact Advisory Hub",
  ADVISOR_SECTION: "Direct Senior Advisor Desk",
  DIRECT: "Direct Inbound Lead",
  OTHER: "Other Channel",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
}

export function LeadDetailView({ lead, role, userId }: LeadDetailViewProps) {
  const cleanPhone = lead.displayPhone.replace(/[^\d+]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(
    `Namaste ${lead.fullName}, thank you for contacting Ratiwal Dream Estates regarding your land inquiry [Ref: ${lead.referenceNumber}]. How can I assist you today?`
  )}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Header Card */}
      <div className="bg-gradient-to-br from-white via-white to-[#f4f9fc] rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-sm p-6 sm:p-7 relative overflow-hidden">
        {/* Subtle decorative background accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#087fc3]/10 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#087fc3] hover:text-[#065e92] transition-colors mb-3 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Advisory Pipeline</span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-md bg-[#071a28]/5 text-[#071a28] font-mono text-[11px] font-bold tracking-wider uppercase border border-[#071a28]/10">
                {lead.referenceNumber}
              </span>
              <span className="text-xs text-[#647581] font-mono">
                Received {formatDate(lead.createdAt)}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#071a28] tracking-tight mt-2">
              {lead.fullName}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 mt-3">
              <LeadStatusBadge status={lead.status} />
              <LeadPriorityBadge priority={lead.priority} showLabel />
              {lead.consentGranted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Consent Verified
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {lead.displayPhone && (
              <>
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#0d2c42] shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#24D17F]" />
                  <span>Call Client</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#24D17F] text-[#071a28] text-xs font-bold hover:bg-[#1eb86e] shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
              </>
            )}
            {lead.displayEmail && (
              <a
                href={`mailto:${lead.displayEmail}?subject=${encodeURIComponent(
                  `Ratiwal Dream Estates - Land Advisory Consultation [${lead.referenceNumber}]`
                )}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[rgba(7,26,40,0.15)] text-[#071a28] text-xs font-bold hover:bg-slate-50 shadow-2xs transition-all hover:border-[#087fc3]"
              >
                <Mail className="w-3.5 h-3.5 text-[#087fc3]" />
                <span>Email</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Contact Identity */}
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(7,26,40,0.06)] mb-5">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#647581] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#087fc3]" />
                Client Contact Identity
              </h2>
              <span className="text-[11px] font-mono text-[#647581]">
                Channel Preference: <strong className="text-[#071a28]">{lead.preferredContactMethod}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Card */}
              <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] flex items-start gap-3.5 hover:border-[#087fc3]/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#071a28]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wider font-semibold">
                    Direct Phone Number
                  </p>
                  <p className="text-base font-bold text-[#071a28] tracking-tight mt-0.5 font-mono">
                    {lead.displayPhone}
                  </p>
                  <p className="text-[11px] text-[#647581] mt-0.5">
                    WhatsApp &amp; Voice Enabled
                  </p>
                </div>
              </div>

              {/* Email Card */}
              {lead.displayEmail ? (
                <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] flex items-start gap-3.5 hover:border-[#087fc3]/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#087fc3]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wider font-semibold">
                      Registered Email
                    </p>
                    <p className="text-sm font-bold text-[#071a28] truncate mt-0.5">
                      {lead.displayEmail}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                      ✓ Confirmation Email Dispatched
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] flex items-center text-xs text-[#647581]">
                  No email provided
                </div>
              )}
            </div>
          </div>

          {/* Inquiry Context & Preferences (Interactive Editor) */}
          <LeadRequirementsEditor lead={lead} />

          {/* Client Query / Message */}
          {lead.message && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#f8f7f4] to-[#f4f9fc] border border-[rgba(7,26,40,0.08)] relative">
              <div className="flex items-center gap-2 mb-2 text-[#087fc3]">
                <MessageSquare className="w-4 h-4" />
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider">
                  Client Note / Query
                </span>
              </div>
              <p className="text-sm text-[#071a28] font-medium leading-relaxed italic">
                &ldquo;{lead.message}&rdquo;
              </p>
            </div>
          )}

          {/* Contact Log */}
          <LeadContactLog leadId={lead.id} attempts={lead.contactAttempts} />

          {/* Notes */}
          <LeadNotes leadId={lead.id} notes={lead.notes} version={lead.version} />

          {/* Timeline */}
          <LeadTimeline
            events={lead.timeline}
            propertyTitle={lead.propertyTitle}
            locationName={lead.locationName}
            landingPath={lead.landingPath}
            source={lead.source}
          />
        </div>

        {/* Side panel (1/3) */}
        <div className="space-y-5">
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
            <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#647581] font-bold mb-3 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#087fc3]" />
                Digital Attribution
              </h3>
              <div className="space-y-2 text-xs font-mono text-[#647581]">
                {lead.landingPath && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span>Landing Page:</span>
                    <strong className="text-[#071a28]">{lead.landingPath}</strong>
                  </div>
                )}
                {lead.utmSource && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span>UTM Source:</span>
                    <strong className="text-[#071a28]">{lead.utmSource}</strong>
                  </div>
                )}
                {lead.utmCampaign && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span>UTM Campaign:</span>
                    <strong className="text-[#071a28]">{lead.utmCampaign}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#647581] font-bold mb-3">
              Record Audit
            </h3>
            <div className="space-y-2 text-xs font-mono text-[#647581]">
              <div className="flex items-center justify-between">
                <span>Created At:</span>
                <span className="text-[#071a28] font-bold">{formatDate(lead.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Updated:</span>
                <span className="text-[#071a28] font-bold">{formatDate(lead.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Schema Version:</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-[#071a28] font-bold">
                  v{lead.version}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
