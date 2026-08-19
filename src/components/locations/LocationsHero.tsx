import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass, ShieldCheck, MapPin, Building2 } from "lucide-react";
import { Location } from "@/types/location";
import { properties } from "@/data/properties";

interface LocationsHeroProps {
  locations: Location[];
}

export function LocationsHero({ locations }: LocationsHeroProps) {
  const totalVerifiedMarkets = locations.length;
  const totalActiveProperties = properties.length;
  const totalStates = Array.from(new Set(locations.map((l) => l.state.split("/")[0].trim()))).length;

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#031C2B] via-[#072435] to-[#082B3B] text-white pt-28 pb-16 md:pt-36 md:pb-24 border-b border-[rgba(255,255,255,0.08)]"
      aria-labelledby="locations-hero-heading"
    >
      {/* Subtle cartographic contour / grid background decoration */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:28px_28px]"
        aria-hidden="true"
      />
      <div
        className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(7,132,200,0.18)_0%,transparent_70%)] pointer-events-none blur-2xl"
        aria-hidden="true"
      />

      <div className="relative max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Copy */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(82,189,233,0.12)] border border-[rgba(82,189,233,0.25)] text-[#52BDE9] text-xs font-semibold uppercase tracking-wider mb-6">
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Markets We Understand</span>
            </div>

            {/* Main Headline */}
            <h1
              id="locations-hero-heading"
              className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-normal leading-[1.08] tracking-tight text-white mb-6"
            >
              Property opportunities <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#d2ecf8] to-[#52BDE9]">
                shaped by location.
              </span>
            </h1>

            {/* Supporting Editorial Paragraph */}
            <p className="text-base md:text-lg text-[#c5d8e4] font-normal leading-relaxed max-w-[620px] mb-8">
              Explore the growth corridors and micro-markets where statutory masterplans, multi-modal connectivity,
              clean revenue documentation, and long-term economic infrastructure matter.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
              <a
                href="#location-directory"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#0784C8] to-[#129be0] text-white font-medium text-sm shadow-[0_12px_28px_rgba(7,132,200,0.35)] hover:shadow-[0_16px_36px_rgba(7,132,200,0.45)] hover:translate-y-[-2px] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <span>Explore locations</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <Link
                href="/properties"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.14)] text-white text-sm font-medium border border-[rgba(255,255,255,0.15)] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <span>View all properties</span>
              </Link>
            </div>

            {/* Market Index Metrics Bar */}
            <div className="w-full pt-6 border-t border-[rgba(255,255,255,0.12)] grid grid-cols-3 gap-4 sm:gap-6">
              <div>
                <div className="flex items-center gap-1.5 text-[#52BDE9] mb-1">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  <span className="text-xl sm:text-2xl font-bold text-white font-heading">{totalVerifiedMarkets}</span>
                </div>
                <p className="text-xs text-[#a0b6c6]">Operating Markets</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[#52BDE9] mb-1">
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                  <span className="text-xl sm:text-2xl font-bold text-white font-heading">{totalActiveProperties}</span>
                </div>
                <p className="text-xs text-[#a0b6c6]">Active Verified Parcels</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[#52BDE9] mb-1">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span className="text-xl sm:text-2xl font-bold text-white font-heading">{totalStates}</span>
                </div>
                <p className="text-xs text-[#a0b6c6]">States Covered</p>
              </div>
            </div>

            {/* Microcopy disclaimer */}
            <p className="text-[11.5px] text-[#7a93a5] mt-4 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#24D17F]" aria-hidden="true" />
              Market information based on currently available and verified statutory data.
            </p>
          </div>

          {/* Right Column: Controlled Editorial Visual Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.16)] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              <Image
                src={locations[0]?.heroImage || "/images/locations/jaipur.jpg"}
                alt="Aerial view of master-planned plotted land corridor in Jaipur"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-transparent to-transparent opacity-80" />

              {/* Floating Verified Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[rgba(3,28,43,0.88)] backdrop-blur-md border border-[rgba(255,255,255,0.14)] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#52BDE9] uppercase tracking-wider block">
                    Featured Core Corridor
                  </span>
                  <span className="text-sm font-semibold text-white font-heading">
                    {locations[0]?.name} — {locations[0]?.state}
                  </span>
                </div>
                <Link
                  href={`/locations/${locations[0]?.slug}`}
                  className="px-3 py-1.5 rounded-full bg-[rgba(82,189,233,0.15)] hover:bg-[#0784C8] text-white text-xs font-semibold transition-colors duration-200"
                >
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
