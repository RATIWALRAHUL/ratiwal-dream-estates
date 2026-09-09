"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Maximize, MessageCircle } from "lucide-react";
import { Property } from "@/types/property";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { displayListOrFallback, displayOrFallback, stripPlaceholder } from "@/lib/propertyFormatters";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setSaved(localStorage.getItem(`saved-property:${property.id}`) === "true")
    );
    return () => cancelAnimationFrame(frame);
  }, [property.id]);

  function toggleSaved() {
    setSaved((value) => {
      const next = !value;
      localStorage.setItem(`saved-property:${property.id}`, String(next));
      return next;
    });
  }

  const displayName = displayOrFallback(property.name, "Property details on request");
  const displayLocation =
    [stripPlaceholder(property.location), property.city].filter(Boolean).join(", ") ||
    "Location available on request";
  const displayPlotSizes = displayListOrFallback(property.plotSizes);
  const displayDescription = displayOrFallback(
    property.shortDescription,
    "Full details available on request from our advisory team."
  );

  const whatsappUrl = generateWhatsAppUrl({
    type: "property",
    propertyName: displayName,
    locationName: displayLocation,
  });

  return (
    <Card className="property-card flex flex-col h-full bg-white border border-[#0B2239]/8 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
      {/* Thumbnail Aspect Container */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
        {property.images[0] ? (
          <Image
            src={property.images[0]}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={80}
            loading="lazy"
            className="property-card-image object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs bg-slate-100">
            Image coming soon
          </div>
        )}

        {/* Floating tags */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
          <Badge variant={property.propertyType === "Commercial Plot" ? "primary" : "secondary"}>
            {property.propertyType}
          </Badge>
          {property.status !== "Available" && (
            <Badge variant={property.status === "Sold Out" ? "error" : "warning"}>
              {property.status}
            </Badge>
          )}
        </div>

        <button
          type="button"
          onClick={toggleSaved}
          className={cn("favorite-button", saved && "is-saved")}
          aria-label={saved ? `Remove ${displayName} from favorites` : `Save ${displayName} to favorites`}
          aria-pressed={saved}
        >
          <Heart size={16} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Title & Metadata Headers */}
      <CardHeader className="p-4 sm:p-5 pb-0 flex-1">
        <h3 className="font-heading text-[16px] sm:text-[18px] text-[#0B2239] font-bold line-clamp-2 leading-snug">
          {displayName}
        </h3>
        <div className="space-y-1 mt-2">
          <p className="text-xs sm:text-sm text-slate-500 flex items-center space-x-1.5">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0798D8] flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="line-clamp-1">{displayLocation}</span>
          </p>
          <p className="text-xs sm:text-sm text-slate-500 flex items-center space-x-1.5">
            <Maximize className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0798D8] flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="line-clamp-1">Plot sizes: {displayPlotSizes}</span>
          </p>
        </div>
      </CardHeader>

      {/* Description Snippet */}
      <CardContent className="p-4 sm:p-5 pt-2.5 sm:pt-3 flex-1 flex flex-col justify-between">
        <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
          {displayDescription}
        </p>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium">Pricing</span>
          <span className="property-price text-xs sm:text-sm">{property.priceLabel}</span>
        </div>
      </CardContent>

      {/* Interactive Actions */}
      <CardFooter className="p-4 sm:p-5 pt-0 grid grid-cols-2 gap-2 sm:gap-3">
        <Link href={`/properties/${property.slug}`} className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full min-h-[42px] sm:min-h-[44px] text-xs sm:text-sm font-semibold border-slate-200 hover:border-[#0798D8] text-[#0B2239] focus-visible:outline"
          >
            View Details
          </Button>
        </Link>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
          aria-label={`Enquire about ${displayName} on WhatsApp`}
        >
          <Button
            variant="primary"
            size="sm"
            className="w-full min-h-[42px] sm:min-h-[44px] bg-[#25D366] hover:bg-[#1fb355] text-white font-bold border-none flex items-center justify-center space-x-1.5 shadow-xs focus-visible:outline"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-xs sm:text-sm">WhatsApp</span>
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
