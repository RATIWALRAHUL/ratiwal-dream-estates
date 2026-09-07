import React from "react";
import { Phone, Mail, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";

interface AdvisorProfilePlaqueProps {
  name?: string;
  role?: string;
  reraNo?: string;
  experience?: string;
  clients?: string;
  salesExperience?: string;
  phone?: string;
  email?: string;
  availability?: string;
  className?: string;
}

export function AdvisorProfilePlaque({
  name = siteConfig.agent.name,
  role = siteConfig.agent.role,
  reraNo = siteConfig.agent.reraNo,
  experience = siteConfig.agent.experience,
  clients = siteConfig.agent.clients,
  salesExperience = siteConfig.agent.salesExperience,
  phone = siteConfig.agent.phone,
  email = siteConfig.agent.email,
  availability = "Available for private consultations",
  className = "",
}: AdvisorProfilePlaqueProps) {
  return (
    <div
      className={`bg-[var(--advisor-ivory)] border border-[var(--advisor-border)] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-[0_16px_36px_rgba(6,30,46,0.12)] backdrop-blur-md max-w-[340px] w-full transition-all duration-500 hover:shadow-[0_20px_44px_rgba(6,30,46,0.18)] ${className}`}
    >
      {/* Name and Designation */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-instrument text-[20px] sm:text-[22px] text-[var(--advisor-midnight)] font-normal leading-tight tracking-tight">
            {name}
          </h3>
          <p className="text-[12px] sm:text-[12.5px] font-semibold text-[var(--advisor-blue)] mt-0.5">
            {role}
          </p>
        </div>

        {/* RERA Verified Seal */}
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold tracking-tight flex-shrink-0"
          title={`RERA Registration No: ${reraNo}`}
        >
          <ShieldCheck size={11} className="text-emerald-700" aria-hidden="true" />
          <span>RERA Verified</span>
        </span>
      </div>

      {/* RERA Number Tag */}
      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[var(--advisor-graphite)] font-medium">
        <span className="text-[var(--advisor-muted)]">RERA:</span>
        <span className="font-semibold text-[var(--advisor-midnight)] tracking-wide">{reraNo}</span>
      </div>

      {/* Quick Track Record Chips */}
      <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-[var(--advisor-border)] text-center">
        <div className="bg-[var(--advisor-alabaster)] rounded-md py-1 px-1">
          <span className="block text-[11px] sm:text-[12px] font-bold text-[var(--advisor-midnight)] leading-none">
            {experience}
          </span>
          <span className="text-[9.5px] text-[var(--advisor-muted)] leading-none mt-0.5 block">
            Experience
          </span>
        </div>
        <div className="bg-[var(--advisor-alabaster)] rounded-md py-1 px-1">
          <span className="block text-[11px] sm:text-[12px] font-bold text-[var(--advisor-midnight)] leading-none">
            {clients}
          </span>
          <span className="text-[9.5px] text-[var(--advisor-muted)] leading-none mt-0.5 block">
            Clients
          </span>
        </div>
        <div className="bg-[var(--advisor-alabaster)] rounded-md py-1 px-1">
          <span className="block text-[11px] sm:text-[12px] font-bold text-[var(--advisor-midnight)] leading-none">
            {salesExperience}
          </span>
          <span className="text-[9.5px] text-[var(--advisor-muted)] leading-none mt-0.5 block">
            Sold
          </span>
        </div>
      </div>

      {/* Live Availability Status */}
      <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-[var(--advisor-border)]">
        <span
          className="relative flex h-2 w-2 flex-shrink-0"
          aria-hidden="true"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--advisor-green)] opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--advisor-green)]" />
        </span>
        <span className="text-[11.5px] sm:text-[12px] text-[var(--advisor-graphite)] font-medium leading-none">
          {availability}
        </span>
      </div>

      {/* Quick Direct Connect Actions */}
      <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-[var(--advisor-border)] text-[11px]">
        <a
          href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1 px-2 rounded-md bg-[var(--advisor-alabaster)] hover:bg-[var(--advisor-blue)] hover:text-white text-[var(--advisor-midnight)] font-semibold transition-colors duration-200"
          title={`Call ${name}`}
        >
          <Phone size={11} aria-hidden="true" />
          <span>{phone}</span>
        </a>
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center justify-center p-1.5 rounded-md bg-[var(--advisor-alabaster)] hover:bg-[var(--advisor-blue)] hover:text-white text-[var(--advisor-midnight)] transition-colors duration-200"
          title={`Email ${email}`}
          aria-label={`Send email to ${name}`}
        >
          <Mail size={12} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

