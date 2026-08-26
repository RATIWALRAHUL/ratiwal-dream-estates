"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { validatePasswordRequirements } from "@/lib/auth/password-rules";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { requirements, isValid } = validatePasswordRequirements(password);

  return (
    <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)] space-y-2 text-xs text-left">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[#071a28]">Password Requirement:</span>
        <span
          className={`font-mono font-bold text-[11px] ${
            isValid ? "text-emerald-700" : "text-amber-700"
          }`}
        >
          {isValid ? "Valid" : `${password.length}/8 characters`}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isValid ? "bg-emerald-500 w-full" : "bg-[#0088cc]"
          }`}
          style={{ width: `${Math.min(100, (password.length / 8) * 100)}%` }}
        />
      </div>

      {/* Requirements Checklist */}
      <div className="pt-0.5 space-y-1">
        {requirements.map((req) => (
          <div
            key={req.id}
            className={`flex items-center gap-1.5 text-[11px] transition-colors ${
              req.met ? "text-emerald-700 font-medium" : "text-stone-500"
            }`}
          >
            {req.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
            ) : (
              <X className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
