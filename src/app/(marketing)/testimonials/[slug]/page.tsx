import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getMetadata } from "@/lib/seo";
import { getAllPublishedCaseStudies, getCaseStudyBySlug } from "@/data/testimonials";
import { getPropertyBySlug } from "@/data/properties";
import { getLocationBySlug } from "@/data/locations";
import { PropertyCard } from "@/components/property/PropertyCard";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  FileCheck,
  FileSearch,
  Scale,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);

  if (!caseStudy) {
    return getMetadata({
      title: "Case Study Not Found",
      noIndex: true,
    });
  }

  return getMetadata({
    title: `${caseStudy.title} | Client Story`,
    description: caseStudy.summary,
    slug: `/testimonials/${caseStudy.slug}`,
    image: `${siteConfig.url}${caseStudy.heroImage}`,
  });
}

export async function generateStaticParams() {
  const caseStudies = getAllPublishedCaseStudies();
  return caseStudies.map((cs) => ({
    slug: cs.slug,
  }));
}

export default async function CaseStudyDetailPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudyBySlug(slug);

  if (!caseStudy) {
    notFound();
  }

  const relatedProperty = caseStudy.relatedPropertySlug
    ? getPropertyBySlug(caseStudy.relatedPropertySlug)
    : undefined;

  const relatedLocation = caseStudy.relatedLocationSlug
    ? getLocationBySlug(caseStudy.relatedLocationSlug)
    : undefined;

  const whatsappUrl = generateWhatsAppUrl({
    type: "general",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${siteConfig.url}/testimonials/${caseStudy.slug}#article`,
        headline: caseStudy.title,
        description: caseStudy.summary,
        image: `${siteConfig.url}${caseStudy.heroImage}`,
        author: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
          logo: {
            "@type": "ImageObject",
            url: `${siteConfig.url}/images/brand/logo.jpg`,
          },
        },
        datePublished: "2026-08-01",
        dateModified: "2026-08-19",
        mainEntityOfPage: `${siteConfig.url}/testimonials/${caseStudy.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteConfig.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Client Stories",
            item: `${siteConfig.url}/testimonials`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: caseStudy.title,
            item: `${siteConfig.url}/testimonials/${caseStudy.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#031C2B] via-[#072435] to-[#082B3B] text-white pt-28 pb-16 md:pt-36 md:pb-20 border-b border-[rgba(255,255,255,0.08)]">
        <div className="max-w-[1100px] w-[calc(100%-48px)] mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-[#a0b6c6] mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/testimonials" className="hover:text-white transition-colors">Client Stories</Link>
            <span>/</span>
            <span className="text-[#52BDE9] truncate max-w-[240px] sm:max-w-none">{caseStudy.title}</span>
          </nav>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-[rgba(82,189,233,0.14)] border border-[rgba(82,189,233,0.3)] text-[#52BDE9] text-xs font-bold uppercase tracking-wider">
              {caseStudy.propertyType}
            </span>
            <span className="px-3 py-1 rounded-full bg-[rgba(36,209,127,0.14)] border border-[rgba(36,209,127,0.3)] text-[#24D17F] text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Advisory Case Study
            </span>
          </div>

          {/* Title */}
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-[3rem] text-white font-normal leading-[1.12] tracking-tight mb-4">
            {caseStudy.title}
          </h1>

          <p className="text-base sm:text-lg text-[#d2ecf8] leading-relaxed max-w-[820px] mb-8 font-light">
            {caseStudy.tagline}
          </p>

          {/* Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-xs">
            <div>
              <span className="text-[#7a93a5] block mb-1">Client Profile</span>
              <strong className="text-white block font-medium">{caseStudy.clientDisplayName}</strong>
              <span className="text-[11px] text-[#a0b6c6]">{caseStudy.clientProfile}</span>
            </div>
            <div>
              <span className="text-[#7a93a5] block mb-1">Location</span>
              <strong className="text-white block font-medium">{caseStudy.location}</strong>
            </div>
            <div>
              <span className="text-[#7a93a5] block mb-1">Advisory Timeline</span>
              <strong className="text-white block font-medium">{caseStudy.timeframe}</strong>
            </div>
            <div>
              <span className="text-[#7a93a5] block mb-1">Verification Status</span>
              <strong className="text-[#24D17F] block font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Fully Verified
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <section className="py-16 md:py-24 bg-[#FFFDF8]">
        <div className="max-w-[1100px] w-[calc(100%-48px)] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Column */}
            <div className="lg:col-span-8 space-y-12">
              {/* Executive Summary */}
              <div>
                <h2 className="font-heading text-2xl text-[#031C2B] font-normal mb-3">
                  Engagement Overview
                </h2>
                <p className="text-base text-[#4a6171] leading-relaxed">
                  {caseStudy.summary}
                </p>
              </div>

              {/* Starting Objective & Main Challenge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.08)]">
                  <span className="text-xs font-bold text-[#0784C8] uppercase tracking-wider block mb-2">
                    Primary Objective
                  </span>
                  <p className="text-sm text-[#2c3e50] leading-relaxed">
                    {caseStudy.objective}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.08)]">
                  <span className="text-xs font-bold text-[#b85e13] uppercase tracking-wider block mb-2">
                    Key Challenge
                  </span>
                  <p className="text-sm text-[#2c3e50] leading-relaxed">
                    {caseStudy.challenge}
                  </p>
                </div>
              </div>

              {/* Advisory Approach */}
              <div>
                <h2 className="font-heading text-2xl text-[#031C2B] font-normal mb-4">
                  Ratwal Advisory Approach
                </h2>
                <div className="space-y-3">
                  {caseStudy.advisoryApproach.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] flex items-start gap-3 shadow-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#edf5f9] text-[#0784C8] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-[#2c3e50] leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Information & Verification Steps */}
              <div>
                <h2 className="font-heading text-2xl text-[#031C2B] font-normal mb-4">
                  Statutory Records &amp; Verification Conducted
                </h2>
                <div className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.1)] shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {caseStudy.verificationSteps.map((vStep, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#2c3e50]">
                        <CheckCircle2 className="w-4 h-4 text-[#24D17F] flex-shrink-0 mt-0.5" />
                        <span>{vStep}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Final Outcome */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#031C2B] to-[#072435] text-white">
                <span className="text-xs font-bold text-[#52BDE9] uppercase tracking-wider block mb-2">
                  Client-Approved Outcome
                </span>
                <h3 className="font-heading text-xl text-white font-normal mb-3">
                  {caseStudy.outcome}
                </h3>
                {caseStudy.clientQuote && (
                  <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.12)]">
                    <p className="text-sm text-[#d2ecf8] italic leading-relaxed mb-2">
                      “{caseStudy.clientQuote}”
                    </p>
                    <span className="text-xs text-[#a0b6c6]">
                      — {caseStudy.clientDisplayName}
                    </span>
                  </div>
                )}
              </div>

              {/* Legal Disclaimer */}
              <div className="p-4 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.08)] flex items-start gap-3">
                <Scale className="w-4 h-4 text-[#0784C8] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#667d8f] leading-relaxed">
                  <strong>Advisory Disclaimer:</strong> This case study summarizes an authentic consulting engagement. Past client outcomes do not guarantee identical timelines or future financial appreciation. Final legal title and purchase decisions remain strictly with the buyer and their independent legal counsel.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Image Card */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[rgba(7,26,40,0.12)] shadow-sm">
                <Image
                  src={caseStudy.heroImage}
                  alt={caseStudy.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover"
                />
              </div>

              {/* Location Card Link */}
              {relatedLocation && (
                <div className="p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.1)] shadow-xs">
                  <span className="text-[11px] font-bold text-[#667d8f] uppercase tracking-wider block mb-2">
                    Explore Operating Market
                  </span>
                  <h3 className="font-heading text-lg text-[#031C2B] font-bold mb-1">
                    {relatedLocation.name} Market Guide
                  </h3>
                  <p className="text-xs text-[#536574] leading-relaxed mb-3">
                    {relatedLocation.shortDescription}
                  </p>
                  <Link
                    href={`/locations/${relatedLocation.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0784C8] hover:underline"
                  >
                    <span>View {relatedLocation.name} Market Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Consultation Box */}
              <div className="p-6 rounded-2xl bg-[#031C2B] text-white">
                <h3 className="font-heading text-lg text-white font-normal mb-2">
                  Have a similar requirement?
                </h3>
                <p className="text-xs text-[#c5d8e4] leading-relaxed mb-4">
                  Speak with our senior advisors for masterplan verification, plot shortlisting, and pricing clarity in {caseStudy.location}.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#25D366] hover:bg-[#1fb355] text-[#031C2B] font-bold text-xs shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Start Private Conversation</span>
                </a>
              </div>
            </div>
          </div>

          {/* Related Property Section (if available) */}
          {relatedProperty && (
            <div className="mt-16 pt-12 border-t border-[rgba(7,26,40,0.1)]">
              <span className="text-xs font-bold text-[#0784C8] uppercase tracking-wider block mb-2">
                Featured Opportunity
              </span>
              <h2 className="font-heading text-2xl text-[#031C2B] font-normal mb-6">
                Active opportunity in this corridor
              </h2>
              <div className="max-w-[420px]">
                <PropertyCard property={relatedProperty} />
              </div>
            </div>
          )}

          {/* Back to all testimonials link */}
          <div className="mt-12">
            <Link
              href="/testimonials"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0784C8] hover:text-[#031C2B] uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all client stories</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
