"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Layers,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  FileText,
  Settings,
  ExternalLink,
  LogOut,
  Lock,
  ShieldCheck,
  CreditCard,
  LifeBuoy,
  Briefcase,
  BadgePercent,
  CheckSquare,
  ListTodo,
  Globe,
} from "lucide-react";
import type { AdminUser } from "@/lib/auth/session";
import {
  getDashboardSidebarBadgesAction,
  DashboardSidebarBadgeCounts,
} from "@/lib/actions/dashboard-badges.actions";

interface DashboardSidebarProps {
  user: AdminUser;
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [badgeCounts, setBadgeCounts] = useState<DashboardSidebarBadgeCounts>({
    leads: 0,
    siteVisits: 0,
    support: 0,
    kyc: 0,
    tasks: 0,
    partners: 0,
  });

  const isMountedRef = useRef(true);

  const refreshBadges = async () => {
    if (!isMountedRef.current) return;
    if (typeof document !== "undefined" && document.hidden) return;

    try {
      const counts = await getDashboardSidebarBadgesAction();
      if (isMountedRef.current) {
        setBadgeCounts(counts);
      }
    } catch {
      // Safe fallback
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    refreshBadges();

    const interval = setInterval(refreshBadges, 30000);

    const handleVisibility = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        refreshBadges();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, []);

  // Re-check when route changes
  useEffect(() => {
    refreshBadges();
  }, [pathname]);

  const coreNavItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
      badgeCount: 0,
    },
    {
      label: "My Work",
      href: "/dashboard/my-work",
      icon: CheckSquare,
      active: pathname.startsWith("/dashboard/my-work"),
      badgeCount: 0,
    },
    {
      label: "Tasks",
      href: "/dashboard/tasks",
      icon: ListTodo,
      active: pathname.startsWith("/dashboard/tasks"),
      badgeCount: badgeCounts.tasks,
    },
    {
      label: "Properties",
      href: "/dashboard/properties",
      icon: Building2,
      active: pathname.startsWith("/dashboard/properties"),
      badgeCount: 0,
    },
    {
      label: "Locations",
      href: "/dashboard/locations",
      icon: MapPin,
      active: pathname.startsWith("/dashboard/locations"),
      badgeCount: 0,
    },
    {
      label: "Inventory",
      href: "/dashboard/inventory",
      icon: Layers,
      active: pathname.startsWith("/dashboard/inventory"),
      badgeCount: 0,
    },
    {
      label: "Deals & Pipeline",
      href: "/dashboard/deals",
      icon: LayoutDashboard,
      active: pathname.startsWith("/dashboard/deals"),
      badgeCount: 0,
    },
    {
      label: "Holds",
      href: "/dashboard/holds",
      icon: Lock,
      active: pathname.startsWith("/dashboard/holds"),
      badgeCount: 0,
    },
    {
      label: "Reservations",
      href: "/dashboard/reservations",
      icon: FileText,
      active: pathname.startsWith("/dashboard/reservations"),
      badgeCount: 0,
    },
    {
      label: "Bookings",
      href: "/dashboard/bookings",
      icon: Building2,
      active: pathname.startsWith("/dashboard/bookings"),
      badgeCount: 0,
    },
    {
      label: "Payments & Ledger",
      href: "/dashboard/payments",
      icon: CreditCard,
      active:
        pathname.startsWith("/dashboard/payments") ||
        pathname.startsWith("/dashboard/payment-plans") ||
        pathname.startsWith("/dashboard/manual-payments") ||
        pathname.startsWith("/dashboard/receipts") ||
        pathname.startsWith("/dashboard/refunds"),
      badgeCount: 0,
    },
    {
      label: "Customer KYC",
      href: "/dashboard/kyc",
      icon: ShieldCheck,
      active: pathname.startsWith("/dashboard/kyc"),
      badgeCount: badgeCounts.kyc,
    },
    {
      label: "Channel Partners",
      href: "/dashboard/partners",
      icon: Briefcase,
      active:
        pathname.startsWith("/dashboard/partners") ||
        pathname.startsWith("/dashboard/partner-leads"),
      badgeCount: badgeCounts.partners,
    },
    {
      label: "Commissions",
      href: "/dashboard/commissions",
      icon: BadgePercent,
      active: pathname.startsWith("/dashboard/commissions"),
      badgeCount: 0,
    },
    {
      label: "Leads & Inquiries",
      href: "/dashboard/leads",
      icon: Users,
      active: pathname.startsWith("/dashboard/leads"),
      badgeCount: badgeCounts.leads,
    },
    {
      label: "Site Visits",
      href: "/dashboard/site-visits",
      icon: Calendar,
      active: pathname.startsWith("/dashboard/site-visits"),
      badgeCount: badgeCounts.siteVisits,
    },
    {
      label: "Customer Support",
      href: "/dashboard/support",
      icon: LifeBuoy,
      active: pathname.startsWith("/dashboard/support"),
      badgeCount: badgeCounts.support,
    },
    {
      label: "Communications",
      href: "/dashboard/communications",
      icon: MessageSquare,
      active: pathname.startsWith("/dashboard/communications"),
      badgeCount: 0,
    },
    {
      label: "Analytics & Reports",
      href: "/dashboard/analytics",
      icon: BarChart3,
      active: pathname.startsWith("/dashboard/analytics") || pathname.startsWith("/dashboard/reports"),
      badgeCount: 0,
    },
    {
      label: "Legal Vault",
      href: "/dashboard/legal-vault",
      icon: FileText,
      active: pathname.startsWith("/dashboard/legal-vault"),
      badgeCount: 0,
    },
    {
      label: "Content & SEO",
      href: "/dashboard/content",
      icon: Globe,
      active: pathname.startsWith("/dashboard/content") || pathname.startsWith("/dashboard/seo"),
      badgeCount: 0,
    },
    {
      label: "Team Management",
      href: "/dashboard/team",
      icon: Users,
      active: pathname.startsWith("/dashboard/team"),
      badgeCount: 0,
    },
    {
      label: "System Settings",
      href: "/dashboard/settings",
      icon: Settings,
      active: pathname.startsWith("/dashboard/settings"),
      badgeCount: 0,
    },
  ];

  const upcomingNavItems: { label: string; icon: any; badge: string }[] = [];

  return (
    <aside className="w-64 bg-[#071a28] text-white flex flex-col shrink-0 border-r border-[#0d2c42] h-screen sticky top-0 select-none">
      {/* Brand Header (Fixed at top) */}
      <div className="p-4 sm:p-5 border-b border-[#0d2c42]/80 flex items-center justify-center shrink-0">
        <Link href="/" className="flex items-center justify-center w-full group py-1" aria-label="Ratiwal Dream Estates Home">
          <Image
            src="/images/brand/ratiwal-logo-white.svg"
            alt="Ratiwal Dream Estates"
            width={220}
            height={100}
            priority
            className="h-11 sm:h-12 w-auto max-w-[190px] object-contain transition-opacity duration-200 group-hover:opacity-90"
          />
        </Link>
      </div>

      {/* Navigation Menu (Scrollable with hidden scrollbar) */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-5 sidebar-scrollbar no-scrollbar" aria-label="Dashboard Navigation">
          {/* Core Modules */}
          <div className="space-y-1.5">
            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
              Core Modules
            </div>

            {coreNavItems.map((item) => {
              const Icon = item.icon;
              const hasBadge = Boolean(item.badgeCount && item.badgeCount > 0);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    item.active
                      ? "bg-gradient-to-r from-[#087fc3] to-[#0a6ba3] text-white shadow-[0_4px_16px_rgba(8,127,195,0.35)]"
                      : "text-[#cbd5e1] hover:bg-[#0d2c42] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <Icon className={`w-4 h-4 shrink-0 ${item.active ? "text-white" : "text-[#42b7e8] group-hover:text-white transition-colors"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {hasBadge ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#24D17F] shadow-[0_0_8px_#24D17F] animate-pulse" />
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none ${
                          item.active
                            ? "bg-white/20 text-white"
                            : "bg-[#24D17F]/20 text-[#24D17F]"
                        }`}
                      >
                        {item.badgeCount! > 99 ? "99+" : item.badgeCount}
                      </span>
                    </div>
                  ) : item.active ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] shrink-0" />
                  ) : null}
                </Link>
              );
            })}
          </div>

          {/* Next Phase / Upcoming Modules */}
          <div className="space-y-1.5 pt-2 border-t border-[#0d2c42]/60">
            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
              Upcoming Modules
            </div>

            {upcomingNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-[#647581] cursor-not-allowed opacity-60 hover:opacity-75 transition-opacity"
                  title="Coming in a future release"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#0d2c42] text-[#647581] border border-[#0d2c42]">
                    <Lock className="w-2.5 h-2.5" />
                    <span>{item.badge}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </nav>

      {/* Footer / Account / External Links */}
      <div className="p-4 border-t border-[#0d2c42]/80 space-y-3 shrink-0 bg-[#071a28]">
        {/* View Public Website */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#cbd5e1] hover:bg-[#0d2c42] hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-[#42b7e8]" />
            <span>Visit Live Website</span>
          </div>
          <span className="text-[10px] text-[#647581]">↗</span>
        </Link>

        {/* Signed In Admin Badge */}
        <div className="p-3 rounded-xl bg-[#0d2c42]/60 border border-[#0d2c42] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#087fc3]/20 border border-[#087fc3]/40 text-[#42b7e8] flex items-center justify-center font-bold text-xs shrink-0">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] font-mono text-[#42b7e8] truncate">
                {user.role}
              </p>
            </div>
          </div>

          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="p-1.5 rounded-lg text-[#647581] hover:text-rose-400 hover:bg-[#071a28] transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
