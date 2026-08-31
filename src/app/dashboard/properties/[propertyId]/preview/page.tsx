import "server-only";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, MapPin, Eye, Building, CheckCircle2, Layers } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/guard";
import { getPropertyForPreview } from "@/lib/services/property-editor.service";
import { formatPaiseToRupeeString } from "@/lib/utils/currency";
import { sqFtToSqYards } from "@/lib/utils/area";

export const dynamic = "force-dynamic";

interface PreviewPropertyPageProps {
  params: Promise<{ propertyId: string }>;
}

export default async function PreviewPropertyPage({ params }: PreviewPropertyPageProps) {
  await requireAdminSession(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
  const { propertyId } = await params;

  const { property, location, plotOptions } = await getPropertyForPreview(propertyId);

  const primaryImage = property.media?.find((m: any) => m.isPrimary) || property.media?.[0];
  const isDraft = property.publicationStatus === "DRAFT";
  const isReview = property.publicationStatus === "REVIEW";

  return (
    <div className="space-y-6 pb-20">
      {/* Protected Preview Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded">
                Protected Preview
              </span>
              <span className="text-xs font-bold font-mono">Status: {property.publicationStatus}</span>
            </div>
            <p className="text-xs text-amber-100 mt-0.5">
              This preview accurately reflects the public property showcase without exposing unreleased draft data to search engines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/properties/${property._id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-[#071a28] text-xs font-bold hover:bg-amber-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Editor</span>
          </Link>
        </div>
      </div>

      {/* Hero Presentation Card */}
      <div className="rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-sm overflow-hidden">
        <div className="relative h-72 sm:h-96 w-full bg-slate-900">
          {primaryImage?.url ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText || property.title}
              className="w-full h-full object-cover opacity-85"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <Building className="w-16 h-16" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#071a28] via-[#071a28]/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-full bg-[#087fc3] text-white font-bold uppercase text-[10px]">
                {property.propertyType.replace("_", " ")}
              </span>
              {location && (
                <span className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3 text-[#42b7e8]" />
                  <span>{location.name} ({location.city}, {location.state})</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif">{property.title}</h1>
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-3xl">
              {property.shortDescription}
            </p>
          </div>
        </div>

        {/* Pricing & Key Metrics Bar */}
        <div className="p-6 bg-[#f7f5ef]/40 border-t border-[rgba(7,26,40,0.06)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-mono text-[#647581] uppercase block">Starting Price</span>
            <span className="text-base font-bold font-serif text-[#071a28]">
              {property.pricing?.startingPricePaise
                ? formatPaiseToRupeeString(property.pricing.startingPricePaise)
                : "Price on Request"}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-[#647581] uppercase block">Plot Size Range</span>
            <span className="text-base font-bold font-serif text-[#071a28]">
              {sqFtToSqYards(property.area?.minimumSqFt || 0)} - {sqFtToSqYards(property.area?.maximumSqFt || 0)} Sq Yds
            </span>
            <span className="text-[10px] font-mono text-[#647581] block">
              ({property.area?.minimumSqFt?.toLocaleString()} - {property.area?.maximumSqFt?.toLocaleString()} sq ft)
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-[#647581] uppercase block">RERA Certification</span>
            <span className="text-xs font-bold font-mono text-[#071a28]">
              {property.rera?.registrationNumber || "Exempted / Applied"}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-[#647581] uppercase block">Title Diligence</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{property.verificationStatus}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Highlights & Amenities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {property.highlights && property.highlights.length > 0 && (
          <div className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#071a28]">Project Highlights</h3>
            <ul className="space-y-2 text-xs">
              {property.highlights.map((h: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-[#071a28]">
                  <CheckCircle2 className="w-4 h-4 text-[#087fc3] shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {property.amenities && property.amenities.length > 0 && (
          <div className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#071a28]">On-Site Amenities</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {property.amenities.map((a: string, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-[#eaf5fa] text-[#071a28] font-medium border border-[#42b7e8]/30">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Discrete Plot Inventory Preview */}
      <div className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#087fc3]" />
            <h3 className="text-sm font-bold text-[#071a28]">Plot Inventory Units ({plotOptions.length})</h3>
          </div>
          <Link
            href={`/dashboard/properties/${property._id}/inventory`}
            className="text-xs font-bold text-[#087fc3] hover:underline"
          >
            Manage Plots Inventory →
          </Link>
        </div>

        {plotOptions.length === 0 ? (
          <p className="text-xs text-[#647581] italic">No discrete plot units attached to this property.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[rgba(7,26,40,0.08)] text-[#647581] font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Plot #</th>
                  <th className="py-2.5 px-3">Area</th>
                  <th className="py-2.5 px-3">Facing</th>
                  <th className="py-2.5 px-3">Corner</th>
                  <th className="py-2.5 px-3">Base Price</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(7,26,40,0.04)] font-medium text-[#071a28]">
                {plotOptions.slice(0, 10).map((plot: any) => (
                  <tr key={plot._id}>
                    <td className="py-2.5 px-3 font-mono font-bold">{plot.plotNumber}</td>
                    <td className="py-2.5 px-3 font-mono">{sqFtToSqYards(plot.areaSqFt)} sq yd ({plot.areaSqFt} sq ft)</td>
                    <td className="py-2.5 px-3">{plot.facing}</td>
                    <td className="py-2.5 px-3">{plot.isCorner ? "Yes (Corner)" : "Standard"}</td>
                    <td className="py-2.5 px-3 font-mono">
                      {plot.basePricePaise ? formatPaiseToRupeeString(plot.basePricePaise) : "On Request"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100">
                        {plot.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
