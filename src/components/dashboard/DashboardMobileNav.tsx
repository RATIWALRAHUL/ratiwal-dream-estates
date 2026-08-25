"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
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
  X,
  LogOut,
} from "lucide-react";
import type { AdminUser } from "@/lib/auth/session";

interface DashboardMobileNavProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardMobileNav({ user, isOpen, onClose }: DashboardMobileNavProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const coreNavItems = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      label: "Properties",
      href: "/dashboard/properties",
      icon: Building2,
      active: pathname.startsWith("/dashboard/properties"),
    },
    {
      label: "Locations",
      href: "/dashboard/locations",
      icon: MapPin,
      active: pathname.startsWith("/dashboard/locations"),
    },
    {
      label: "Inventory",
      href: "/dashboard/inventory",
      icon: Layers,
      active: pathname.startsWith("/dashboard/inventory"),
    },
    {
      label: "Deals & Pipeline",
      href: "/dashboard/deals",
      icon: LayoutDashboard,
      active: pathname.startsWith("/dashboard/deals"),
    },
    {
      label: "Holds",
      href: "/dashboard/holds",
      icon: FileText,
      active: pathname.startsWith("/dashboard/holds"),
    },
    {
      label: "Reservations",
      href: "/dashboard/reservations",
      icon: FileText,
      active: pathname.startsWith("/dashboard/reservations"),
    },
    {
      label: "Bookings",
      href: "/dashboard/bookings",
      icon: Building2,
      active: pathname.startsWith("/dashboard/bookings"),
    },
    {
      label: "Leads & Inquiries",
      href: "/dashboard/leads",
      icon: Users,
      active: pathname.startsWith("/dashboard/leads"),
    },
    {
      label: "Site Visits",
      href: "/dashboard/site-visits",
      icon: Calendar,
      active: pathname.startsWith("/dashboard/site-visits"),
    },
    {
      label: "Communications",
      href: "/dashboard/communications",
      icon: MessageSquare,
      active: pathname.startsWith("/dashboard/communications"),
    },
    {
      label: "Analytics & Reports",
      href: "/dashboard/analytics",
      icon: BarChart3,
      active: pathname.startsWith("/dashboard/analytics") || pathname.startsWith("/dashboard/reports"),
    },
    {
      label: "Legal Vault",
      href: "/dashboard/legal-vault",
      icon: FileText,
      active: pathname.startsWith("/dashboard/legal-vault"),
    },
    {
      label: "Team Management",
      href: "/dashboard/team",
      icon: Users,
      active: pathname.startsWith("/dashboard/team"),
    },
    {
      label: "System Settings",
      href: "/dashboard/settings",
      icon: Settings,
      active: pathname.startsWith("/dashboard/settings"),
    },
  ];

  const upcomingNavItems: { label: string; icon: any; badge: string }[] = [];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        className="relative w-4/5 max-w-xs bg-[#071a28] text-white flex flex-col shadow-2xl z-10 h-full"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#0d2c42] flex items-center justify-between shrink-0">
          <Link href="/" onClick={onClose} className="flex items-center group py-1" aria-label="Ratiwal Dream Estates Home">
            <Image
              src="/images/brand/ratiwal-logo-white.svg"
              alt="Ratiwal Dream Estates"
              width={220}
              height={100}
              priority
              className="h-11 sm:h-12 w-auto max-w-[180px] object-contain"
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#647581] hover:text-white hover:bg-[#0d2c42] transition-colors"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links (Scrollable with hidden scrollbar) */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-5 sidebar-scrollbar no-scrollbar" aria-label="Mobile Dashboard Navigation">
          {/* Core Modules */}
          <div className="space-y-1.5">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
                Core Modules
              </div>

              {coreNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold min-h-[44px] transition-all duration-200 ${
                      item.active
                        ? "bg-gradient-to-r from-[#087fc3] to-[#0a6ba3] text-white shadow-md shadow-[#087fc3]/25"
                        : "text-[#cbd5e1] hover:bg-[#0d2c42] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${item.active ? "text-white" : "text-[#42b7e8]"}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Upcoming Modules */}
            <div className="space-y-1.5 pt-2 border-t border-[#0d2c42]/60">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
                Upcoming Modules
              </div>

              {upcomingNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-[#647581] opacity-60 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#0d2c42] text-[#647581]">
                      {item.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-[#0d2c42] space-y-3 shrink-0 bg-[#071a28]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-[#cbd5e1] hover:bg-[#0d2c42] hover:text-white transition-colors min-h-[44px]"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-[#42b7e8]" />
              <span>Visit Live Site</span>
            </div>
            <span className="text-[10px] text-[#647581]">↗</span>
          </Link>

          <div className="p-3 rounded-xl bg-[#0d2c42]/60 border border-[#0d2c42] flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] font-mono text-[#42b7e8]">{user.role}</p>
            </div>

            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="p-2 rounded-lg text-[#647581] hover:text-rose-400 hover:bg-[#071a28] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
