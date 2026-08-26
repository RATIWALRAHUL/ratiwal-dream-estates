"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowRight, Lock } from "lucide-react";
import { AuthFormContainer } from "@/components/dashboard/auth/AuthFormContainer";

export default function ResetSuccessPage() {
  return (
    <AuthFormContainer
      title="Password reset successfully"
      subtitle="Your administrator credentials have been securely updated."
    >
      <div className="text-center py-4 space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="p-4 rounded-2xl bg-[#fcfbf9] border border-[rgba(7,26,40,0.08)] text-left space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#071a28]">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Active Sessions Invalidated</span>
          </div>
          <p className="text-[#647581] leading-relaxed">
            All prior sessions across all desktop and mobile devices have been terminated for security. Please log in again using your new password.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard/login"
            className="w-full py-3 px-4 rounded-2xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </AuthFormContainer>
  );
}
