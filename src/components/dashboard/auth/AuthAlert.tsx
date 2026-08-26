"use client";

import React from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface AuthAlertProps {
  type?: "ERROR" | "SUCCESS" | "WARNING" | "INFO";
  message: string;
  className?: string;
}

export function AuthAlert({ type = "ERROR", message, className = "" }: AuthAlertProps) {
  if (!message) return null;

  const styles = {
    ERROR: "bg-rose-50 border-rose-200 text-rose-800",
    SUCCESS: "bg-emerald-50 border-emerald-200 text-emerald-800",
    WARNING: "bg-amber-50 border-amber-200 text-amber-800",
    INFO: "bg-[#eaf5fa] border-[#087fc3]/20 text-[#071a28]",
  };

  const Icons = {
    ERROR: AlertCircle,
    SUCCESS: CheckCircle2,
    WARNING: AlertTriangle,
    INFO: Info,
  };

  const Icon = Icons[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 shadow-xs transition-all ${styles[type]} ${className}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="leading-relaxed font-medium">{message}</span>
    </div>
  );
}
