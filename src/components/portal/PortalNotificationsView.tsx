"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export function PortalNotificationsView() {
  const [notifications] = useState([
    {
      id: "notif_1",
      title: "Portal Account Activated",
      message: "Your customer self-service portal workspace has been successfully activated.",
      category: "SECURITY",
      createdAt: new Date(),
      read: true,
    },
    {
      id: "notif_2",
      title: "Statutory KYC Verification",
      message: "Please ensure all applicant identity documents are up-to-date in your KYC vault.",
      category: "KYC",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
    },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
          Notifications & Activity
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Recent operational notices, payment confirmations, and milestone updates.
        </p>
      </div>

      <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-4"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-[#087fc3]/10 text-[#087fc3] shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-xs text-white">{n.title}</div>
                <p className="text-xs text-slate-300">{n.message}</p>
                <div className="text-[10px] text-slate-500">
                  {new Date(n.createdAt).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
