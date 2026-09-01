"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export default function FloatingWhatsAppButton() {
  const pathname = usePathname();
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  // Suppress button on contact page to avoid duplicate CTAs
  if (pathname === "/contact" || whatsappUrl === "#") {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center justify-center",
        "h-12 w-12 sm:h-14 sm:w-14 rounded-full",
        "bg-[#25D366] text-white shadow-lg hover:bg-[#128C7E] hover:scale-105 active:scale-95",
        "transition-all duration-300 focus-visible:outline"
      )}
      aria-label="Enquire on WhatsApp (opens in a new tab)"
    >
      <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
    </a>
  );
}
