"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RefreshCw, ExternalLink, Menu } from "lucide-react";
import { NotificationBell } from "./notifications/NotificationBell";
import type { AdminUser } from "@/lib/auth/session";

interface DashboardTopBarProps {
  user: AdminUser;
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  onOpenMobileNav?: () => void;
}

export function DashboardTopBar({
  user,
  title,
  breadcrumbs = [{ label: "Dashboard", href: "/dashboard" }],
  onOpenMobileNav,
}: DashboardTopBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastRefreshed, setLastRefreshed] = useState<string>("Just now");

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    });
  };

  return (
    <header className="sticky top-0 z-30 bg-[#fffdf8]/90 backdrop-blur-md border-b border-[rgba(7,26,40,0.08)] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-[0_1px_3px_rgba(7,26,40,0.02)]">
      {/* Left: Mobile trigger & Breadcrumb */}
      <div className="flex items-center gap-3">
        {onOpenMobileNav && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-slate-50 transition-colors"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-[#647581] font-mono">
            {breadcrumbs.map((b, i) => (
              <span key={b.label} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                {b.href ? (
                  <Link href={b.href} className="hover:text-[#087fc3] transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-[#071a28] font-medium">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
          <h1 className="text-lg sm:text-xl font-normal font-serif text-[#071a28] tracking-tight mt-0.5">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Actions & Database Status */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Real-time System Status Indicator with Pulsing Radar Halo */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eaf5fa]/80 border border-[#087fc3]/25 text-[11px] font-mono font-bold text-[#087fc3] shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10b981]" />
          </span>
          <span className="tracking-wide">MongoDB Live</span>
          <span className="text-[10px] text-[#647581] font-normal font-mono tabular-nums">
            • {lastRefreshed}
          </span>
        </div>

        {/* Refresh Action */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isPending}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.1)] bg-white text-xs font-semibold text-[#071a28] hover:bg-slate-50 hover:border-[#087fc3]/40 shadow-2xs hover:scale-[1.02] active:scale-[0.98] transition-all ${
            isPending ? "opacity-60 cursor-wait" : ""
          }`}
          title={`Last refresh: ${lastRefreshed}`}
          aria-label="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#087fc3] ${isPending ? "animate-spin" : ""}`} />
          <span className="hidden md:inline">Sync</span>
        </button>

        {/* In-App Notifications Bell */}
        <NotificationBell />

        {/* Live Website Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#071a28] text-white text-xs font-semibold hover:bg-[#0a6ba3] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xs"
        >
          <span>Public Portal</span>
          <ExternalLink className="w-3 h-3 text-[#42b7e8]" />
        </Link>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[rgba(7,26,40,0.08)]">
          <div
            className="w-8 h-8 rounded-full bg-[#087fc3] text-white flex items-center justify-center font-bold text-xs shadow-xs"
            title={`${user.name} (${user.role})`}
          >
            {user.name.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
