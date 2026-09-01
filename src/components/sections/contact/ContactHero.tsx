"use client";

import React from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Reveal } from "@/components/home/Reveal";
import { siteConfig } from "@/config/site";
import { Phone, MessageSquare, MapPin } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

export function ContactHero() {
  const breadcrumbItems = [{ label: "Contact Us", href: "/contact" }];
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  const contactCards = [
    {
      icon: Phone,
      title: "Direct Phone Line",
      value: siteConfig.contact.phone,
      subtext: "Mon – Sat: 10:00 AM – 7:00 PM IST",
      href: `tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, "")}`,
      actionText: "Call Advisor Now",
      badge: "Instant Support",
      isPrimary: true,
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Priority Desk",
      value: siteConfig.contact.whatsapp,
      subtext: "Average response: Under 15 mins",
      href: whatsappUrl,
      actionText: "Chat on WhatsApp",
      badge: "Fastest Response",
      isWhatsApp: true,
    },
    {
      icon: MapPin,
      title: "Flagship Advisory Lounge",
      value: siteConfig.contact.address,
      subtext: "Private consultations by appointment",
      href: "#offices",
      actionText: "View Office Details",
      badge: "Rajasthan & MH",
    },
  ];

  return (
    <section className="relative pt-6 pb-12 sm:pb-16 overflow-hidden" aria-labelledby="contact-hero-title">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(66,183,232,0.12),transparent_70%)] blur-3xl" />
      </div>

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Hero Title & Subheading */}
        <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-14">
          <Reveal>
            <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[var(--advisor-ivory)] border border-[rgba(8,127,195,0.2)] shadow-xs mb-4 max-w-full">
              <span className="w-2 h-2 rounded-full bg-[#20c978] animate-pulse flex-shrink-0" />
              <span className="text-[10px] xs:text-[11px] sm:text-[12.5px] font-bold tracking-[0.06em] xs:tracking-[0.1em] sm:tracking-[0.16em] uppercase text-[var(--ratiwal-blue)] font-body whitespace-nowrap leading-none">
                PRIVATE CLIENT ADVISORY DESK
              </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1
              id="contact-hero-title"
              className="font-instrument text-[2.75rem] sm:text-[3.6rem] md:text-[4.4rem] lg:text-[4.9rem] text-[var(--midnight)] font-normal leading-[1.02] tracking-tight mb-5"
            >
              Let’s discuss your land investment with{" "}
              <span className="italic text-[var(--ratiwal-blue)]">complete clarity.</span>
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto font-medium">
              Schedule a 1-on-1 consultation with our senior property advisors, coordinate an on-ground site inspection, or connect directly on WhatsApp.
            </p>
          </Reveal>
        </div>

        {/* 3 Interactive Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {contactCards.map((card, idx) => (
            <Reveal key={idx} delay={200 + idx * 75}>
              <div
                className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-full group ${
                  card.isPrimary
                    ? "bg-white border-[rgba(8,127,195,0.3)] shadow-md hover:shadow-lg hover:-translate-y-1"
                    : card.isWhatsApp
                    ? "bg-white border-[rgba(37,211,102,0.3)] shadow-sm hover:shadow-md hover:-translate-y-1"
                    : "bg-white border-[rgba(7,26,40,0.08)] shadow-xs hover:shadow-md hover:border-[rgba(8,127,195,0.25)] hover:-translate-y-1"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        card.isWhatsApp
                          ? "bg-[#25d366]/15 text-[#20ba59]"
                          : "bg-[var(--cyan-soft)] text-[var(--ratiwal-blue-deep)]"
                      }`}
                    >
                      <card.icon size={22} strokeWidth={1.8} />
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        card.isWhatsApp
                          ? "bg-[#25d366]/10 text-[#128c7e]"
                          : "bg-[var(--mist-blue)] text-[var(--ratiwal-blue-deep)]"
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    {card.title}
                  </h3>

                  <div className="font-instrument text-2xl text-[var(--midnight)] font-normal leading-tight mb-1">
                    {card.value}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)]">
                    {card.subtext}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-[rgba(7,26,40,0.06)]">
                  <a
                    href={card.href}
                    target={card.isWhatsApp ? "_blank" : undefined}
                    rel={card.isWhatsApp ? "noopener noreferrer" : undefined}
                    className={`inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                      card.isWhatsApp
                        ? "bg-[#25d366] text-white hover:bg-[#20ba59] shadow-sm"
                        : card.isPrimary
                        ? "bg-[var(--ratiwal-blue)] text-white hover:bg-[var(--ratiwal-blue-deep)] shadow-sm"
                        : "bg-[var(--surface)] text-[var(--midnight)] hover:bg-[var(--mist-blue)] border border-[rgba(7,26,40,0.08)]"
                    }`}
                  >
                    {card.actionText} &rarr;
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
