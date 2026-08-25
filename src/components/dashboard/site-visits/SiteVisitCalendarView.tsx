"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Video, MapPin, Eye } from "lucide-react";
import { SiteVisitStatusBadge } from "./SiteVisitStatusBadge";
import type { SiteVisitCalendarEvent } from "@/lib/services/site-visit.service";

interface SiteVisitCalendarViewProps {
  events: SiteVisitCalendarEvent[];
  initialDate?: string; // YYYY-MM-DD
}

type ViewMode = "day" | "week" | "agenda";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 AM to 8:00 PM

function formatDateIST(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimeIST(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function SiteVisitCalendarView({ events, initialDate }: SiteVisitCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => (initialDate ? new Date(initialDate) : new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  // Calculate start of current week (Sunday)
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === "day") next.setDate(next.getDate() - 1);
    else if (viewMode === "week") next.setDate(next.getDate() - 7);
    else next.setMonth(next.getMonth() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === "day") next.setDate(next.getDate() + 1);
    else if (viewMode === "week") next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Group events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = new Map<string, SiteVisitCalendarEvent[]>();
    for (const event of events) {
      const dateKey = new Date(event.startAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
      const existing = map.get(dateKey) || [];
      existing.push(event);
      map.set(dateKey, existing);
    }
    return map;
  }, [events]);

  const activeDateKey = currentDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const activeDayEvents = eventsByDate.get(activeDateKey) || [];

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
      {/* Calendar Header & Toolbar */}
      <div className="p-4 border-b border-[rgba(7,26,40,0.06)] flex flex-wrap items-center justify-between gap-3 bg-[#f8f7f4]/60">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs font-bold text-[#071a28] hover:bg-white transition-colors"
          >
            Today
          </button>
          <div className="flex items-center">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-[#647581] hover:text-[#071a28] hover:bg-white transition-colors"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-[#647581] hover:text-[#071a28] hover:bg-white transition-colors"
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="font-serif font-bold text-base text-[#071a28] ml-1">
            {viewMode === "day"
              ? formatDateIST(currentDate)
              : `${formatDateIST(weekDays[0])} – ${formatDateIST(weekDays[6])}`}
          </span>
          <span className="text-[10px] font-mono text-[#647581] ml-2 hidden sm:inline">(Asia/Kolkata)</span>
        </div>

        {/* View Toggle */}
        <div className="flex rounded-xl bg-white border border-[rgba(7,26,40,0.12)] p-1 gap-1">
          {(["day", "week", "agenda"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                viewMode === mode ? "bg-[#071a28] text-white shadow-xs" : "text-[#647581] hover:text-[#071a28]"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Week View */}
      {viewMode === "week" && (
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-[rgba(7,26,40,0.06)] bg-[#f8f7f4]/40">
              {weekDays.map((d, i) => {
                const dateKey = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                const isToday = dateKey === new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                const dayCount = (eventsByDate.get(dateKey) || []).length;
                return (
                  <div
                    key={i}
                    className={`p-3 text-center border-r border-[rgba(7,26,40,0.04)] last:border-r-0 ${
                      isToday ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <p className="text-[10px] font-mono uppercase text-[#647581]">{DAYS_OF_WEEK[i]}</p>
                    <p className={`text-sm font-bold mt-0.5 ${isToday ? "text-[#087fc3]" : "text-[#071a28]"}`}>
                      {d.getDate()}
                    </p>
                    {dayCount > 0 && (
                      <span className="inline-block mt-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#087fc3]/10 text-[#087fc3]">
                        {dayCount} visit{dayCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Week Event Columns */}
            <div className="grid grid-cols-7 min-h-[360px] divide-x divide-[rgba(7,26,40,0.04)]">
              {weekDays.map((d, i) => {
                const dateKey = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                const dayEvents = eventsByDate.get(dateKey) || [];
                return (
                  <div key={i} className="p-2 space-y-2">
                    {dayEvents.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-[10px] text-slate-300 italic">No visits</span>
                      </div>
                    ) : (
                      dayEvents.map((evt) => (
                        <Link
                          key={evt.id}
                          href={`/dashboard/site-visits/${evt.id}`}
                          className="block p-2.5 rounded-xl border border-[rgba(7,26,40,0.08)] bg-white shadow-xs hover:border-[#087fc3]/40 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[9px] font-mono text-[#087fc3] font-bold">
                              {formatTimeIST(evt.startAt)}
                            </span>
                            <SiteVisitStatusBadge status={evt.status} className="scale-90 origin-right" />
                          </div>
                          <p className="text-xs font-semibold text-[#071a28] truncate group-hover:text-[#087fc3] transition-colors">
                            {evt.propertyTitle}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-[#647581] mt-1">
                            {evt.meetingMode === "VIRTUAL_TOUR" ? <Video className="w-3 h-3 text-[#087fc3]" /> : <MapPin className="w-3 h-3 text-[#087fc3]" />}
                            <span className="truncate">{evt.assignedAdvisorName || "Unassigned"}</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === "day" && (
        <div className="p-4 space-y-3">
          {activeDayEvents.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#071a28]">No visits scheduled for this day</p>
              <p className="text-xs text-[#647581]">Use the date navigator above to check other days.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeDayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-2xl border border-[rgba(7,26,40,0.08)] bg-white shadow-xs flex flex-wrap items-center justify-between gap-3 hover:border-[#087fc3]/30 transition-all"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#087fc3]/10 flex items-center justify-center shrink-0">
                      {evt.meetingMode === "VIRTUAL_TOUR" ? (
                        <Video className="w-5 h-5 text-[#087fc3]" />
                      ) : (
                        <MapPin className="w-5 h-5 text-[#087fc3]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#087fc3]">
                          {formatTimeIST(evt.startAt)} – {formatTimeIST(evt.endAt)}
                        </span>
                        <SiteVisitStatusBadge status={evt.status} />
                      </div>
                      <h4 className="text-sm font-bold text-[#071a28] mt-0.5">{evt.propertyTitle}</h4>
                      <p className="text-xs text-[#647581]">
                        Advisor: <span className="font-semibold text-[#071a28]">{evt.assignedAdvisorName || "Unassigned"}</span>
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/site-visits/${evt.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#087fc3] border border-[#087fc3]/30 hover:bg-[#087fc3]/5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Agenda View */}
      {viewMode === "agenda" && (
        <div className="p-4 space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#071a28]">No upcoming visits in the selected range</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from(eventsByDate.entries()).map(([dateStr, dateEvents]) => (
                <div key={dateStr} className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-[#647581] uppercase tracking-wider border-b border-[rgba(7,26,40,0.06)] pb-1">
                    {formatDateIST(new Date(dateStr))}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {dateEvents.map((evt) => (
                      <Link
                        key={evt.id}
                        href={`/dashboard/site-visits/${evt.id}`}
                        className="p-3 rounded-xl border border-[rgba(7,26,40,0.08)] bg-white shadow-xs hover:border-[#087fc3]/30 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-mono text-[#087fc3] font-bold">
                              {formatTimeIST(evt.startAt)}
                            </span>
                            <SiteVisitStatusBadge status={evt.status} />
                          </div>
                          <p className="text-xs font-bold text-[#071a28] truncate">{evt.propertyTitle}</p>
                        </div>
                        <p className="text-[10px] text-[#647581] mt-2">
                          {evt.assignedAdvisorName ? `Advisor: ${evt.assignedAdvisorName}` : "Unassigned"}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
