"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, MessageSquare } from "lucide-react";
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

  // Auto-close on pathname transition
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
        "fixed inset-0 z-40 transition-transform duration-300 lg:hidden",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
      aria-hidden={!isOpen}
    >
      {/* Backdrop overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-[#071a28]/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer content panel */}
      <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl shadow-2xl rounded-l-3xl flex flex-col p-6 z-10">
        <div className="flex items-center justify-between mb-8">
          <span className="font-heading text-lg text-primary-dark">
            Navigation
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-primary-light transition-colors focus-visible:outline"
            aria-label="Close navigation panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {navigationConfig.mainNav.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-base font-medium py-3 px-4 rounded-2xl transition-colors",
                  isActive ? "text-primary-blue bg-primary-light" : "text-text-main hover:bg-primary-light hover:text-primary-blue"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Navigation CTAs */}
        <div className="flex flex-col space-y-3 mt-auto pt-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 py-3.5 border border-primary-blue text-primary-blue rounded-full font-semibold hover:bg-primary-light transition-colors text-sm"
            aria-label="Enquire via WhatsApp (opens in a new tab)"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{siteConfig.ctas.secondary.label}</span>
          </a>
          <Link
            href={siteConfig.ctas.primary.href}
            onClick={onClose}
            className="flex items-center justify-center py-3.5 bg-primary-blue text-white rounded-full font-semibold hover:bg-primary-dark transition-colors text-sm shadow-lg shadow-primary-blue/30"
          >
            {siteConfig.ctas.primary.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
