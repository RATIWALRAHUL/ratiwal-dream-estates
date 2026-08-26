"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, RotateCcw, ArrowLeft, KeyRound } from "lucide-react";
import { AuthFormContainer } from "@/components/dashboard/auth/AuthFormContainer";
import { OtpInput } from "@/components/dashboard/auth/OtpInput";
import { AuthAlert } from "@/components/dashboard/auth/AuthAlert";
import { AuthSubmitButton } from "@/components/dashboard/auth/AuthSubmitButton";
import { verifyAdminResetOtpAction, resendAdminResetOtpAction } from "@/lib/actions/dashboard-auth.actions";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get("identifier") || "";
  const masked = searchParams.get("masked") || identifier;

  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError(null);
    setInfo(null);

    const formData = new FormData();
    formData.append("identifier", identifier);
    formData.append("otp", otp);

    startTransition(async () => {
      const res = await verifyAdminResetOtpAction(formData);
      if (!res.success) {
        setError(res.error || "The verification code is incorrect or has expired.");
      } else if (res.resetToken) {
        // Transition to reset password page with single-use reset token
        router.push(
          `/dashboard/reset-password?identifier=${encodeURIComponent(identifier)}&token=${res.resetToken}`
        );
      }
    });
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setError(null);

    const formData = new FormData();
    formData.append("identifier", identifier);

    const res = await resendAdminResetOtpAction(formData);
    setIsResending(false);

    if (res.success) {
      setCountdown(60);
      setOtp("");
      setInfo("A fresh 6-digit verification code has been dispatched.");
    } else {
      setError(res.error || "Failed to resend code.");
    }
  };

  return (
    <AuthFormContainer
      title="Verify your identity"
      subtitle={`We sent a 6-digit security code to ${masked || "your verified contact"}. Enter it below to proceed.`}
      backHref="/dashboard/forgot-password"
      backLabel="Change Destination"
    >
      {error && <AuthAlert type="ERROR" message={error} />}
      {info && <AuthAlert type="INFO" message={info} />}

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-center text-[#071a28]">
            Enter 6-Digit Code
          </label>
          <OtpInput value={otp} onChange={setOtp} error={Boolean(error)} disabled={isPending} />
        </div>

        <div className="flex items-center justify-between text-xs text-[#647581] pt-1">
          <span>Didn&apos;t receive code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || isResending}
            className="font-semibold text-[#0088cc] hover:underline disabled:text-stone-400 disabled:no-underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
            <span>{countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}</span>
          </button>
        </div>

        <div className="pt-2">
          <AuthSubmitButton isLoading={isPending} icon={<ShieldCheck className="w-4 h-4 shrink-0" />}>
            Verify & Continue
          </AuthSubmitButton>
        </div>
      </form>
    </AuthFormContainer>
  );
}

export default function VerifyResetOtpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#647581]">Loading verification...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
