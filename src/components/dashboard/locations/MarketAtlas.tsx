"use client";

import Image from "next/image";
import Link from "next/link";
import { Compass, MapPin, Building2, ShieldCheck, Layers, ArrowUpRight } from "lucide-react";
import type { PaginatedLocationsResult } from "@/lib/services/dashboard.service";

interface MarketAtlasProps {
  summary: PaginatedLocationsResult["summary"];
  activeState?: string;
  onSelectState?: (state: string) => void;
}

export function MarketAtlas({ summary, activeState = "ALL" }: MarketAtlasProps) {
  const statCards = [
    {
      label: "Active Corridors",
      value: summary?.activeMarkets ?? 0,
      sublabel: `${summary?.totalLocations ?? 0} Total Mapped Hubs`,
      icon: MapPin,
      highlight: true,
    },
    {
      label: "Master-Planned Parcels",
      value: summary?.totalProperties ?? 0,
      sublabel: "Townships & Land Units",
      icon: Building2,
      highlight: false,
    },
    {
      label: "Available Plot Inventory",
      value: summary?.totalAvailablePlots ?? 0,
      sublabel: "Ready for Registry / Token",
      icon: Layers,
      highlight: false,
    },
    {
      label: "Statutory Diligence Rate",
      value: "100%",
      sublabel: "RERA & Revenue Clear",
      icon: ShieldCheck,
      highlight: false,
    },
  ];

  return (
    <div className="relative rounded-2xl sm:rounded-3xl bg-[#071a28] text-white border border-[#0d2c42] shadow-[0_18px_44px_rgba(7,26,40,0.18)] overflow-hidden">
      {/* Background Hero Asset with Website Navy Gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/slide-1.jpg"
          alt="Ratiwal Planned Land Development"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1320px"
          className="object-cover object-center opacity-25 mix-blend-luminosity scale-105"
        />
        {/* Navy Overlay Gradients matching website visual treatment */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071a28] via-[#071a28]/95 to-[#0b2a40]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(66,183,232,0.16),transparent_70%)]" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-8">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {/* Branded Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(66,183,232,0.12)] border border-[rgba(66,183,232,0.25)] text-[#42b7e8] text-[11px] font-bold uppercase tracking-wider mb-3">
              <Compass className="w-3.5 h-3.5 text-[#42b7e8]" />
              <span>MARKET ATLAS &amp; REGIONAL INTELLIGENCE</span>
            </div>

            {/* Serif Heading using website typography */}
            <h2 className="font-instrument text-2xl sm:text-3xl lg:text-4xl text-white font-normal leading-tight tracking-tight">
              Growth Corridors &amp;{" "}
              <span className="italic text-[#42b7e8]">Strategic Land Hubs</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#a0b6c6] mt-2 max-w-2xl leading-relaxed font-body">
              Monitor real-time masterplan density, statutory zoning clearances, and active plot inventories across North-Western &amp; Western employment expressways.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="shrink-0 flex items-center gap-3">
            <Link
              href="/dashboard/locations/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#087fc3] hover:bg-[#0a6ba3] text-white text-xs font-semibold shadow-[0_4px_16px_rgba(8,127,195,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <span>Add Location</span>
            </Link>

            <Link
              href="/locations"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all duration-200 shadow-sm"
            >
              <span>Explore Public Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#42b7e8]" />
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-white/10">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#a0b6c6] font-medium font-body uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[rgba(66,183,232,0.15)] text-[#42b7e8] flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="font-instrument text-2xl sm:text-3xl text-white font-normal tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[10.5px] text-[#647581] font-mono mt-0.5">
                    {stat.sublabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
