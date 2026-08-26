"use client";

import React, { useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import { PasswordInput } from "./PasswordInput";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthAlert } from "./AuthAlert";

interface ReauthenticationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<{ success: boolean; error?: string }>;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

export function ReauthenticationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Administrator Password",
  description = "To terminate all other active device sessions, please confirm your current administrator password for security.",
  confirmLabel = "Confirm & Terminate Sessions",
}: ReauthenticationDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your current password.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const res = await onConfirm(password);
    setIsSubmitting(false);

    if (res.success) {
      setPassword("");
      onClose();
    } else {
      setError(res.error || "Password verification failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reauth-dialog-title"
        className="relative w-full max-w-md rounded-3xl bg-white border border-[rgba(7,26,40,0.12)] p-6 sm:p-7 shadow-2xl space-y-5 text-left animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-stone-400 hover:text-[#071a28] rounded-xl hover:bg-stone-100 transition"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 id="reauth-dialog-title" className="font-serif text-base font-bold text-[#071a28]">
              {title}
            </h3>
            <p className="text-xs text-[#647581] mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {error && <AuthAlert type="ERROR" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="Current Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoFocus
          />

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-[#647581] hover:text-[#071a28] rounded-xl hover:bg-stone-100 transition"
            >
              Cancel
            </button>
            <AuthSubmitButton isLoading={isSubmitting} className="w-auto px-5 py-2.5">
              {confirmLabel}
            </AuthSubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
