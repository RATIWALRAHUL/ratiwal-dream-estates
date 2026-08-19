import Link from "next/link";
import { ArrowRight, Compass, Home, Building2, MapPin, BookOpen, MessageCircle } from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

export default function RootNotFound() {
  const whatsappUrl = generateWhatsAppUrl({ type: "general" });

  const helpfulLinks = [
    {
      title: "Explore Properties",
      href: "/properties",
      icon: Building2,
      description: "Browse verified residential and commercial plotted developments.",
    },
    {
      title: "Regional Market Guides",
      href: "/locations",
      icon: MapPin,
      description: "Discover growth corridors across Jaipur, Navi Mumbai, and Ajmer.",
    },
    {
      title: "Property Intelligence Journal",
      href: "/insights",
      icon: BookOpen,
      description: "Read authoritative research on Section 90A, RERA, and due diligence.",
    },
  ];

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#FFFDF8] pt-32 pb-20 flex items-center justify-center"
      aria-labelledby="not-found-heading"
    >
      <div className="max-w-[840px] w-[calc(100%-48px)] mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-4">
          <Compass className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Error 404 • Page Not Found</span>
        </div>

        {/* Headline */}
        <h1
          id="not-found-heading"
          className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#031C2B] font-normal leading-tight tracking-tight mb-4"
        >
          We couldn&apos;t find the <br className="hidden sm:block" />
          destination you requested.
        </h1>

        <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed max-w-lg mx-auto mb-10">
          The property listing, corridor report, or page may have been moved, updated, or archived following transaction completion.
        </p>

        {/* Helpful Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-10">
          {helpfulLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="p-5 rounded-2xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.08)] hover:bg-white hover:border-[rgba(7,132,200,0.3)] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-white text-[#0784C8] flex items-center justify-center mb-3 shadow-2xs group-hover:bg-[#0784C8] group-hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="font-heading text-base font-bold text-[#031C2B] mb-1 group-hover:text-[#0784C8] transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-xs text-[#536574] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between text-xs font-bold text-[#0784C8] mt-3">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Primary Return Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#031C2B] hover:bg-[#082B3B] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1fb355] text-[#031C2B] text-xs font-bold shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Ask Advisor on WhatsApp</span>
          </a>
        </div>
      </div>
    </main>
  );
}
