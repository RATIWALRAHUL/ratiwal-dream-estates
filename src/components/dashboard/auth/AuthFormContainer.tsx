"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield } from "lucide-react";

interface AuthFormContainerProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  footerNote?: string;
}

export function AuthFormContainer({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  children,
  footerNote,
}: AuthFormContainerProps) {
  return (
    <div className="w-full max-w-[460px] mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center min-h-[calc(100svh-4rem)]">
      {/* Mobile Branding (Visible only on mobile screens < 1024px) */}
      <div className="lg:hidden mb-6 text-center flex items-center justify-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group" aria-label="Ratiwal Dream Estates Home">
          <Image
            src="/images/brand/ratiwal-logo.svg"
            alt="Ratiwal Dream Estates"
            width={180}
            height={60}
            priority
            className="h-8 sm:h-9 w-auto max-w-[160px] object-contain"
          />
          <div className="h-4 w-px bg-slate-300" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#0088cc] font-bold bg-[#0088cc]/10 px-2 py-0.5 rounded border border-[#0088cc]/20">
            Control Center
          </span>
        </Link>
      </div>

      {/* Back Control */}
      {backHref && (
        <div className="mb-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#647581] hover:text-[#071a28] transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>{backLabel}</span>
          </Link>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] p-6 sm:p-8 shadow-[0_8px_32px_rgba(7,26,40,0.04)] space-y-6">
        <div className="space-y-1.5 text-left">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#071a28]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#647581] leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>

      {/* Footer Security Assurance */}
      <div className="mt-6 text-center space-y-2">
        {footerNote && (
          <p className="text-xs text-[#647581]">
            {footerNote}
          </p>
        )}
        <div className="inline-flex items-center gap-1.5 text-[11px] text-[#647581] font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Protected by Enterprise Role-Based Access Control</span>
        </div>
      </div>
    </div>
  );
}
