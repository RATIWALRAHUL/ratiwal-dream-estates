"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, MapPin, Menu, MessageCircle, Sparkles, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { navigationConfig } from "@/config/navigation";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { useLocations } from "@/lib/hooks/useLocations";
import MobileNavigation from "./MobileNavigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const locationDropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const { locations: dbLocations } = useLocations();
  const closeMobileNav = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    setIsLocationDropdownOpen(false);
  }, [pathname]);

  const handleLocationMouseEnter = () => {
    if (locationDropdownTimeout.current) {
      clearTimeout(locationDropdownTimeout.current);
    }
    setIsLocationDropdownOpen(true);
  };

  const handleLocationMouseLeave = () => {
    locationDropdownTimeout.current = setTimeout(() => {
      setIsLocationDropdownOpen(false);
    }, 150);
  };

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
          <nav className="hidden xl:flex nav-links my-auto items-center" aria-label="Main Navigation">
            {navigationConfig.mainNav.filter((link) => ["Home", "Properties", "Locations", "Investment", "About Us", "Contact"].includes(link.label)).map((link) => {
              const isLocationsLink = link.label === "Locations";
              const isActive = pathname === link.href || (isLocationsLink && pathname.startsWith("/locations"));

              if (isLocationsLink) {
                return (
                  <div
                    key={link.href}
                    className="relative group my-auto"
                    onMouseEnter={handleLocationMouseEnter}
                    onMouseLeave={handleLocationMouseLeave}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "nav-link inline-flex items-center gap-1 cursor-pointer",
                        isActive && "active"
                      )}
                      aria-expanded={isLocationDropdownOpen}
                      aria-haspopup="true"
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        size={13}
                        className={cn(
                          "transition-transform duration-200 text-current opacity-70",
                          isLocationDropdownOpen && "rotate-180 opacity-100"
                        )}
                      />
                    </Link>

                    {/* Dynamic DB Locations Dropdown Menu */}
                    <div
                      className={cn(
                        "absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[300px] bg-white rounded-2xl border border-[rgba(7,26,40,0.1)] shadow-[0_18px_45px_rgba(7,26,40,0.14)] p-2 transition-all duration-200 z-50",
                        isLocationDropdownOpen
                          ? "opacity-100 visible translate-y-0 pointer-events-auto"
                          : "opacity-0 invisible -translate-y-2 pointer-events-none"
                      )}
                      role="menu"
                    >
                      {/* Dropdown Header */}
                      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Markets & Corridors
                        </span>
                        <Link
                          href="/locations"
                          className="text-[11px] font-bold text-[#087fc3] hover:underline inline-flex items-center gap-0.5"
                          onClick={() => setIsLocationDropdownOpen(false)}
                        >
                          <span>All</span>
                          <ArrowRight size={11} />
                        </Link>
                      </div>

                      {/* DB Locations List */}
                      <div className="py-1 max-h-[300px] overflow-y-auto space-y-0.5">
                        {dbLocations.length > 0 ? (
                          dbLocations.map((loc) => {
                            const isCurrent = pathname === `/locations/${loc.slug}`;
                            return (
                              <Link
                                key={loc.id || loc.slug}
                                href={`/locations/${loc.slug}`}
                                onClick={() => setIsLocationDropdownOpen(false)}
                                className={cn(
                                  "flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition-colors",
                                  isCurrent
                                    ? "bg-sky-50 text-[#087fc3]"
                                    : "hover:bg-slate-50 text-slate-800"
                                )}
                                role="menuitem"
                              >
                                <div className="w-6 h-6 rounded-lg bg-sky-50 text-[#087fc3] flex items-center justify-center shrink-0 mt-0.5">
                                  <MapPin size={13} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-slate-900 truncate">
                                    {loc.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate">
                                    {loc.city ? `${loc.city}, ${loc.state}` : loc.state || "Prime Corridor"}
                                  </div>
                                </div>
                              </Link>
                            );
                          })
                        ) : (
                          <Link
                            href="/locations"
                            onClick={() => setIsLocationDropdownOpen(false)}
                            className="block px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-xl"
                          >
                            Explore Operating Corridors
                          </Link>
                        )}
                      </div>

                      {/* Dropdown Footer CTA */}
                      <div className="pt-1.5 mt-1 border-t border-slate-100">
                        <Link
                          href="/locations"
                          onClick={() => setIsLocationDropdownOpen(false)}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold bg-[#071a28] text-white hover:bg-[#0c2c44] transition-colors"
                        >
                          <MapPin size={12} className="text-[#38bdf8]" />
                          <span>Explore All Verified Markets</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }

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
          <div className="hidden xl:flex nav-ctas my-auto">
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

          {/* Mobile & Tablet Quick Action & Navigation Trigger */}
          <div className="flex xl:hidden items-center gap-2 sm:gap-2.5 my-auto shrink-0">
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
