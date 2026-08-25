import Link from "next/link";
import { ArrowLeft, Phone, Mail, Building, MapPin, Video, Users, ShieldCheck, Calendar } from "lucide-react";
import { SiteVisitStatusBadge } from "./SiteVisitStatusBadge";
import { SiteVisitPriorityBadge } from "./SiteVisitPriorityBadge";
import { SiteVisitAssignmentPanel } from "./SiteVisitAssignmentPanel";
import { SiteVisitSchedulePanel } from "./SiteVisitSchedulePanel";
import { SiteVisitStatusPanel } from "./SiteVisitStatusPanel";
import { SiteVisitTimeline } from "./SiteVisitTimeline";
import { SiteVisitNotes } from "./SiteVisitNotes";
import type { SiteVisitDetail } from "@/lib/services/site-visit.service";

interface SiteVisitDetailViewProps {
  visit: SiteVisitDetail;
  role: string;
  userId: string;
}

const MODE_LABELS: Record<string, string> = {
  IN_PERSON: "Physical On-Site Tour",
  VIRTUAL_TOUR: "Virtual Live Consultation",
  OFFICE_CONSULTATION: "Office Portfolio Review",
};

function formatDateTime(iso: string) {
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

export function SiteVisitDetailView({ visit, role, userId }: SiteVisitDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/site-visits"
            className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Site Visit Operations
          </Link>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#647581] block">
                PROPERTY VISIT · {visit.referenceNumber}
              </span>
              <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
                {visit.property.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <SiteVisitStatusBadge status={visit.status} />
            <SiteVisitPriorityBadge priority={visit.priority} showLabel />
            <span className="text-[10px] text-[#647581]">
              Requested {formatDateTime(visit.requestedStartAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Two-column layout (2/3 main, 1/3 sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visitor Identity & Lead Context */}
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
                Visitor Identity & Inquiry Profile
              </h2>
              {visit.lead.id && (
                <Link
                  href={`/dashboard/leads/${visit.lead.id}`}
                  className="text-xs font-bold text-[#087fc3] hover:underline"
                >
                  View Lead CRM #{visit.lead.referenceNumber} →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#071a28]/10 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-[#071a28]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide">Client</p>
                  <p className="text-sm font-semibold text-[#071a28]">{visit.lead.fullName}</p>
                  <p className="text-[10px] text-[#647581]">Party of {visit.visitorCount} visitor{visit.visitorCount > 1 ? "s" : ""}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#071a28]/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#071a28]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-semibold text-[#071a28]">{visit.lead.displayPhone}</p>
                  <p className="text-[10px] text-[#647581]">Preferred: {visit.lead.preferredContactMethod}</p>
                </div>
              </div>

              {visit.lead.displayEmail && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#071a28]/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#071a28]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide">Email</p>
                    <p className="text-sm font-semibold text-[#071a28]">{visit.lead.displayEmail}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#087fc3]/10 flex items-center justify-center shrink-0">
                  {visit.meetingMode === "VIRTUAL_TOUR" ? (
                    <Video className="w-4 h-4 text-[#087fc3]" />
                  ) : (
                    <MapPin className="w-4 h-4 text-[#087fc3]" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide">Tour Type</p>
                  <p className="text-sm font-semibold text-[#071a28]">{MODE_LABELS[visit.meetingMode] ?? visit.meetingMode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tour Logistics & Meeting Instructions */}
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold mb-4">
              Tour Logistics & Property Access
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide mb-1">Target Asset</p>
                <p className="text-sm font-bold text-[#071a28]">{visit.property.title}</p>
                {visit.location?.name && (
                  <p className="text-xs text-[#647581]">{visit.location.name}</p>
                )}
              </div>

              {visit.virtualMeetingUrl && (
                <div>
                  <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide mb-1">Virtual Meeting Link</p>
                  <a
                    href={visit.virtualMeetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#087fc3] hover:underline truncate block"
                  >
                    {visit.virtualMeetingUrl} ↗
                  </a>
                </div>
              )}
            </div>

            {visit.meetingInstructions && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)]">
                <p className="text-[10px] font-mono uppercase tracking-wide text-[#647581] mb-1">Internal Instructions</p>
                <p className="text-xs text-[#071a28] leading-relaxed">{visit.meetingInstructions}</p>
              </div>
            )}
          </div>

          {/* Outcome Summary (if completed) */}
          {visit.status === "COMPLETED" && (
            <div className="bg-violet-50/50 rounded-2xl border border-violet-200 p-5 space-y-2">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-violet-800 font-bold">
                Visit Outcome Summary
              </h2>
              <p className="text-xs text-[#071a28] font-medium leading-relaxed">{visit.outcomeSummary}</p>
              <div className="flex items-center gap-4 text-[11px] text-[#647581] pt-1">
                <span>Interest Level: <strong className="text-violet-900">{visit.customerInterestLevel || "N/A"}</strong></span>
                {visit.followUpRecommendation && (
                  <span>Follow-up: <strong className="text-[#071a28]">{visit.followUpRecommendation}</strong></span>
                )}
              </div>
            </div>
          )}

          {/* Cancellation Info (if cancelled) */}
          {visit.status === "CANCELLED" && (
            <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-5 space-y-2">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-rose-800 font-bold">
                Cancellation Record
              </h2>
              <p className="text-xs text-rose-900 font-semibold">
                Reason: {visit.cancellationReason?.replace(/_/g, " ")}
              </p>
              {visit.cancellationNote && (
                <p className="text-xs text-[#647581]">{visit.cancellationNote}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <SiteVisitNotes visitId={visit.id} notes={visit.notes} version={visit.version} />

          {/* Activity Log / Timeline */}
          <SiteVisitTimeline events={visit.timeline} />
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-4">
          <SiteVisitStatusPanel
            visitId={visit.id}
            status={visit.status}
            priority={visit.priority}
            version={visit.version}
          />
          <SiteVisitSchedulePanel
            visitId={visit.id}
            status={visit.status}
            requestedStartAt={visit.requestedStartAt}
            requestedEndAt={visit.requestedEndAt}
            scheduledStartAt={visit.scheduledStartAt}
            scheduledEndAt={visit.scheduledEndAt}
            durationMinutes={visit.durationMinutes}
            bufferBeforeMinutes={visit.bufferBeforeMinutes}
            bufferAfterMinutes={visit.bufferAfterMinutes}
            meetingPointLabel={visit.meetingPointLabel}
            meetingAddress={visit.meetingAddress}
            meetingInstructions={visit.meetingInstructions}
            virtualMeetingUrl={visit.virtualMeetingUrl}
            assignedAdvisor={visit.assignedAdvisor}
            version={visit.version}
          />
          <SiteVisitAssignmentPanel
            visitId={visit.id}
            assignedAdvisor={visit.assignedAdvisor}
            version={visit.version}
            role={role}
          />

          {/* Metadata Card */}
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-2">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
              Record Info
            </h3>
            <div className="space-y-1 text-[10px] font-mono text-[#647581]">
              <p>Source: {visit.source}</p>
              <p>Requested by: {visit.requestedBy}</p>
              <p>Created: {formatDateTime(visit.createdAt)}</p>
              <p>Updated: {formatDateTime(visit.updatedAt)}</p>
              <p>Version: v{visit.version}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
