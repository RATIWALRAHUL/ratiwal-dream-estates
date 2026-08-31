"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type LogoLoaderVariant = "page" | "section" | "button" | "overlay";

export interface LogoLoaderProps {
  /**
   * Layout variant
   * - page: Full viewport/route transition loader
   * - section: Card/widget content loader
   * - button: Miniature button indicator
   * - overlay: Full relative/fixed backdrop overlay
   */
  variant?: LogoLoaderVariant;
  /**
   * Loader size scaling
   */
  size?: "sm" | "md" | "lg";
  /**
   * Theme mode
   * - dark: For navy/dark backgrounds
   * - light: For white/ivory light backgrounds
   * - auto: Inherits based on surrounding container
   */
  theme?: "dark" | "light" | "auto";
  /**
   * Custom accessible loading text / label
   */
  text?: string;
  label?: string;
  /**
   * Additional custom CSS classes
   */
  className?: string;
  /**
   * Whether to show the subtle progress shimmer bar
   */
  showProgressBar?: boolean;
}

export function LogoLoader({
  variant = "page",
  size = "md",
  theme = "auto",
  text,
  label,
  className,
  showProgressBar = true,
}: LogoLoaderProps) {
  const displayText = label || text || (variant === "button" ? "Processing..." : "Loading experience...");

  // 1. Miniature button loader
  if (variant === "button") {
    const dotSize = size === "sm" ? "h-2 w-2" : size === "lg" ? "h-3 w-3" : "h-2.5 w-2.5";
    return (
      <span
        role="status"
        aria-live="polite"
        aria-label={displayText}
        className={cn("inline-flex items-center justify-center gap-1.5 shrink-0 select-none", className)}
      >
        <span className={cn("relative flex items-center justify-center", dotSize)}>
          <span className={cn("motion-reduce:hidden animate-ping absolute inline-flex h-full w-full rounded-full bg-[#087fc3] opacity-60")} />
          <span className={cn("relative inline-flex rounded-full bg-[#087fc3]", dotSize)} />
        </span>
        <span className="sr-only">{displayText}</span>
      </span>
    );
  }

  // 2. Section / widget loader
  if (variant === "section") {
    const logoHeight = size === "sm" ? "h-5" : size === "lg" ? "h-9" : "h-7";
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label={displayText}
        className={cn(
          "flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-50/60 border border-[rgba(7,26,40,0.06)] min-h-[180px]",
          className
        )}
      >
        <div className="relative flex items-center justify-center mb-3">
          <div className="absolute inset-0 bg-[#087fc3]/10 rounded-full blur-md motion-reduce:hidden animate-pulse" />
          <Image
            src="/images/brand/ratiwal-logo.svg"
            alt="Ratiwal Dream Estates"
            width={140}
            height={48}
            priority
            className={cn("w-auto object-contain relative z-10 motion-reduce:animate-none animate-pulse transition-transform duration-700", logoHeight)}
          />
        </div>
        {displayText && (
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#647581] font-medium">
            {displayText}
          </span>
        )}
        {showProgressBar && (
          <div className="w-24 h-0.5 bg-slate-200 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-[#087fc3] rounded-full motion-reduce:w-full animate-[shimmer_1.5s_infinite_ease-in-out] w-1/2" />
          </div>
        )}
      </div>
    );
  }

  // 3. Full page / overlay loader
  const isDark = theme === "dark";
  const logoSrc = isDark ? "/images/brand/ratiwal-logo-white.svg" : "/images/brand/ratiwal-logo.svg";
  const pageLogoHeight = size === "sm" ? "h-8" : size === "lg" ? "h-14 sm:h-16" : "h-10 sm:h-12";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={displayText}
      className={cn(
        variant === "overlay"
          ? "absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md"
          : "min-h-[60vh] flex-1 flex flex-col items-center justify-center px-4 py-16",
        isDark ? "bg-[#031c2b] text-white" : "bg-[#fbfaf7] text-[#071a28]",
        className
      )}
    >
      {/* Ambient Animated Glow Aura */}
      <div className="relative flex flex-col items-center max-w-xs text-center">
        <div className="relative mb-6 flex items-center justify-center">
          <div
            className={cn(
              "absolute -inset-4 rounded-full blur-xl opacity-40 motion-reduce:hidden animate-pulse",
              isDark ? "bg-[#087fc3]/40" : "bg-[#0088cc]/20"
            )}
          />
          <div className="relative z-10 transition-transform duration-500 hover:scale-105">
            <Image
              src={logoSrc}
              alt="Ratiwal Dream Estates"
              width={200}
              height={70}
              priority
              className={cn("w-auto object-contain drop-shadow-sm", pageLogoHeight)}
            />
          </div>
        </div>

        {/* Status Text */}
        <p
          className={cn(
            "text-xs font-mono tracking-widest uppercase font-semibold mb-3",
            isDark ? "text-[#52bde9]" : "text-[#087fc3]"
          )}
        >
          {displayText}
        </p>

        {/* Precision Progress Indicator */}
        {showProgressBar && (
          <div
            className={cn(
              "w-36 h-1 rounded-full overflow-hidden relative",
              isDark ? "bg-white/10" : "bg-slate-200"
            )}
          >
            <div
              className={cn(
                "absolute top-0 bottom-0 rounded-full motion-reduce:w-full animate-[progress_1.8s_ease-in-out_infinite]",
                isDark ? "bg-gradient-to-r from-[#087fc3] to-[#52bde9]" : "bg-gradient-to-r from-[#0088cc] to-[#087fc3]"
              )}
              style={{ width: "40%" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
