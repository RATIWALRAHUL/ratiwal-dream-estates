"use client";

import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopBar } from "./DashboardTopBar";
import { DashboardMobileNav } from "./DashboardMobileNav";
import type { AdminUser } from "@/lib/auth/session";

interface DashboardShellProps {
  user: AdminUser;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#071a28] flex font-body antialiased selection:bg-[#087fc3] selection:text-white">
      {/* Desktop Sidebar (Fixed and sticky on desktop) */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen z-40">
        <DashboardSidebar user={user} />
      </div>

      {/* Mobile Drawer */}
      <DashboardMobileNav
        user={user}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar
          user={user}
          title="Ratiwal Control Center"
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1320px] w-full mx-auto !pt-4 sm:!pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
