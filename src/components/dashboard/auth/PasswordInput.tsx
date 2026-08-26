"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { AuthInput } from "./AuthInput";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function PasswordInput({
  label = "Password",
  error,
  hint,
  autoComplete = "current-password",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState("CapsLock")) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      <AuthInput
        label={label}
        type={showPassword ? "text" : "password"}
        autoComplete={autoComplete}
        error={error}
        hint={hint}
        icon={<Lock className="w-4 h-4" />}
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyUp}
        rightAdornment={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="p-1 rounded-lg text-stone-400 hover:text-[#071a28] hover:bg-stone-100 transition"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        {...props}
      />

      {capsLockActive && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Caps Lock is ON</span>
        </div>
      )}
    </div>
  );
}
