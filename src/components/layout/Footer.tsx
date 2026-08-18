"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  Building2,
  CheckCircle2,
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { navigationConfig } from "@/config/navigation";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

// Clean custom social SVGs
function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "success">("idle");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("success");
    setTimeout(() => {
      setNewsletterEmail("");
      setNewsletterStatus("idle");
    }, 4000);
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  const trustHighlights = [
    {
      icon: ShieldCheck,
      title: "100% Legal Due Diligence",
      desc: "Thorough title, ownership & regulatory verification",
    },
    {
      icon: Building2,
      title: "Direct Landowner Pricing",
      desc: "Clear valuations with zero hidden markups",
    },
    {
      icon: MapPin,
      title: "Prime Growth Corridors",
      desc: "High-appreciation sectors in Jaipur & Mumbai Metro",
    },
    {
      icon: CheckCircle2,
      title: "10+ Years of Trust",
      desc: "Over 1,000+ satisfied land buyers & investors",
    },
  ];

  return (
    <footer className="w-full bg-white border-t border-slate-200/90 text-slate-700 relative z-10" aria-label="Site footer">
      {/* Top Trust & Value Strip */}
      <div className="border-b border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustHighlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-xs hover:border-[#087fc3]/40 hover:shadow-sm transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#087fc3] flex items-center justify-center flex-shrink-0 group-hover:bg-[#087fc3] group-hover:text-white transition-colors duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Col 1: Brand & Overview (4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <Link href="/" className="inline-block" aria-label="Ratiwal Dream Estates home">
                <Image
                  src="/images/brand/ratiwal-logo.svg"
                  alt="Ratiwal Dream Estates"
                  width={210}
                  height={84}
                  className="h-12 sm:h-14 w-auto object-contain"
                  priority={false}
                />
              </Link>

              <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-sm">
                {siteConfig.tagline} We guide home-seekers and investors to acquire legally verified land assets across Jaipur and Maharashtra with complete transactional visibility.
              </p>

              {/* RERA / Transparency pill badge */}
              <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-xs font-semibold text-[#0a6ba3]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#087fc3]" />
                <span>Verified Land Consultancy • Jaipur & Mumbai</span>
              </div>
            </div>

            {/* Social Channels */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Connect With Us
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Ratiwal Dream Estates on Instagram"
                  className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-[#087fc3] hover:text-white hover:border-[#087fc3] transition-all duration-300 shadow-xs hover:-translate-y-0.5"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect with Ratiwal Dream Estates on LinkedIn"
                  className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-[#087fc3] hover:text-white hover:border-[#087fc3] transition-all duration-300 shadow-xs hover:-translate-y-0.5"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Message Ratiwal Dream Estates on WhatsApp"
                  className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-[#25d366] hover:text-white hover:border-[#25d366] transition-all duration-300 shadow-xs hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a
                  href="https://ratiwaldreamestates.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Official Website"
                  className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-[#087fc3] hover:text-white hover:border-[#087fc3] transition-all duration-300 shadow-xs hover:-translate-y-0.5"
                >
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Company Navigation (2 cols on lg) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#087fc3]"></span>
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              {navigationConfig.footerNav.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-600 hover:text-[#087fc3] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                  >
                    <span className="text-slate-300">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/investment"
                  className="text-slate-600 hover:text-[#087fc3] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <span className="text-slate-300">›</span>
                  Investment Advisory
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 hover:text-[#087fc3] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <span className="text-slate-300">›</span>
                  Book Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Properties & Locations (3 cols on lg) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#087fc3]"></span>
              Locations & Plots
            </h3>
            <ul className="space-y-2.5 text-sm">
              {navigationConfig.footerNav.properties.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-600 hover:text-[#087fc3] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200 group"
                  >
                    <span className="text-slate-300 group-hover:text-[#087fc3]">›</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/locations/ajmer"
                  className="text-slate-600 hover:text-[#087fc3] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200"
                >
                  <span className="text-slate-300">›</span>
                  Ajmer Road Expressway
                </Link>
              </li>
              <li>
                <Link
                  href="/properties"
                  className="text-slate-600 hover:text-[#087fc3] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200 font-medium text-[#087fc3]"
                >
                  <span className="text-[#087fc3]">→</span>
                  View All Verified Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Office (3 cols on lg) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#087fc3]"></span>
              Direct Reach
            </h3>
            
            <div className="space-y-3.5 text-sm">
              {/* Phone card */}
              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/70 hover:border-sky-200 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white text-[#087fc3] shadow-2xs flex items-center justify-center flex-shrink-0 group-hover:bg-[#087fc3] group-hover:text-white transition-colors duration-200">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Direct Advisory Line
                  </span>
                  <span className="font-semibold text-slate-900 text-sm group-hover:text-[#087fc3] transition-colors">
                    {siteConfig.contact.phone}
                  </span>
                </div>
              </a>

              {/* Email card */}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/70 hover:border-sky-200 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-lg bg-white text-[#087fc3] shadow-2xs flex items-center justify-center flex-shrink-0 group-hover:bg-[#087fc3] group-hover:text-white transition-colors duration-200">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Inquiries & Proposals
                  </span>
                  <span className="font-semibold text-slate-900 text-xs sm:text-sm truncate block group-hover:text-[#087fc3] transition-colors">
                    {siteConfig.contact.email}
                  </span>
                </div>
              </a>

              {/* Location & Hours */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-[#087fc3] flex-shrink-0 mt-0.5" />
                  <span>{siteConfig.contact.address}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-500 pt-1.5 border-t border-slate-200/60">
                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{siteConfig.contact.officeHours}</span>
                </div>
              </div>

              {/* WhatsApp Quick CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all duration-200 hover:shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with Advisor on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter / Property Alerts Inline Strip */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-50 via-sky-50/40 to-slate-50 border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#087fc3] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Property Opportunities Newsletter</span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900">
              Get notified on new verified plots & market analyses
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Join 2,500+ investors receiving curated land listings and infrastructure updates before public launch.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex-shrink-0">
            {newsletterStatus === "success" ? (
              <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Thank you! You are subscribed to private updates.</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="px-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#087fc3] focus:ring-2 focus:ring-[#087fc3]/20 transition-all min-w-[240px]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#087fc3] hover:bg-[#0a6ba3] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer flex-shrink-0"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Copyright & Legal Links */}
      <div className="border-t border-slate-200/90 bg-slate-50/90 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
            <span className="hidden sm:inline text-slate-300">•</span>
            <p className="text-slate-400 text-[11px]">
              Lifelong Property Consultancy & Land Advisory
            </p>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-x-5 gap-y-2 text-xs">
            {navigationConfig.footerNav.support.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-500 hover:text-[#087fc3] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/sitemap.xml" className="text-slate-500 hover:text-[#087fc3] transition-colors">
              Sitemap
            </Link>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              type="button"
              className="ml-2 inline-flex items-center gap-1 text-slate-600 hover:text-[#087fc3] transition-colors font-medium cursor-pointer"
              aria-label="Scroll back to top of page"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
