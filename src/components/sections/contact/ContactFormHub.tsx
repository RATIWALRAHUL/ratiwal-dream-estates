"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  FileText, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Building2 
} from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { SiteVisitForm } from "@/components/forms/SiteVisitForm";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

export function ContactFormHub() {
  const [activeTab, setActiveTab] = useState<"enquiry" | "site-visit" | "whatsapp">("enquiry");
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  return (
    <section className="py-12 sm:py-16 bg-[var(--surface)] border-y border-[rgba(7,26,40,0.06)]" id="consultation-form" aria-labelledby="form-hub-title">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <Reveal>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--ratiwal-blue)]" />
              <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-[var(--ratiwal-blue)]">
                SELECT CONSULTATION MODE
              </span>
            </div>

            <h2
              id="form-hub-title"
              className="font-instrument text-[2.4rem] sm:text-[3.2rem] md:text-[3.6rem] text-[var(--midnight)] font-normal leading-[1.05] tracking-tight mb-4"
            >
              Choose how you wish to{" "}
              <span className="italic text-[var(--ratiwal-blue)]">connect with us.</span>
            </h2>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              Every request is reviewed directly by our senior land advisory team with guaranteed confidentiality.
            </p>
          </Reveal>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="grid grid-cols-3 p-1.5 rounded-2xl bg-white border border-[rgba(7,26,40,0.1)] shadow-xs">
            <button
              onClick={() => setActiveTab("enquiry")}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === "enquiry"
                  ? "bg-[var(--ratiwal-blue)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--midnight)] hover:bg-[var(--surface)]"
              }`}
            >
              <FileText size={15} />
              <span>Advisory Form</span>
            </button>

            <button
              onClick={() => setActiveTab("site-visit")}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === "site-visit"
                  ? "bg-[var(--ratiwal-blue)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--midnight)] hover:bg-[var(--surface)]"
              }`}
            >
              <MapPin size={15} />
              <span>Site Visit</span>
            </button>

            <button
              onClick={() => setActiveTab("whatsapp")}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === "whatsapp"
                  ? "bg-[#25d366] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--midnight)] hover:bg-[var(--surface)]"
              }`}
            >
              <MessageSquare size={15} />
              <span>Instant Chat</span>
            </button>
          </div>
        </div>

        {/* Grid: Left Form Container + Right Advisory Dossier */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Form Panel */}
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-[rgba(7,26,40,0.1)] shadow-md">
            {activeTab === "enquiry" && (
              <div>
                <div className="mb-6 pb-4 border-b border-[rgba(7,26,40,0.06)]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ratiwal-blue)]">
                    Mode 1 &bull; Comprehensive Land Advisory
                  </span>
                  <h3 className="font-instrument text-2xl sm:text-3xl text-[var(--midnight)] font-normal mt-1">
                    Submit your investment parameters
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                    Receive verified land options with 30-year revenue titles, masterplan zone records, and pricing breakdowns.
                  </p>
                </div>
                <EnquiryForm />
              </div>
            )}

            {activeTab === "site-visit" && (
              <div>
                <div className="mb-6 pb-4 border-b border-[rgba(7,26,40,0.06)]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ratiwal-blue)]">
                    Mode 2 &bull; On-Ground Inspection Tour
                  </span>
                  <h3 className="font-instrument text-2xl sm:text-3xl text-[var(--midnight)] font-normal mt-1">
                    Schedule an accompanied plot inspection
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                    Our senior advisor accompanies you to inspect boundary markers, road dimensions, and neighborhood infrastructure.
                  </p>
                </div>
                <SiteVisitForm propertyId="general-consultation" propertyName="All Ratiwal Projects & Regional Growth Corridors" />
              </div>
            )}

            {activeTab === "whatsapp" && (
              <div className="py-6 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-[#25d366]/15 text-[#20ba59] mx-auto flex items-center justify-center">
                  <MessageSquare size={32} />
                </div>
                <div>
                  <h3 className="font-instrument text-2xl sm:text-3xl text-[var(--midnight)] font-normal">
                    Connect Directly on WhatsApp Priority Desk
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mt-2 leading-relaxed">
                    Skip email delays. Message our senior advisory desk immediately with your location preferences, plot size, or specific queries.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[rgba(7,26,40,0.08)] max-w-md mx-auto text-left text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[var(--midnight)]">
                    <CheckCircle2 size={15} className="text-[#25d366]" />
                    Direct access to Senior Property Advisors
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[var(--midnight)]">
                    <CheckCircle2 size={15} className="text-[#25d366]" />
                    Receive layout maps, patta papers &amp; video walkthroughs
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[var(--midnight)]">
                    <CheckCircle2 size={15} className="text-[#25d366]" />
                    Average response time: 10 - 15 minutes
                  </div>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-md transition-all hover:scale-105"
                >
                  <MessageSquare size={18} />
                  Start WhatsApp Conversation
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Advisor Profile Dossier & Guarantees */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Leadership Spotlight Plaque */}
            <div className="p-6 rounded-2xl sm:rounded-3xl bg-[var(--midnight)] text-white relative overflow-hidden border border-white/10 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[var(--cyan)] flex-shrink-0">
                  <Image
                    src="/images/brand/advisor-portrait.png"
                    alt="Rahul Ratiwal"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <h3 className="font-instrument text-2xl text-white font-normal leading-tight">
                    Rahul Ratiwal
                  </h3>
                  <p className="text-xs text-[var(--cyan)] font-semibold">
                    Founder &amp; Principal Property Advisor
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-[#20c978] animate-pulse" />
                    <span className="text-[11px] text-white/70">Available for consultations</span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-[13px] text-white/80 leading-relaxed italic border-t border-white/10 pt-3 mb-4">
                “Every enquiry at Ratiwal Dream Estates receives institutional due diligence. We never push land with legal ambiguity.”
              </p>

              <div className="space-y-2 text-xs text-white/90">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[var(--cyan)] flex-shrink-0" />
                  <span>30-Year Revenue Title Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[var(--cyan)] flex-shrink-0" />
                  <span>JDA / CIDCO / RERA Approval Audit</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[var(--cyan)] flex-shrink-0" />
                  <span>Zero Speculative Middleman Markups</span>
                </div>
              </div>
            </div>

            {/* Quick Response Guarantees */}
            <div className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--midnight)] flex items-center gap-2">
                <Clock size={16} className="text-[var(--ratiwal-blue)]" />
                Our Advisory Commitment
              </h3>

              <div className="space-y-3 text-xs sm:text-[13px] text-[var(--text-secondary)]">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[var(--ratiwal-blue)] flex-shrink-0 mt-0.5" />
                  <span><strong>Under 2-Hour Response:</strong> An advisor reviews your criteria promptly during working hours.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[var(--ratiwal-blue)] flex-shrink-0 mt-0.5" />
                  <span><strong>Accompanied Site Visits:</strong> Private site visit logistics arranged directly from Jaipur.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[var(--ratiwal-blue)] flex-shrink-0 mt-0.5" />
                  <span><strong>100% Confidential:</strong> Your investment parameters and contact data are strictly protected.</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[rgba(7,26,40,0.06)] text-xs text-[var(--text-secondary)]">
                Operating Hours: <strong>{siteConfig.contact.officeHours}</strong>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
