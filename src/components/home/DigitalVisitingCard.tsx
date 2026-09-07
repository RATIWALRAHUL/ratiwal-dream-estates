"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  CSSProperties,
} from "react";
import Image from "next/image";
import {
  RotateCcw,
  Share2,
  Phone,
  Mail,
  ShieldCheck,
  X,
  Copy,
  Check,
  MessageCircle,
  Contact,
} from "lucide-react";

// ─── Advisor data ──────────────────────────────────────────────────────────────
const AGENT = {
  name: "Suresh Kumawat",
  firstName: "Suresh",
  lastName: "Kumawat",
  company: "Ratiwal Dream Estates",
  designation: "Real Estate Consultant",
  phone: "+91 99295 33436",
  phoneRaw: "919929533436",
  email: "Sureshkumawat6917@gmail.com",
  rera: "RAJ/A/2019/983",
  photo: "/images/brand/suresh-kumawat.jpg",
  logoWhite: "/images/brand/ratiwal-logo-white.svg",
  logo: "/images/brand/ratiwal-logo.svg",
} as const;

// ─── vCard generator ───────────────────────────────────────────────────────────
function generateVCard(): string {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${AGENT.lastName};${AGENT.firstName};;;`,
    `FN:${AGENT.name}`,
    `ORG:${AGENT.company}`,
    `TITLE:${AGENT.designation}`,
    `TEL;TYPE=CELL:+${AGENT.phoneRaw}`,
    `EMAIL;TYPE=INTERNET:${AGENT.email}`,
    `NOTE:RERA No. ${AGENT.rera}`,
    "END:VCARD",
  ].join("\r\n");
}

// ─── Card Front — white contact info face (default visible) ─────────────────
function CardFront() {
  return (
    <div className="w-full h-full bg-white rounded-xl shadow-[0_10px_40px_rgba(6,30,46,0.28)] overflow-hidden flex flex-col justify-between p-3 sm:p-4">
      {/* Logo + company name */}
      <div className="flex items-center gap-2">
        <Image
          src={AGENT.logo}
          alt="Ratiwal Dream Estates"
          width={88}
          height={36}
          className="h-6 sm:h-7 w-auto flex-shrink-0"
          priority
        />
        <div className="leading-none">
          <p className="text-[#061e2e] font-extrabold text-[7px] sm:text-[8px] tracking-[0.1em] uppercase leading-tight">
            RATIWAL DREAM
          </p>
          <p className="text-[#061e2e] font-extrabold text-[7px] sm:text-[8px] tracking-[0.1em] uppercase leading-tight">
            ESTATES
          </p>
        </div>
      </div>

      {/* Separator */}
      <div
        className="w-full h-px"
        style={{ background: "linear-gradient(to right, #D7A63C 0%, rgba(215,166,60,0.3) 70%, transparent 100%)" }}
      />

      {/* Name + designation */}
      <div>
        <h3 className="text-[#061e2e] font-extrabold text-[11px] sm:text-[13px] leading-tight tracking-[0.07em] uppercase">
          SURESH KUMAWAT
        </h3>
        <p className="text-[#D7A63C] text-[8px] sm:text-[9.5px] font-bold mt-0.5">
          Real Estate Consultant
        </p>
        <div className="w-9 h-[2px] bg-[#D7A63C] mt-1 rounded-full" />
      </div>

      {/* Contact details */}
      <div className="space-y-1.5">
        <a
          href={`tel:+${AGENT.phoneRaw}`}
          className="flex items-center gap-2 no-underline group"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
        >
          <span className="w-4 h-4 rounded-full bg-[#087FC3] flex items-center justify-center flex-shrink-0">
            <Phone size={8} className="text-white" />
          </span>
          <span className="text-[#2c3e50] text-[8px] sm:text-[9.5px] font-medium group-hover:text-[#087FC3] transition-colors">
            +91 99295 33436
          </span>
        </a>
        <a
          href={`mailto:${AGENT.email}`}
          className="flex items-center gap-2 no-underline group"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
        >
          <span className="w-4 h-4 rounded-full bg-[#087FC3] flex items-center justify-center flex-shrink-0">
            <Mail size={8} className="text-white" />
          </span>
          <span className="text-[#2c3e50] text-[8px] sm:text-[9.5px] font-medium truncate group-hover:text-[#087FC3] transition-colors">
            sureshkumawat6917@gmail.com
          </span>
        </a>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-[#087FC3] flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={8} className="text-white" />
          </span>
          <span className="text-[#2c3e50] text-[8px] sm:text-[9.5px] font-medium">
            RERA No. RAJ/A/2019/983
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Card Back — architectural branding face (shown after flip) ──────────────
function CardBack() {
  return (
    <div className="w-full h-full relative bg-white rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(6,30,46,0.28)] flex">
      {/* Left: white branding panel */}
      <div className="flex-[1.5] p-3 sm:p-4 flex flex-col justify-between bg-white relative z-10">
        <div>
          <Image
            src={AGENT.logo}
            alt="Ratiwal Dream Estates"
            width={88}
            height={36}
            className="h-6 w-auto"
          />
        </div>
        <div className="space-y-0.5">
          <p className="text-[#061e2e] font-extrabold text-[7px] sm:text-[8px] tracking-[0.12em] uppercase leading-tight">
            RATIWAL DREAM
          </p>
          <p className="text-[#061e2e] font-extrabold text-[7px] sm:text-[8px] tracking-[0.12em] uppercase leading-tight">
            ESTATES
          </p>
        </div>
        <div>
          <div className="w-5 h-[1.5px] bg-[#D7A63C] mb-1.5" />
          <span className="text-[#087FC3] text-[8px] sm:text-[10px] font-semibold italic">
            Property Consultant
          </span>
        </div>
      </div>

      {/* Diagonal separator */}
      <div
        className="absolute top-0 bottom-0 z-20 pointer-events-none"
        style={{ right: "38%", width: "28px" }}
        aria-hidden="true"
      >
        <div
          className="w-full h-full bg-white"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        />
      </div>
      <div
        className="absolute top-0 bottom-0 z-20 w-[2px] pointer-events-none"
        style={{
          right: "38%",
          background: "linear-gradient(to bottom, #D7A63C 0%, #B8860B 100%)",
        }}
        aria-hidden="true"
      />

      {/* Right: navy architectural panel */}
      <div className="w-[39%] bg-[#0B2239] relative overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 80 100"
          className="absolute inset-0 w-full h-full opacity-[0.07]"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          <line x1="0" y1="25" x2="80" y2="25" stroke="#52BDE9" strokeWidth="0.8" />
          <line x1="0" y1="55" x2="80" y2="55" stroke="#52BDE9" strokeWidth="0.8" />
          <line x1="20" y1="0" x2="20" y2="100" stroke="#52BDE9" strokeWidth="0.8" />
          <line x1="55" y1="0" x2="55" y2="100" stroke="#52BDE9" strokeWidth="0.8" />
        </svg>
        <svg
          viewBox="0 0 52 52"
          className="w-9 h-9 sm:w-11 sm:h-11 relative z-10"
          aria-hidden="true"
        >
          <path d="M26 4 L48 24 L48 48 L4 48 L4 24 Z" fill="#112d44" stroke="#52BDE9" strokeWidth="1.4" strokeLinejoin="round" />
          <rect x="14" y="30" width="8" height="8" rx="0.5" fill="#D7A63C" opacity="0.9" />
          <rect x="30" y="30" width="8" height="8" rx="0.5" fill="#D7A63C" opacity="0.7" />
          <rect x="22" y="38" width="8" height="10" rx="0.5" fill="#0B2239" />
        </svg>
      </div>
    </div>
  );
}

// ─── Share Modal ───────────────────────────────────────────────────────────────
function ShareModal({ onClose, pageUrl }: { onClose: () => void; pageUrl: string }) {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = pageUrl;
      Object.assign(el.style, { position: "fixed", opacity: "0" });
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [pageUrl]);

  const waMsg = encodeURIComponent(
    `Hi Suresh, I found your Ratiwal Dream Estates profile and I'd like to discuss a property enquiry.\n\nProfile: ${pageUrl}`
  );
  const waUrl = `https://wa.me/${AGENT.phoneRaw}?text=${waMsg}`;

  const mailBody = encodeURIComponent(
    `Hello Suresh,\n\nI found your profile on Ratiwal Dream Estates and would like to discuss a property advisory.\n\nProfile: ${pageUrl}\n\nPlease connect at your earliest convenience.`
  );
  const mailUrl = `mailto:${AGENT.email}?subject=${encodeURIComponent(
    "Property Advisory Inquiry — Ratiwal Dream Estates"
  )}&body=${mailBody}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share contact"
    >
      <style>{`
        @keyframes rdCardModalIn {
          from { opacity:0; transform:translateY(20px) scale(0.96); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
      `}</style>
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-[360px] shadow-[0_24px_56px_rgba(6,30,46,0.22)] outline-none"
        style={{ animation: "rdCardModalIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[#061e2e] text-base sm:text-lg leading-tight">
              Share Contact
            </h3>
            <p className="text-[#50616d] text-xs mt-0.5">
              Suresh Kumawat — Real Estate Consultant
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-[#50616d] hover:text-[#061e2e]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Copy link */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[rgba(6,30,46,0.1)] hover:border-[#087FC3] hover:bg-[#f0f7ff] transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-[#f0f7ff] group-hover:bg-[#087FC3]/10 flex items-center justify-center flex-shrink-0 transition-colors">
              {copied ? (
                <Check size={18} className="text-emerald-600" />
              ) : (
                <Copy size={18} className="text-[#087FC3]" />
              )}
            </div>
            <div>
              <p className="font-semibold text-[#061e2e] text-sm">
                {copied ? "Copied!" : "Copy Profile Link"}
              </p>
              <p className="text-[#7a8892] text-xs">
                {copied ? "Link is in your clipboard" : "Copy page link to clipboard"}
              </p>
            </div>
          </button>

          {/* WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[rgba(6,30,46,0.1)] hover:border-[#25D366] hover:bg-[#f0fff4] transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#061e2e] text-sm">WhatsApp</p>
              <p className="text-[#7a8892] text-xs">Chat directly on WhatsApp</p>
            </div>
          </a>

          {/* Email */}
          <a
            href={mailUrl}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[rgba(6,30,46,0.1)] hover:border-[#087FC3] hover:bg-[#f0f7ff] transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-[#087FC3] flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#061e2e] text-sm">Send an Email</p>
              <p className="text-[#7a8892] text-xs">Open your email client</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── DigitalVisitingCard — main export ────────────────────────────────────────
export default function DigitalVisitingCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [dlStatus, setDlStatus] = useState<"idle" | "done">("idle");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pageUrl, setPageUrl] = useState("https://ratiwaldreamestates.com");

  useEffect(() => {
    setPageUrl(window.location.origin);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleFlip = useCallback(() => setIsFlipped((p) => !p), []);

  const handleShare = useCallback(async () => {
    const data: ShareData = {
      title: `${AGENT.name} — ${AGENT.designation} | ${AGENT.company}`,
      text: `Connect with ${AGENT.name} for property and land advisory.\n\nPhone: ${AGENT.phone}\nEmail: ${AGENT.email}\nRERA: ${AGENT.rera}`,
      url: pageUrl,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    setShowShare(true);
  }, [pageUrl]);

  const handleDownload = useCallback(() => {
    if (dlStatus !== "idle") return;
    const blob = new Blob([generateVCard()], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "suresh-kumawat-ratiwal-dream-estates.vcf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDlStatus("done");
    setTimeout(() => setDlStatus("idle"), 3000);
  }, [dlStatus]);

  // ── CSS 3-D flip styles ──────────────────────────────────────────────────────
  const perspectiveStyle: CSSProperties = { perspective: "1400px" };

  const innerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    aspectRatio: "3.5 / 2",
    transformStyle: "preserve-3d",
    transition: reducedMotion
      ? "none"
      : "transform 0.72s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
    cursor: "pointer",
  };

  const faceBase: CSSProperties = {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };

  const backFaceStyle: CSSProperties = { ...faceBase, transform: "rotateY(180deg)" };

  return (
    <>
      {/* ── Dark navy stage ─────────────────────────────────────────────────── */}
      <div className="relative bg-[#0B2239] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(6,30,46,0.3)]">

        {/* Blueprint background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.055]" aria-hidden="true">
          <svg className="w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
            <path d="M200 30 L360 120 L360 460 L40 460 L40 120 Z" fill="none" stroke="#52BDE9" strokeWidth="1.2" />
            <line x1="200" y1="30" x2="200" y2="460" stroke="#52BDE9" strokeWidth="0.7" strokeDasharray="4 4" />
            {[160, 230, 300, 370].map((y) => (
              <line key={y} x1="40" y1={y} x2="360" y2={y} stroke="#52BDE9" strokeWidth="0.7" />
            ))}
            {[90, 130, 170, 200, 230, 270, 310].map((x) => (
              <line key={x} x1={x} y1="120" x2={x} y2="460" stroke="#52BDE9" strokeWidth="0.7" />
            ))}
          </svg>
        </div>

        {/* Header: logo + RERA badge */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-5 sm:px-7 sm:pt-6">
          <Image
            src={AGENT.logoWhite}
            alt="Ratiwal Dream Estates"
            width={130}
            height={52}
            className="h-9 sm:h-11 w-auto"
            priority
          />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#D7A63C]/50 bg-[#D7A63C]/10">
            <ShieldCheck size={11} className="text-[#D7A63C]" aria-hidden="true" />
            <span className="text-[#D7A63C] text-[9px] sm:text-[10px] font-bold tracking-[0.18em] uppercase">
              RERA Verified
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10 px-5 sm:px-7 pt-3 pb-2">
          <p className="text-[#D7A63C] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.28em] leading-[2]">
            TRUSTED GUIDANCE<br />FOR A BRIGHTER<br />TOMORROW
          </p>
        </div>

        {/* Portrait + card area */}
        <div className="relative" style={{ minHeight: "clamp(300px, 48vw, 420px)" }}>

          {/* Consultant portrait — right side */}
          <div
            className="absolute right-0 top-0 bottom-0"
            style={{ width: "clamp(52%, 56%, 62%)" }}
            aria-hidden="true"
          >
            <Image
              src={AGENT.photo}
              alt="Suresh Kumawat"
              fill
              className="object-cover object-top"
              sizes="(max-width: 640px) 56vw, 300px"
            />
            {/* Blend gradient */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, #0B2239 0%, rgba(11,34,57,0.15) 40%, transparent 100%)",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(to top, #0B2239 0%, transparent 40%)",
              }}
            />
          </div>

          {/* 3-D visiting card — larger & more prominent */}
          <div
            className="absolute z-20"
            style={{
              left: "clamp(14px, 4vw, 22px)",
              bottom: "clamp(14px, 3.5vw, 24px)",
              width: "min(300px, 58vw)",
              ...perspectiveStyle,
            }}
          >
            <div
              style={innerStyle}
              role="button"
              tabIndex={0}
              aria-label={
                isFlipped
                  ? "Visiting card back — branding. Press Enter to flip to front."
                  : "Visiting card front — contact info. Press Enter to flip to back."
              }
              aria-pressed={isFlipped}
              onClick={handleFlip}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleFlip();
                }
              }}
            >
              {/* Front face */}
              <div style={faceBase}>
                <CardFront />
              </div>
              {/* Back face */}
              <div style={backFaceStyle}>
                <CardBack />
              </div>
            </div>

            {/* Tap hint */}
            {!isFlipped && (
              <p
                className="text-white/35 text-[9px] text-center mt-1.5 tracking-[0.2em] uppercase select-none pointer-events-none"
                aria-hidden="true"
              >
                tap to flip
              </p>
            )}
          </div>

          {/* Height spacer */}
          <div
            className="invisible pointer-events-none"
            style={{ height: "clamp(300px, 48vw, 420px)" }}
            aria-hidden="true"
          />
        </div>
      </div>

      </div>

      {/* ── Action buttons — pill style matching reference ──────────────────────── */}
      <div className="flex items-center gap-2.5 mt-3">
        {/* Flip */}
        <button
          id="flip-card-btn"
          onClick={handleFlip}
          aria-pressed={isFlipped}
          aria-label={isFlipped ? "Flip to front" : "Flip to back"}
          className="flex-1 group inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full border border-[rgba(6,30,46,0.15)] bg-white hover:bg-[#061e2e] hover:text-white hover:border-[#061e2e] text-[#061e2e] text-[11px] sm:text-[12px] font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[#087FC3] select-none shadow-[0_1px_6px_rgba(6,30,46,0.08)]"
        >
          <RotateCcw size={12} className="flex-shrink-0 group-hover:rotate-[-180deg] transition-transform duration-500" aria-hidden="true" />
          <span>Flip Card</span>
        </button>

        {/* Share */}
        <button
          id="share-card-btn"
          onClick={handleShare}
          aria-label="Share contact details"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full border border-[rgba(6,30,46,0.15)] bg-white hover:bg-[#061e2e] hover:text-white hover:border-[#061e2e] text-[#061e2e] text-[11px] sm:text-[12px] font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[#087FC3] select-none shadow-[0_1px_6px_rgba(6,30,46,0.08)]"
        >
          <Share2 size={12} className="flex-shrink-0" aria-hidden="true" />
          <span>Share</span>
        </button>

        {/* Download / Save contact */}
        <button
          id="save-contact-btn"
          onClick={handleDownload}
          aria-label="Download vCard contact file"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full border border-[rgba(6,30,46,0.15)] bg-white hover:bg-[#061e2e] hover:text-white hover:border-[#061e2e] text-[#061e2e] text-[11px] sm:text-[12px] font-semibold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[#087FC3] select-none shadow-[0_1px_6px_rgba(6,30,46,0.08)]"
        >
          {dlStatus === "done" ? (
            <>
              <Check size={12} className="flex-shrink-0 text-emerald-600" aria-hidden="true" />
              <span className="text-emerald-600">Saved!</span>
            </>
          ) : (
            <>
              <Contact size={12} className="flex-shrink-0" aria-hidden="true" />
              <span>Download</span>
            </>
          )}
        </button>
      </div>

      {/* Share modal */}
      {showShare && (
        <ShareModal onClose={() => setShowShare(false)} pageUrl={pageUrl} />
      )}
    </>
  );
}
