import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass, MapPin, Building2, ShieldCheck, MessageCircle } from "lucide-react";
import { Location } from "@/types/location";
import { getLocationSummaryStats } from "@/data/locations";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { generateWhatsAppUrl } from "@/lib/whatsapp";

interface LocationDetailHeroProps {
  location: Location;
}

export function LocationDetailHero({ location }: LocationDetailHeroProps) {
  const stats = getLocationSummaryStats(location);
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Locations", href: "/locations" },
    { label: location.name, href: `/locations/${location.slug}` },
  ];

  const whatsappUrl = generateWhatsAppUrl({
    type: "location",
    locationName: location.name,
  });

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#031C2B] via-[#072435] to-[#082B3B] text-white pt-24 pb-16 md:pt-32 md:pb-20 border-b border-[rgba(255,255,255,0.08)]"
      aria-labelledby="location-detail-hero-heading"
    >
      {/* Background cartographic overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:28px_28px]"
        aria-hidden="true"
      />

      <div className="relative max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Location Info & Meta */}
          <div className="lg:col-span-7">
            {/* Eyebrow & Region Badge */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[rgba(82,189,233,0.12)] border border-[rgba(82,189,233,0.25)] text-[#52BDE9] text-xs font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Market Guide</span>
              </span>
              <span className="text-xs text-[#a0b6c6] font-semibold">
                {location.state} • {location.region}
              </span>
            </div>

            {/* Headline */}
            <h1
              id="location-detail-hero-heading"
              className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-normal leading-[1.1] tracking-tight text-white mb-5"
            >
              Explore property opportunities in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d2ecf8] to-[#52BDE9]">
                {location.name}.
              </span>
            </h1>

            {/* Short Tagline & Editorial Description */}
            <p className="text-base sm:text-lg text-[#c5d8e4] font-normal leading-relaxed max-w-[620px] mb-6">
              {location.shortDescription}
            </p>

            {/* Badges Bar: Available listings & Property categories */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-xs text-white">
                <Building2 className="w-3.5 h-3.5 text-[#52BDE9]" />
                <strong className="font-semibold">{stats.propertyCount} Verified Listings</strong>
              </div>

              {location.propertyTypes.map((type, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-[rgba(7,132,200,0.18)] border border-[rgba(7,132,200,0.3)] text-xs font-medium text-[#d2ecf8]"
                >
                  {type}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#properties"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#0784C8] to-[#129be0] text-white font-medium text-sm shadow-[0_10px_25px_rgba(7,132,200,0.35)] hover:translate-y-[-2px] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <span>View properties in {location.name}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#1fb355] text-[#031C2B] text-sm font-bold shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                aria-label={`Speak with an advisor about ${location.name} on WhatsApp (opens in a new tab)`}
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>Speak with an advisor</span>
              </a>
            </div>

            {/* Verification Timestamp */}
            <p className="text-[11.5px] text-[#7a93a5] mt-6 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#24D17F]" />
              <span>
                Statutory zoning and infrastructure data verified for {location.name}: {location.lastVerifiedAt}
              </span>
            </p>
          </div>

          {/* Right Column: Hero Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.15)] shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <Image
                src={location.heroImage}
                alt={`Planned plotted development in ${location.name}, ${location.state}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-transparent to-transparent opacity-75" />

              {/* Coordinates Pill */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-[rgba(3,28,43,0.9)] backdrop-blur-md border border-[rgba(255,255,255,0.14)] flex items-center justify-between text-xs text-white">
                <span className="flex items-center gap-1.5 text-[#52BDE9]">
                  <MapPin className="w-3.5 h-3.5" />
                  {location.name}, {location.state}
                </span>
                <span className="text-[#a0b6c6] font-mono text-[11px]">
                  {location.coordinates.latitude.toFixed(4)}° N, {location.coordinates.longitude.toFixed(4)}° E
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
