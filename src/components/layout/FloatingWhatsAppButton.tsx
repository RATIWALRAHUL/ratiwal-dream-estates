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
        "fixed bottom-6 right-6 z-40 flex items-center justify-center h-14 w-14 rounded-full",
        "bg-[#25D366] text-white shadow-lg hover:bg-[#128C7E] hover:scale-110",
        "transition-all duration-300 focus-visible:outline"
      )}
      aria-label="Enquire on WhatsApp (opens in a new tab)"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
