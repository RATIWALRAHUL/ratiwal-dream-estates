"use client";

import React from "react";
import { MapPin, Navigation, Phone, Mail, Clock, Compass, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { siteConfig } from "@/config/site";

export function ContactOffices() {
  const offices = [
    {
      city: "Jaipur Flagship Advisory Office",
      state: "Rajasthan, India",
      tag: "Headquarters & Primary Advisory Lounge",
      address: siteConfig.contact.address,
      phone: siteConfig.contact.phone,
      email: siteConfig.contact.email,
      hours: siteConfig.contact.officeHours,
      corridors: ["Ajmer Road Expressway", "Jaipur Ring Road Zone", "Tonk Road & Diggi Highway", "Jagatpura & Mahal Road"],
      amenities: ["Private Fiduciary Consultation Room", "Direct Revenue Title Dossier Review", "On-Ground Site Visit Fleet Departure"],
      mapQuery: "Jaipur, Rajasthan, India",
    },
    {
      city: "Maharashtra & NCR Liaison Desk",
      state: "Navi Mumbai & NCR",
      tag: "Expansion Corridors Desk",
      address: "Navi Mumbai / Panvel & Bhiwadi Corridors",
      phone: siteConfig.contact.phone,
      email: siteConfig.contact.email,
      hours: "10:00 AM – 7:00 PM (By Appointment)",
      corridors: ["Navi Mumbai International Airport Zone", "Panvel Growth Triangle", "Bhiwadi & NCR Logistics Axis", "Ajmer & Pushkar Belt"],
      amenities: ["Remote Investor Due Diligence Briefs", "Virtual Plot Boundary Mapping", "NRI Video Consultation Assistance"],
      mapQuery: "Navi Mumbai, Maharashtra, India",
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[var(--alabaster)]" id="offices" aria-labelledby="offices-title">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Reveal>
            <div className="flex items-center justify-center gap-2 mb-3">
              <MapPin size={16} className="text-[var(--ratiwal-blue)]" />
              <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-[var(--ratiwal-blue)]">
                REGIONAL ADVISORY HUBS
              </span>
            </div>

            <h2
              id="offices-title"
              className="font-instrument text-[2.4rem] sm:text-[3.2rem] md:text-[3.8rem] text-[var(--midnight)] font-normal leading-[1.05] tracking-tight mb-4"
            >
              Visit our offices or coordinate{" "}
              <span className="italic text-[var(--ratiwal-blue)]">on-ground meetings.</span>
            </h2>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              We welcome private buyers, institutional investors, and family offices for structured consultations with complete legal dossiers.
            </p>
          </Reveal>
        </div>

        {/* 2 Office Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {offices.map((office, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              <div className="p-5 sm:p-7 md:p-9 rounded-2xl sm:rounded-3xl bg-white border border-[rgba(7,26,40,0.1)] shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--cyan-soft)] text-[var(--ratiwal-blue-deep)] text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      {office.tag}
                    </span>
                    <span className="text-xs font-bold text-[var(--ratiwal-blue)] whitespace-nowrap">
                      {office.state}
                    </span>
                  </div>

                  <h3 className="font-instrument text-2xl sm:text-3xl text-[var(--midnight)] font-normal leading-tight mb-4">
                    {office.city}
                  </h3>

                  {/* Contact Meta Details */}
                  <div className="space-y-3 text-xs sm:text-sm text-[var(--midnight)] mb-6">
                    <div className="flex items-start gap-3">
                      <MapPin size={17} className="text-[var(--ratiwal-blue)] flex-shrink-0 mt-0.5" />
                      <span>{office.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={17} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
                      <a href={`tel:${office.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-[var(--ratiwal-blue)] font-semibold">
                        {office.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={17} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
                      <a href={`mailto:${office.email}`} className="hover:text-[var(--ratiwal-blue)] font-medium">
                        {office.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={17} className="text-[var(--ratiwal-blue)] flex-shrink-0" />
                      <span className="text-[var(--text-secondary)]">{office.hours}</span>
                    </div>
                  </div>

                  {/* Focus Corridors */}
                  <div className="pt-4 border-t border-[rgba(7,26,40,0.06)] mb-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--midnight)] mb-2.5 flex items-center gap-1.5">
                      <Compass size={14} className="text-[var(--ratiwal-blue)]" />
                      Growth Corridors Covered
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {office.corridors.map((c, cIdx) => (
                        <span key={cIdx} className="text-[11.5px] px-2.5 py-1 rounded-md bg-[var(--surface)] border border-[rgba(7,26,40,0.08)] text-[var(--text-secondary)] font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Office Navigation Link */}
                <div className="pt-5 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.mapQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--ratiwal-blue)] hover:text-[var(--ratiwal-blue-deep)] transition-colors group"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    Private Consultations Available
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Embedded Interactive Map Preview Frame */}
        <Reveal delay={250}>
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[rgba(7,26,40,0.12)] shadow-md bg-white">
            <div className="p-4 sm:p-5 bg-[var(--surface)] border-b border-[rgba(7,26,40,0.08)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--cyan-soft)] text-[var(--ratiwal-blue)] flex items-center justify-center">
                  <Navigation size={16} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--midnight)] block">
                    Interactive Location &amp; Growth Map
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">
                    Jaipur, Rajasthan &bull; Ajmer Road, Ring Road &amp; Airport Vectors
                  </span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Jaipur, Rajasthan, India")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--ratiwal-blue)] text-white text-xs font-bold hover:bg-[var(--ratiwal-blue-deep)] transition-all shadow-xs"
              >
                Get Directions <ExternalLink size={12} />
              </a>
            </div>

            {/* Google Map iframe embed */}
            <div className="aspect-[16/7] w-full min-h-[340px] relative bg-[var(--mist-blue)]">
              <iframe
                title="Ratiwal Dream Estates Jaipur Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113888.16738914619!2d75.72051792942468!3d26.885141679093077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c4adf4c57e281%3A0xce163dd0d59e66b0!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full border-0 absolute inset-0 filter saturate-90"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
