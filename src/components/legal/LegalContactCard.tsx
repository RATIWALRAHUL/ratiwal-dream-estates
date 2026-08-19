import React from "react";
import { Mail, MapPin, Phone, ShieldCheck, Clock, MessageSquare } from "lucide-react";
import { siteConfig } from "@/config/site";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

export function LegalContactCard() {
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  return (
    <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-white border border-[rgba(7,26,40,0.1)] shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={18} className="text-[var(--ratwal-blue)]" />
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--ratwal-blue)]">
          Compliance &amp; Advisory Desk
        </span>
      </div>

      <h3 className="font-instrument text-2xl sm:text-3xl text-[var(--midnight)] font-normal mb-3">
        Ratiwal Dream Estates Legal Office
      </h3>

      <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6 max-w-2xl">
        For official inquiries, title diligence submissions, data privacy requests, or regulatory clarifications regarding our land advisory practices, you may connect with our central compliance desk directly.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm mb-6">
        {/* Phone */}
        <a
          href={`tel:${siteConfig.contact.phone}`}
          className="p-3.5 rounded-xl bg-[var(--surface)] border border-[rgba(7,26,40,0.06)] hover:border-[var(--ratwal-blue)]/40 transition-colors flex items-start gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-white text-[var(--ratwal-blue)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Phone size={15} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Official Helpline
            </span>
            <span className="font-bold text-[var(--midnight)] group-hover:text-[var(--ratwal-blue)] transition-colors">
              {siteConfig.contact.phone}
            </span>
          </div>
        </a>

        {/* Email */}
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="p-3.5 rounded-xl bg-[var(--surface)] border border-[rgba(7,26,40,0.06)] hover:border-[var(--ratwal-blue)]/40 transition-colors flex items-start gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-white text-[var(--ratwal-blue)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Mail size={15} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Compliance Email
            </span>
            <span className="font-bold text-[var(--midnight)] group-hover:text-[var(--ratwal-blue)] transition-colors truncate block">
              {siteConfig.contact.email}
            </span>
          </div>
        </a>

        {/* Location & Hours */}
        <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[rgba(7,26,40,0.06)] flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-[var(--ratwal-blue)] flex items-center justify-center flex-shrink-0 shadow-xs">
            <MapPin size={15} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Advisory Office
            </span>
            <span className="font-bold text-[var(--midnight)] block">
              {siteConfig.contact.address}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-1">
              <Clock size={11} /> {siteConfig.contact.officeHours}
            </span>
          </div>
        </div>
      </div>

      {/* WhatsApp Action & Legal Review Disclaimer Note */}
      <div className="pt-4 border-t border-[rgba(7,26,40,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[11px] text-[var(--text-secondary)] leading-normal max-w-xl">
          <span className="font-bold text-[var(--midnight)]">Legal Professional Review Notice:</span> The policies and disclaimers on this website are established in accordance with applicable Indian real estate regulatory and electronic commerce guidelines. Final commercial agreements and statutory conveyances are executed under individual advocate supervision.
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25d366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-xs transition-colors flex-shrink-0"
        >
          <MessageSquare size={14} />
          <span>WhatsApp Advisory</span>
        </a>
      </div>
    </div>
  );
}