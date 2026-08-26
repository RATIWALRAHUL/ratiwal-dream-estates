"use client";

import React, { useId } from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

export function AuthInput({
  label,
  error,
  hint,
  icon,
  rightAdornment,
  className = "",
  id,
  required,
  ...props
}: AuthInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="space-y-1.5 w-full text-left">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="block text-xs font-bold text-[#071a28]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {hint && (
          <span id={hintId} className="text-[11px] text-[#647581]">
            {hint}
          </span>
        )}
      </div>

      <div className="relative rounded-2xl">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`w-full py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-[#fcfbf9] border transition-all duration-200 text-[#071a28] placeholder-stone-400 focus:outline-hidden focus:bg-white ${
            icon ? "pl-10" : "pl-3.5"
          } ${rightAdornment ? "pr-11" : "pr-3.5"} ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              : "border-[rgba(7,26,40,0.12)] focus:border-[#0088cc] focus:ring-2 focus:ring-[#0088cc]/20"
          } ${className}`}
          {...props}
        />

        {rightAdornment && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
            {rightAdornment}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-[11px] font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
