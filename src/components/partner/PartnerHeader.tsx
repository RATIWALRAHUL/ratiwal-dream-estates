"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logoutPartnerAction } from "@/lib/actions/partner-auth.actions";
import type { PartnerUser } from "@/types/partner";

interface PartnerHeaderProps {
  user: PartnerUser;
}

export function PartnerHeader({ user }: PartnerHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/partner", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: "/partner/leads", label: "Lead Pipeline", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { href: "/partner/commissions", label: "Commissions", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { href: "/partner/statements", label: "Statements", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { href: "/partner/documents", label: "Documents", icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
    { href: "/partner/profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  ];

  const handleLogout = async () => {
    await logoutPartnerAction();
    router.push("/partner/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c121e]/95 backdrop-blur-md border-b border-[#2d3748] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Badge */}
          <div className="flex items-center space-x-4">
            <Link href="/partner" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                RD
              </div>
              <div>
                <span className="text-lg font-serif tracking-wider text-amber-400 font-semibold block leading-tight">
                  RATIWAL
                </span>
                <span className="text-[10px] tracking-widest text-slate-400 uppercase font-medium">
                  Partner Portal
                </span>
              </div>
            </Link>
            <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-700">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-950/60 border border-amber-500/30 text-amber-300">
                {user.partnerCode}
              </span>
              <span className="text-xs text-slate-400 truncate max-w-[180px]">
                {user.companyName}
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/partner" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={link.icon} />
                  </svg>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & User Menu */}
          <div className="flex items-center space-x-3">
            <Link
              href="/partner/leads/new"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Submit Lead</span>
            </Link>

            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-red-400 px-2.5 py-1.5 rounded hover:bg-slate-800/60 transition-colors"
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Exit</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0c121e] px-4 pt-3 pb-4 space-y-1">
          <div className="pb-3 border-b border-slate-800 mb-2">
            <p className="text-xs font-semibold text-amber-400">{user.name}</p>
            <p className="text-[11px] text-slate-400">{user.companyName} ({user.partnerCode})</p>
          </div>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <Link
              href="/partner/leads/new"
              onClick={() => setIsMenuOpen(false)}
              className="text-xs font-semibold text-amber-400 py-1"
            >
              + Register New Lead
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 hover:underline py-1"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
