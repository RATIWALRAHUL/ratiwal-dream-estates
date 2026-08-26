"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { LogoLoader } from "@/components/ui/LogoLoader";

interface AuthSubmitButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "submit" | "button";
}

export function AuthSubmitButton({
  children,
  isLoading = false,
  disabled = false,
  icon,
  className = "",
  onClick,
  type = "submit",
}: AuthSubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`w-full py-3 px-4 rounded-2xl bg-[#0088cc] hover:bg-[#0077b5] active:bg-[#006ca3] text-white text-xs sm:text-sm font-semibold shadow-[0_4px_16px_rgba(0,136,204,0.25)] hover:shadow-[0_6px_20px_rgba(0,136,204,0.35)] flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {isLoading ? (
        <>
          <LogoLoader variant="button" text="Processing..." />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {icon || <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />}
        </>
      )}
    </button>
  );
}
