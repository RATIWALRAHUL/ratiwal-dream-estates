"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, MessageSquare, Phone, ArrowRight, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { navigationConfig } from "@/config/navigation";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const pathname = usePathname();

  // Auto-close on route transition
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Accessibility: Esc key listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when sidebar is visible
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  return (
    <div
      id="mobile-navigation"
      className={cn(
        "fixed inset-0 z-[100] lg:hidden transition-all duration-300",
        isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
      )}
      aria-hidden={!isOpen}
    >
      {/* Backdrop overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-[#071a28]/70 backdrop-blur-md transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content panel */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-[320px] max-w-[88vw] bg-white shadow-2xl rounded-l-[28px] flex flex-col justify-between p-5 sm:p-6 z-10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] h-full overflow-hidden border-l border-[rgba(7,26,40,0.08)]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[rgba(7,26,40,0.06)]">
          <Link href="/" onClick={onClose} className="flex items-center">
            <Image
              src="/images/brand/ratiwal-logo.svg"
              alt={`${siteConfig.name} Logo`}
              width={160}
              height={100}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[var(--surface)] hover:bg-[var(--mist-blue)] text-[var(--midnight)] flex items-center justify-center transition-colors focus-visible:outline"
            aria-label="Close navigation panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Items List */}
        <nav
          className="flex flex-col gap-1.5 flex-1 overflow-y-auto py-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Mobile Navigation Links"
        >
          {navigationConfig.mainNav.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "text-sm font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-between",
                  isActive
                    ? "text-[var(--ratwal-blue)] bg-[var(--mist-blue)] font-bold shadow-xs"
                    : "text-[var(--midnight)] hover:bg-[var(--surface)] hover:text-[var(--ratwal-blue)]"
                )}
              >
                <span>{link.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--ratwal-blue)]" />}
              </Link>
            );
          })}
        </nav>

        {/* Navigation CTAs & Quick Direct Contact */}
        <div className="pt-4 border-t border-[rgba(7,26,40,0.06)] space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 py-3 px-4 border border-[#25d366] text-[#128c7e] bg-[#25d366]/5 rounded-full font-bold hover:bg-[#25d366]/10 transition-colors text-xs sm:text-sm"
            aria-label="Enquire via WhatsApp"
          >
            <MessageSquare className="h-4 w-4 text-[#25d366]" />
            <span>WhatsApp Us</span>
          </a>

          <Link
            href="/contact"
            onClick={onClose}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-[var(--ratwal-blue)] text-white rounded-full font-bold hover:bg-[var(--ratwal-blue-deep)] transition-colors text-xs sm:text-sm shadow-md shadow-[rgba(8,127,195,0.25)]"
          >
            <span>Talk to an Expert</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-[var(--text-secondary)] font-medium">
            <ShieldCheck size={13} className="text-[var(--ratwal-blue)]" />
            <span>100% Verified Land Advisory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
