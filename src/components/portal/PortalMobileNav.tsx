"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building, CreditCard, FileText, LifeBuoy } from "lucide-react";

export function PortalMobileNav() {
  const pathname = usePathname();

  // Hide on login/claim pages
  if (pathname.includes("/login") || pathname.includes("/claim")) {
    return null;
  }

  const items = [
    { label: "Home", href: "/portal", icon: Home },
    { label: "Bookings", href: "/portal/bookings", icon: Building },
    { label: "Payments", href: "/portal/payments", icon: CreditCard },
    { label: "Documents", href: "/portal/documents", icon: FileText },
    { label: "Support", href: "/portal/support", icon: LifeBuoy },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#071a28]/95 backdrop-blur-md border-t border-white/10 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? "text-[#087fc3]" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-[#087fc3]" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
