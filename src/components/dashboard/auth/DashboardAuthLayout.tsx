"use client";

import React from "react";
import { AuthBrandPanel } from "./AuthBrandPanel";

interface DashboardAuthLayoutProps {
  children: React.ReactNode;
}

export function DashboardAuthLayout({ children }: DashboardAuthLayoutProps) {
  return (
    <div className="min-h-[100svh] w-full bg-[#f7f5ef] text-[#071a28] flex font-body antialiased selection:bg-[#0088cc] selection:text-white">
      {/* Left Branding Panel (Hidden on mobile / tablet < 1024px) */}
      <div className="hidden lg:block lg:w-[48%] xl:w-[46%] sticky top-0 h-[100svh] overflow-hidden shrink-0">
        <AuthBrandPanel />
      </div>

      {/* Right Form Viewport */}
      <div className="flex-1 min-h-[100svh] overflow-y-auto flex items-center justify-center p-4 sm:p-6 lg:p-10">
        {children}
      </div>
    </div>
  );
}
