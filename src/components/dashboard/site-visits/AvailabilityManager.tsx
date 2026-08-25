"use client";
import { useState, useTransition } from "react";
import { Clock, Plus, Trash2, CheckCircle2, Loader2, Calendar } from "lucide-react";
import {
  updateAdvisorAvailabilityAction,
  addAvailabilityExceptionAction,
  removeAvailabilityExceptionAction,
} from "@/lib/actions/site-visit.actions";
import type { AvailabilityExceptionType } from "@/types/site-visit";

interface DaySchedule {
  dayOfWeek: number;
  startLocalTime: string;
  endLocalTime: string;
  active: boolean;
}

interface ExceptionItem {
  id: string;
  date: string;
  type: AvailabilityExceptionType;
  reason: string;
  startLocalTime?: string;
  endLocalTime?: string;
}

interface AvailabilityManagerProps {
  advisorId: string;
  advisorName: string;
  weeklySchedule: DaySchedule[];
  defaultVisitDurationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minBookingNoticeHours: number;
  maxAdvanceBookingDays: number;
  exceptions: ExceptionItem[];
  canEdit: boolean;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const EXCEPTION_LABELS: Record<AvailabilityExceptionType, string> = {
  FULL_DAY_UNAVAILABLE: "Full Day Unavailable",
  PARTIAL_DAY_UNAVAILABLE: "Partial Day Block",
  SPECIAL_HOURS: "Special Working Hours",
  HOLIDAY: "Public / Bank Holiday",
  LEAVE: "Personal Leave",
  PROPERTY_BLOCK: "Property Maintenance Block",
  ADMIN_BLOCK: "Administrative Block",
};

export function AvailabilityManager({
  advisorId,
  advisorName,
  weeklySchedule: initialSchedule,
  defaultVisitDurationMinutes: initialDuration,
  bufferBeforeMinutes: initialBufferBefore,
  bufferAfterMinutes: initialBufferAfter,
  minBookingNoticeHours: initialNotice,
  maxAdvanceBookingDays: initialAdvance,
  exceptions: initialExceptions,
  canEdit,
}: AvailabilityManagerProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
  const [duration, setDuration] = useState(initialDuration);
  const [bufferBefore, setBufferBefore] = useState(initialBufferBefore);
  const [bufferAfter, setBufferAfter] = useState(initialBufferAfter);
  const [noticeHours, setNoticeHours] = useState(initialNotice);
  const [advanceDays, setAdvanceDays] = useState(initialAdvance);

  const [exceptions, setExceptions] = useState<ExceptionItem[]>(initialExceptions);
  const [newDate, setNewDate] = useState("");
  const [newType, setNewType] = useState<AvailabilityExceptionType>("FULL_DAY_UNAVAILABLE");
  const [newReason, setNewReason] = useState("");

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleScheduleChange = (index: number, field: keyof DaySchedule, value: unknown) => {
    setSchedule((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await updateAdvisorAvailabilityAction({
        advisorId,
        weeklySchedule: schedule,
        defaultVisitDurationMinutes: duration,
        bufferBeforeMinutes: bufferBefore,
        bufferAfterMinutes: bufferAfter,
        minBookingNoticeHours: noticeHours,
        maxAdvanceBookingDays: advanceDays,
      });

      if (result.success) {
        setStatusMessage("Availability rules saved successfully.");
      } else {
        setErrorMessage(result.message);
      }
    });
  };

  const handleAddException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newReason.trim()) return;

    setStatusMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await addAvailabilityExceptionAction(advisorId, newDate, newType, newReason);
      if (result.success) {
        setExceptions((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            date: newDate,
            type: newType,
            reason: newReason.trim(),
          },
        ]);
        setNewDate("");
        setNewReason("");
        setStatusMessage("Blackout exception added.");
      } else {
        setErrorMessage(result.message);
      }
    });
  };

  const handleRemoveException = (exceptionId: string) => {
    startTransition(async () => {
      const result = await removeAvailabilityExceptionAction(advisorId, exceptionId);
      if (result.success) {
        setExceptions((prev) => prev.filter((e) => e.id !== exceptionId));
        setStatusMessage("Exception removed.");
      } else {
        setErrorMessage(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
          Advisor Availability & Scheduling Rules
        </h1>
        <p className="text-sm text-[#647581] mt-1">
          Configure weekly working windows, appointment buffers, and exception dates for {advisorName}.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Working Hours by Day */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#071a28]">Weekly Operating Schedule (IST)</h2>
          <div className="space-y-2">
            {schedule.map((day, idx) => (
              <div
                key={day.dayOfWeek}
                className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.04)]"
              >
                <div className="w-32 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`day-${day.dayOfWeek}`}
                    checked={day.active}
                    disabled={!canEdit}
                    onChange={(e) => handleScheduleChange(idx, "active", e.target.checked)}
                    className="rounded border-[rgba(7,26,40,0.2)] text-[#087fc3] focus:ring-[#087fc3]"
                  />
                  <label
                    htmlFor={`day-${day.dayOfWeek}`}
                    className={`text-xs font-bold ${day.active ? "text-[#071a28]" : "text-[#647581]"}`}
                  >
                    {DAYS[day.dayOfWeek]}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={day.startLocalTime}
                    disabled={!day.active || !canEdit}
                    onChange={(e) => handleScheduleChange(idx, "startLocalTime", e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-xs text-[#071a28] disabled:opacity-40"
                  />
                  <span className="text-xs text-[#647581]">to</span>
                  <input
                    type="time"
                    value={day.endLocalTime}
                    disabled={!day.active || !canEdit}
                    onChange={(e) => handleScheduleChange(idx, "endLocalTime", e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-xs text-[#071a28] disabled:opacity-40"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Durations & Buffers Configuration */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-4">
          <h2 className="text-sm font-bold text-[#071a28]">Timing & Buffer Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">
                Default Duration (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={240}
                step={15}
                value={duration}
                disabled={!canEdit}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">
                Buffer Before (Minutes)
              </label>
              <input
                type="number"
                min={0}
                max={120}
                step={5}
                value={bufferBefore}
                disabled={!canEdit}
                onChange={(e) => setBufferBefore(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">
                Buffer After (Minutes)
              </label>
              <input
                type="number"
                min={0}
                max={120}
                step={5}
                value={bufferAfter}
                disabled={!canEdit}
                onChange={(e) => setBufferAfter(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">
                Min Notice (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={48}
                value={noticeHours}
                disabled={!canEdit}
                onChange={(e) => setNoticeHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-[#071a28]"
              />
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
              Save Availability Rules
            </button>
          </div>
        )}
      </form>

      {/* Blackout Dates and Exceptions */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-4">
        <h2 className="text-sm font-bold text-[#071a28]">Blackout Dates & Schedule Exceptions</h2>

        {canEdit && (
          <form onSubmit={handleAddException} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3.5 rounded-xl bg-[#f8f7f4]">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              className="px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as AvailabilityExceptionType)}
              className="px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
            >
              {Object.entries(EXCEPTION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Reason (e.g. Festival Holiday)"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              required
              className="px-3 py-2 text-xs rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
            />
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-[#087fc3] hover:bg-[#0a6ba3] text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Exception
            </button>
          </form>
        )}

        <div className="space-y-2">
          {exceptions.length === 0 ? (
            <p className="text-xs text-[#647581] italic">No blackout exceptions recorded.</p>
          ) : (
            exceptions.map((exc) => (
              <div
                key={exc.id}
                className="flex items-center justify-between p-3 rounded-xl border border-[rgba(7,26,40,0.06)] bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#071a28]">{exc.date} — {EXCEPTION_LABELS[exc.type] ?? exc.type}</p>
                    <p className="text-[11px] text-[#647581]">{exc.reason}</p>
                  </div>
                </div>

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleRemoveException(exc.id)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove exception"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
