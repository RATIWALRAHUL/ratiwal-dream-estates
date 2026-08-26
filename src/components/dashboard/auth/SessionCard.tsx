"use client";

import React from "react";
import { Laptop, Smartphone, Tablet, Globe, Clock, MapPin, Trash2, ShieldCheck } from "lucide-react";
import { AdminAuthSessionDTO } from "@/types/dashboard-auth";

interface SessionCardProps {
  session: AdminAuthSessionDTO;
  onRevoke: (sessionId: string) => void;
  isRevoking?: boolean;
}

export function SessionCard({ session, onRevoke, isRevoking = false }: SessionCardProps) {
  const DeviceIcon =
    session.deviceType === "MOBILE"
      ? Smartphone
      : session.deviceType === "TABLET"
      ? Tablet
      : Laptop;

  return (
    <div
      className={`p-5 rounded-3xl border transition-all duration-200 ${
        session.isCurrent
          ? "bg-white border-[#0088cc]/30 shadow-[0_4px_24px_rgba(0,136,204,0.06)]"
          : "bg-white border-[rgba(7,26,40,0.08)] shadow-[0_4px_20px_rgba(7,26,40,0.02)] hover:border-[rgba(7,26,40,0.16)]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              session.isCurrent
                ? "bg-[#eaf5fa] text-[#0088cc] border border-[#0088cc]/20"
                : "bg-stone-100 text-[#647581] border border-stone-200"
            }`}
          >
            <DeviceIcon className="w-5 h-5" />
          </div>

          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-serif text-sm font-bold text-[#071a28]">
                {session.browser} on {session.os}
              </h4>
              {session.isCurrent && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Current Device</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#647581]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>
                  {session.locationCity || "Jaipur"}, {session.locationCountry || "IN"} ({session.ipAddress})
                </span>
              </span>

              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>
                  Active: {new Date(session.lastActiveAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </span>
            </div>
          </div>
        </div>

        {!session.isCurrent && (
          <button
            type="button"
            disabled={isRevoking}
            onClick={() => onRevoke(session.id)}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition disabled:opacity-50 cursor-pointer"
            title="Terminate this session"
            aria-label="Revoke session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
