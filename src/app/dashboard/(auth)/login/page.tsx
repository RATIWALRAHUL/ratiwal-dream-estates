"use client";

import React, { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { AuthFormContainer } from "@/components/dashboard/auth/AuthFormContainer";
import { AuthInput } from "@/components/dashboard/auth/AuthInput";
import { PasswordInput } from "@/components/dashboard/auth/PasswordInput";
import { PhoneInput } from "@/components/dashboard/auth/PhoneInput";
import { AuthAlert } from "@/components/dashboard/auth/AuthAlert";
import { AuthSubmitButton } from "@/components/dashboard/auth/AuthSubmitButton";
import { loginAdminAction } from "@/lib/actions/dashboard-auth.actions";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  const [authMode, setAuthMode] = useState<"EMAIL" | "PHONE">("EMAIL");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);

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
    if (!password) {
      setError("Please enter your administrator password.");
      return;
    }

    const formData = new FormData();
    formData.append("identifier", identifier);
    formData.append("password", password);
    formData.append("rememberDevice", String(rememberDevice));

    startTransition(async () => {
      const res = await loginAdminAction(formData);
      if (!res.success) {
        setError(res.error || "Unable to sign in with the provided credentials.");
      } else if (res.requiresMfa) {
        router.push(`/dashboard/mfa?email=${encodeURIComponent(res.accountEmail || email)}&token=${res.mfaToken}`);
      } else {
        // Direct browser navigation is instantaneous and ensures cookies are sent immediately
        window.location.href = returnUrl;
      }
    });
  };

  return (
    <AuthFormContainer
      title="Welcome back"
      subtitle="Sign in to your Ratiwal Control Center account to manage plotted inventories and operations."
    >
      {/* Identifier Mode Switcher */}
      <div className={`flex rounded-2xl bg-stone-100 p-1 border border-[rgba(7,26,40,0.06)] ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setAuthMode("EMAIL");
            setError(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            isPending ? "cursor-not-allowed" : ""
          } ${
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
          disabled={isPending}
          onClick={() => {
            setAuthMode("PHONE");
            setError(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            isPending ? "cursor-not-allowed" : ""
          } ${
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
            disabled={isPending}
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
            disabled={isPending}
            required
          />
        )}

        <div className="space-y-1">
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isPending}
            autoComplete="current-password"
          />

          <div className="flex items-center justify-end pt-1">
            <Link
              href="/dashboard/forgot-password"
              className={`text-xs font-semibold text-[#0088cc] hover:underline ${isPending ? "pointer-events-none opacity-50" : ""}`}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="rememberDevice"
            type="checkbox"
            disabled={isPending}
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            className="w-4 h-4 rounded border-stone-300 text-[#0088cc] focus:ring-[#0088cc] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
          <label
            htmlFor="rememberDevice"
            className={`text-xs font-medium text-[#071a28] ${isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            Remember this device for 30 days
          </label>
        </div>

        <div className="pt-2">
          <AuthSubmitButton isLoading={isPending}>
            Sign In to Dashboard
          </AuthSubmitButton>
        </div>
      </form>
    </AuthFormContainer>
  );
}

export default function DashboardLoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#647581]">Loading sign in...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
