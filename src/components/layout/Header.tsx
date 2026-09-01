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
      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const whatsappUrl = generateWhatsAppUrl({ type: "general" });
  const isHomePage = pathname === "/";
  // On inner pages at all times, OR on homepage when scrolled, show dark logo and dark header theme
  const showDarkTheme = isScrolled || !isHomePage;

  return (
    <>
      <header className={cn("site-header", isScrolled && "is-scrolled", !isHomePage && "is-inner-page")}>
        <div className="nav-shell">
          {/* Accessibility skip-to-content helper */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          {/* Logo Brand Title */}
          <Link href="/" className="nav-logo flex items-center justify-center my-auto shrink-0 relative" aria-label="Ratiwal Dream Estates home">
            {/* White logo for transparent navbar state on homepage hero */}
            <Image
              src="/images/brand/ratiwal-logo-white.svg"
              alt={`${siteConfig.name} Logo`}
              width={180}
              height={120}
              priority
              className={cn(
                "h-10 sm:h-11 lg:h-12 w-auto object-contain transition-opacity duration-300",
                showDarkTheme ? "opacity-0 absolute pointer-events-none" : "opacity-100 relative"
              )}
            />
            {/* Dark logo for inner pages and scrolled states */}
            <Image
              src="/images/brand/ratiwal-logo.svg"
              alt={`${siteConfig.name} Logo`}
              width={180}
              height={120}
              priority
              className={cn(
                "h-10 sm:h-11 lg:h-12 w-auto object-contain transition-opacity duration-300",
                showDarkTheme ? "opacity-100 relative" : "opacity-0 absolute pointer-events-none"
              )}
            />
          </Link>

          {/* Desktop Navigation Link Lists */}
          <nav className="hidden lg:flex nav-links my-auto" aria-label="Main Navigation">
            {navigationConfig.mainNav.filter((link) => ["Home", "Properties", "Locations", "Investment", "Insights", "About Us", "Contact"].includes(link.label)).map((link) => {
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
          <div className="hidden lg:flex nav-ctas my-auto">
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

          {/* Mobile Quick Action & Navigation Trigger */}
          <div className="flex lg:hidden items-center gap-2 sm:gap-2.5 my-auto shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold tracking-tight transition-all duration-300 active:scale-95",
                showDarkTheme
                  ? "bg-gradient-to-r from-[#0784C8] to-[#0284c7] text-white shadow-[0_2px_10px_rgba(7,132,200,0.3)] hover:brightness-105"
                  : "bg-white/95 hover:bg-white text-[#071a28] shadow-[0_2px_10px_rgba(0,0,0,0.18)]"
              )}
              aria-label="Enquire on WhatsApp (opens in a new tab)"
            >
              <MessageCircle className="h-3.5 w-3.5 text-[#25D366] fill-[#25D366]/20" />
              <span>Enquire</span>
            </a>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="nav-toggle flex items-center justify-center shrink-0 focus-visible:outline"
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer panel */}
      <MobileNavigation isOpen={isOpen} onClose={closeMobileNav} />
    </>
  );
}
