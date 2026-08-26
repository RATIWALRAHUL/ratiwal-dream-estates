"use client";

import React, { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";
import { AuthFormContainer } from "@/components/dashboard/auth/AuthFormContainer";
import { PasswordInput } from "@/components/dashboard/auth/PasswordInput";
import { PasswordStrength } from "@/components/dashboard/auth/PasswordStrength";
import { AuthAlert } from "@/components/dashboard/auth/AuthAlert";
import { AuthSubmitButton } from "@/components/dashboard/auth/AuthSubmitButton";
import { resetAdminPasswordAction } from "@/lib/actions/dashboard-auth.actions";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get("identifier") || "";
  const resetToken = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier || !resetToken) {
      setError("Your recovery session token is missing or has expired. Please restart the recovery flow.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The confirmed password does not match the new password.");
      return;
    }

    const formData = new FormData();
    formData.append("identifier", identifier);
    formData.append("resetToken", resetToken);
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    startTransition(async () => {
      const res = await resetAdminPasswordAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to update password. Please try again.");
      } else {
        router.push("/dashboard/auth/success");
      }
    });
  };

  return (
    <AuthFormContainer
      title="Create new password"
      subtitle="Choose a strong, unique password for your Ratiwal Control Center administrator account."
      backHref="/dashboard/login"
      backLabel="Cancel & Return to Login"
    >
      {error && <AuthAlert type="ERROR" message={error} />}

      <form onSubmit={handleReset} className="space-y-4">
        <PasswordInput
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />

        <PasswordStrength password={newPassword} />

        <PasswordInput
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />

        <div className="pt-2">
          <AuthSubmitButton isLoading={isPending} icon={<ShieldCheck className="w-4 h-4 shrink-0" />}>
            Reset Password & Terminate Old Sessions
          </AuthSubmitButton>
        </div>
      </form>
    </AuthFormContainer>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#647581]">Loading password reset...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
