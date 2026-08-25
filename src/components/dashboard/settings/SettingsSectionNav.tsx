"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Globe2,
  Sliders,
  ShieldCheck,
  KeyRound,
  Layers,
  History,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard/settings/general", label: "General & Org", icon: Building2 },
  { href: "/dashboard/settings/regional", label: "Regional & Hours", icon: Globe2 },
  { href: "/dashboard/settings/business", label: "CRM & SLAs", icon: Sliders },
  { href: "/dashboard/settings/security", label: "Security & Invites", icon: ShieldCheck },
  { href: "/dashboard/settings/roles", label: "Roles & Permissions", icon: KeyRound },
  { href: "/dashboard/settings/integrations", label: "Integrations Health", icon: Layers },
  { href: "/dashboard/settings/history", label: "Audit & Rollback", icon: History },
];

export function SettingsSectionNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2 border-b border-[rgba(7,26,40,0.08)] pb-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href === "/dashboard/settings/general" && pathname === "/dashboard/settings");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? "bg-[#071a28] text-white shadow-xs"
                : "bg-white text-[#647581] hover:text-[#071a28] hover:bg-[#f8f7f4] border border-[rgba(7,26,40,0.06)]"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#087fc3]" : "text-slate-400"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
