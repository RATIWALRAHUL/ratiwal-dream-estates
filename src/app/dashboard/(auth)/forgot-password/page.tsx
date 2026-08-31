"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, KeyRound } from "lucide-react";
import { AuthFormContainer } from "@/components/dashboard/auth/AuthFormContainer";
import { AuthInput } from "@/components/dashboard/auth/AuthInput";
import { PhoneInput } from "@/components/dashboard/auth/PhoneInput";
import { AuthAlert } from "@/components/dashboard/auth/AuthAlert";
import { AuthSubmitButton } from "@/components/dashboard/auth/AuthSubmitButton";
import { requestAdminPasswordResetAction } from "@/lib/actions/dashboard-auth.actions";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [authMode, setAuthMode] = useState<"EMAIL" | "PHONE">("EMAIL");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const identifier = authMode === "EMAIL" ? email.trim() : `${countryCode}${phone.trim()}`;
    if (!identifier) {
      setError(`Please enter your ${authMode === "EMAIL" ? "email address" : "mobile number"}.`);
      return;
    }

    const formData = new FormData();
    formData.append("identifier", identifier);

    startTransition(async () => {
      const res = await requestAdminPasswordResetAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to process recovery request.");
      } else {
        // Transition to OTP verification page
        router.push(
          `/dashboard/verify-reset-otp?identifier=${encodeURIComponent(identifier)}&masked=${encodeURIComponent(
            res.maskedRecipient || identifier
          )}`
        );
      }
    });
  };

  return (
    <AuthFormContainer
      title="Forgot your password?"
      subtitle="Enter your verified corporate email address or mobile number. If it is connected to an eligible dashboard account, we will send a 6-digit verification code."
      backHref="/dashboard/login"
      backLabel="Back to Login"
    >
      {/* Mode Switcher */}
      <div className="flex rounded-2xl bg-stone-100 p-1 border border-[rgba(7,26,40,0.06)]">
        <button
          type="button"
          onClick={() => {
            setAuthMode("EMAIL");
            setError(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            authMode === "EMAIL"
              ? "bg-white text-[#071a28] shadow-xs"
              : "text-[#647581] hover:text-[#071a28]"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email Address</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMode("PHONE");
            setError(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            authMode === "PHONE"
              ? "bg-white text-[#071a28] shadow-xs"
              : "text-[#647581] hover:text-[#071a28]"
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Mobile Number</span>
        </button>
      </div>

      {error && <AuthAlert type="ERROR" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {authMode === "EMAIL" ? (
          <AuthInput
            label="Corporate Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@ratiwaldreamestates.com"
            autoComplete="username"
            icon={<Mail className="w-4 h-4" />}
          />
        ) : (
          <PhoneInput
            label="Registered Mobile Number"
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            phone={phone}
            onPhoneChange={setPhone}
            required
          />
        )}

        <div className="pt-2">
          <AuthSubmitButton isLoading={isPending} icon={<KeyRound className="w-4 h-4 shrink-0" />}>
            Send Verification Code
          </AuthSubmitButton>
        </div>
      </form>
    </AuthFormContainer>
  );
}
