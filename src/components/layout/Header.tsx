"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, MessageCircle, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { navigationConfig } from "@/config/navigation";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import MobileNavigation from "./MobileNavigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const closeMobileNav = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  return (
    <>
      <header className={cn("site-header", isScrolled && "is-scrolled")}>
        <div className="nav-shell">
          {/* Accessibility skip-to-content helper */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          {/* Logo Brand Title */}
          <Link href="/" className="nav-logo" aria-label="Ratiwal Dream Estates home">
            <Image
              src="/images/brand/ratiwal-logo.svg"
              alt={`${siteConfig.name} Logo`}
              width={168}
              height={68}
              className="h-10 lg:h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Link Lists */}
          <nav className="hidden lg:flex nav-links" aria-label="Main Navigation">
            {navigationConfig.mainNav.filter((link) => ["Home","Properties","Investment","About Us","Contact"].includes(link.label)).map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn("nav-link", isActive && "active")}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex nav-ctas">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-cta-ghost"
              aria-label="Contact us on WhatsApp (opens in a new tab)"
            >
              <MessageCircle aria-hidden="true" />
              {siteConfig.ctas.secondary.label}
            </a>
            <Link href={siteConfig.ctas.primary.href} className="nav-cta-primary">
              {siteConfig.ctas.primary.label}
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile Navigation Trigger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden nav-toggle focus-visible:outline"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer panel */}
      <MobileNavigation isOpen={isOpen} onClose={closeMobileNav} />
    </>
  );
}
