"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building,
  Home,
  FileText,
  CreditCard,
  Calendar,
  LifeBuoy,
  User,
  LogOut,
  ShieldCheck,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { logoutCustomerAction } from "@/lib/actions/portal-auth.actions";
import { CustomerUser } from "@/types/portal";

interface PortalHeaderProps {
  user?: CustomerUser;
}

export function PortalHeader({ user }: PortalHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { label: "Overview", href: "/portal", icon: Home },
    { label: "Bookings", href: "/portal/bookings", icon: Building },
    { label: "Payments", href: "/portal/payments", icon: CreditCard },
    { label: "KYC & Identity", href: "/portal/kyc", icon: ShieldCheck },
    { label: "Documents", href: "/portal/documents", icon: FileText },
    { label: "Site Visits", href: "/portal/site-visits", icon: Calendar },
    { label: "Support", href: "/portal/support", icon: LifeBuoy },
  ];

  const handleLogout = () => {
    startTransition(async () => {
      await logoutCustomerAction();
      router.push("/portal/login");
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#071a28]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.08)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/portal" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#087fc3] to-[#055a8c] flex items-center justify-center shadow-md font-serif font-bold text-white text-lg">
                R
              </div>
              <div className="flex flex-col">
                <span className="font-serif tracking-wide text-sm font-semibold text-white">
                  RATIWAL DREAM ESTATES
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#087fc3] font-medium">
                  Customer Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/portal"
                  ? pathname === "/portal"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#087fc3] text-white shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User / Profile menu */}
          <div className="flex items-center space-x-3">
            <Link
              href="/portal/notifications"
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/portal/profile"
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs text-slate-200"
                >
                  <User className="w-3.5 h-3.5 text-[#087fc3]" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/portal/login"
                className="px-3 py-1.5 rounded-lg bg-[#087fc3] text-white text-xs font-semibold hover:bg-[#066ca8] transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#071a28] px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/portal"
                ? pathname === "/portal"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-[#087fc3] text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs text-slate-400 px-3">
            <Link
              href="/portal/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white"
            >
              Privacy & DPDP
            </Link>
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-rose-400 hover:text-rose-300"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
