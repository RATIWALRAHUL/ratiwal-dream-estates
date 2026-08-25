import type { ILocation } from "@/types/database";

export interface LocationChecklistItem {
  id: string;
  title: string;
  category: "IDENTITY" | "CONTENT" | "MEDIA" | "COMPLIANCE" | "SEO" | "INTELLIGENCE";
  status: "READY" | "WARNING" | "BLOCKING";
  message: string;
}

export interface LocationPublishingChecklistResult {
  canPublish: boolean;
  totalChecks: number;
  readyCount: number;
  warningCount: number;
  blockingCount: number;
  items: LocationChecklistItem[];
}

/**
 * 16-Point Pre-Flight Publishing Compliance Checklist for Locations
 */
export function validateLocationPublishingChecklist(
  location: ILocation
): LocationPublishingChecklistResult {
  const items: LocationChecklistItem[] = [];

  // 1. Name
  if (location.name && location.name.trim().length >= 2) {
    items.push({
      id: "name",
      title: "Location Title",
      category: "IDENTITY",
      status: "READY",
      message: `Location name "${location.name}" is valid.`,
    });
  } else {
    items.push({
      id: "name",
      title: "Location Title",
      category: "IDENTITY",
      status: "BLOCKING",
      message: "Location title is required and must be at least 2 characters.",
    });
  }

  // 2. Slug
  if (location.slug && location.slug.trim().length >= 2) {
    items.push({
      id: "slug",
      title: "URL Slug",
      category: "IDENTITY",
      status: "READY",
      message: `URL Slug "/locations/${location.slug}" is active.`,
    });
  } else {
    items.push({
      id: "slug",
      title: "URL Slug",
      category: "IDENTITY",
      status: "BLOCKING",
      message: "URL slug is missing or malformed.",
    });
  }

  // 3. City & State Jurisdiction
  if (location.city?.trim() && location.state?.trim()) {
    items.push({
      id: "jurisdiction",
      title: "Jurisdiction & Territory",
      category: "IDENTITY",
      status: "READY",
      message: `Jurisdiction: ${location.city}, ${location.state}.`,
    });
  } else {
    items.push({
      id: "jurisdiction",
      title: "Jurisdiction & Territory",
      category: "IDENTITY",
      status: "BLOCKING",
      message: "City and state territorial designations are required.",
    });
  }

  // 4. Short Description
  if (location.shortDescription && location.shortDescription.trim().length >= 20) {
    items.push({
      id: "shortDescription",
      title: "Corridor Summary",
      category: "CONTENT",
      status: "READY",
      message: `Corridor summary configured (${location.shortDescription.length} chars).`,
    });
  } else {
    items.push({
      id: "shortDescription",
      title: "Corridor Summary",
      category: "CONTENT",
      status: "BLOCKING",
      message: "Short description summary is required (at least 20 characters).",
    });
  }

  // 5. Long Editorial Description
  if (location.longDescription && location.longDescription.trim().length >= 100) {
    items.push({
      id: "longDescription",
      title: "Editorial Investment Thesis",
      category: "CONTENT",
      status: "READY",
      message: "Editorial description is detailed and comprehensive.",
    });
  } else {
    items.push({
      id: "longDescription",
      title: "Editorial Investment Thesis",
      category: "CONTENT",
      status: "WARNING",
      message: "Long editorial description is short or missing. Recommend at least 100 characters.",
    });
  }

  // 6. Hero Image
  if (location.heroImage?.url && location.heroImage.url.trim().length > 0) {
    items.push({
      id: "heroImage",
      title: "Hero Media / Aerial Photography",
      category: "MEDIA",
      status: "READY",
      message: "Hero cover image is configured.",
    });
  } else {
    items.push({
      id: "heroImage",
      title: "Hero Media / Aerial Photography",
      category: "MEDIA",
      status: "BLOCKING",
      message: "Hero cover image is required for public market corridor pages.",
    });
  }

  // 7. Hero Alt Text (Accessibility & SEO)
  if (location.heroImage?.altText && location.heroImage.altText.trim().length >= 5) {
    items.push({
      id: "heroAltText",
      title: "Hero Image Alt Text",
      category: "MEDIA",
      status: "READY",
      message: "Descriptive alt text configured for hero image.",
    });
  } else {
    items.push({
      id: "heroAltText",
      title: "Hero Image Alt Text",
      category: "MEDIA",
      status: "BLOCKING",
      message: "Hero image alt text is required for accessibility and SEO.",
    });
  }

  // 8. Supported Property Types
  if (location.supportedPropertyTypes && location.supportedPropertyTypes.length > 0) {
    items.push({
      id: "supportedTypes",
      title: "Supported Property Types",
      category: "CONTENT",
      status: "READY",
      message: `${location.supportedPropertyTypes.length} property type(s) enabled.`,
    });
  } else {
    items.push({
      id: "supportedTypes",
      title: "Supported Property Types",
      category: "CONTENT",
      status: "BLOCKING",
      message: "At least one supported property type must be enabled.",
    });
  }

  // 9. Statutory Verification Status
  if (location.verificationStatus === "REJECTED") {
    items.push({
      id: "verificationStatus",
      title: "Statutory Verification",
      category: "COMPLIANCE",
      status: "BLOCKING",
      message: "Location is flagged as REJECTED and cannot be published without review.",
    });
  } else if (location.verificationStatus === "VERIFIED") {
    items.push({
      id: "verificationStatus",
      title: "Statutory Verification",
      category: "COMPLIANCE",
      status: "READY",
      message: "Location has been verified by the diligence audit team.",
    });
  } else {
    items.push({
      id: "verificationStatus",
      title: "Statutory Verification",
      category: "COMPLIANCE",
      status: "WARNING",
      message: "Location is currently UNVERIFIED or UNDER_REVIEW.",
    });
  }

  // 10. Last Verified Date
  if (location.lastVerifiedAt) {
    items.push({
      id: "lastVerifiedAt",
      title: "Verification Audit Date",
      category: "COMPLIANCE",
      status: "READY",
      message: `Audit recorded on ${new Date(location.lastVerifiedAt).toLocaleDateString()}.`,
    });
  } else {
    items.push({
      id: "lastVerifiedAt",
      title: "Verification Audit Date",
      category: "COMPLIANCE",
      status: "WARNING",
      message: "No verification audit timestamp recorded.",
    });
  }

  // 11. SEO Title
  if (location.seo?.metaTitle && location.seo.metaTitle.trim().length >= 5) {
    items.push({
      id: "seoTitle",
      title: "SEO Meta Title",
      category: "SEO",
      status: "READY",
      message: "SEO title is configured.",
    });
  } else {
    items.push({
      id: "seoTitle",
      title: "SEO Meta Title",
      category: "SEO",
      status: "BLOCKING",
      message: "SEO meta title is required (at least 5 characters).",
    });
  }

  // 12. SEO Description
  if (location.seo?.metaDescription && location.seo.metaDescription.trim().length >= 15) {
    items.push({
      id: "seoDescription",
      title: "SEO Meta Description",
      category: "SEO",
      status: "READY",
      message: "SEO description is configured.",
    });
  } else {
    items.push({
      id: "seoDescription",
      title: "SEO Meta Description",
      category: "SEO",
      status: "BLOCKING",
      message: "SEO meta description is required (at least 15 characters).",
    });
  }

  // 13. Micro-Markets Structure
  if (location.microMarkets && location.microMarkets.length > 0) {
    items.push({
      id: "microMarkets",
      title: "Micro-Market Nodes",
      category: "CONTENT",
      status: "READY",
      message: `${location.microMarkets.length} micro-market sub-node(s) configured.`,
    });
  } else {
    items.push({
      id: "microMarkets",
      title: "Micro-Market Nodes",
      category: "CONTENT",
      status: "WARNING",
      message: "No micro-markets configured. Recommend adding key nodes/clusters.",
    });
  }

  // 14. Infrastructure Milestones Source Verification
  const invalidInfra = location.infrastructureHighlights?.filter(
    (item) => item.isPublic && (!item.source || item.source.trim().length < 2)
  );
  if (!invalidInfra || invalidInfra.length === 0) {
    items.push({
      id: "infraSources",
      title: "Infrastructure Data Sourcing",
      category: "INTELLIGENCE",
      status: "READY",
      message: "All public infrastructure milestones have verified source citations.",
    });
  } else {
    items.push({
      id: "infraSources",
      title: "Infrastructure Data Sourcing",
      category: "INTELLIGENCE",
      status: "BLOCKING",
      message: `${invalidInfra.length} public infrastructure milestone(s) are missing required source citations.`,
    });
  }

  // 15. Market Observations Source Verification
  const invalidObservations = location.marketObservations?.filter(
    (obs) => obs.isPublic && (!obs.sourceName || obs.sourceName.trim().length < 2)
  );
  if (!invalidObservations || invalidObservations.length === 0) {
    items.push({
      id: "marketSources",
      title: "Market Metrics Sourcing",
      category: "INTELLIGENCE",
      status: "READY",
      message: "All public market intelligence claims have source attribution.",
    });
  } else {
    items.push({
      id: "marketSources",
      title: "Market Metrics Sourcing",
      category: "INTELLIGENCE",
      status: "BLOCKING",
      message: `${invalidObservations.length} public market observation(s) lack source names.`,
    });
  }

  // 16. Coordinates Verification
  if (
    location.coordinates &&
    typeof location.coordinates.latitude === "number" &&
    typeof location.coordinates.longitude === "number"
  ) {
    if (
      location.coordinates.latitude >= -90 &&
      location.coordinates.latitude <= 90 &&
      location.coordinates.longitude >= -180 &&
      location.coordinates.longitude <= 180
    ) {
      items.push({
        id: "coordinates",
        title: "Geographic Coordinates",
        category: "IDENTITY",
        status: "READY",
        message: `Valid coordinates: (${location.coordinates.latitude}, ${location.coordinates.longitude}).`,
      });
    } else {
      items.push({
        id: "coordinates",
        title: "Geographic Coordinates",
        category: "IDENTITY",
        status: "BLOCKING",
        message: "Coordinates out of bounds (-90..90 lat, -180..180 lon).",
      });
    }
  } else {
    items.push({
      id: "coordinates",
      title: "Geographic Coordinates",
      category: "IDENTITY",
      status: "READY",
      message: "No coordinates provided; map rendering is safely deferred.",
    });
  }

  const blockingCount = items.filter((i) => i.status === "BLOCKING").length;
  const warningCount = items.filter((i) => i.status === "WARNING").length;
  const readyCount = items.filter((i) => i.status === "READY").length;

  return {
    canPublish: blockingCount === 0,
    totalChecks: items.length,
    readyCount,
    warningCount,
    blockingCount,
    items,
  };
}

/**
 * Calculate historical market trend points.
 * Rule: ONLY return sufficient data if at least 2 distinct historical periods exist.
 */
export function calculateLocationMarketTrends(location: ILocation): {
  hasSufficientData: boolean;
  periods: { period: string; rateRupees: number; ratePaise: number; isPublic: boolean }[];
  appreciationPercent: number | null;
} {
  const observations = location.marketObservations || [];
  const rateObservations = observations.filter(
    (o) =>
      o.metricType === "AVERAGE_ASKING_RATE" ||
      o.metricType === "RATE_PER_SQ_FT" ||
      o.metricType === "RATE_PER_SQ_YD"
  );

  // Group by observation period
  const periodMap = new Map<string, { rateRupees: number; ratePaise: number; isPublic: boolean; date?: Date }>();

  for (const obs of rateObservations) {
    if (!obs.observationPeriod) continue;

    const rateRupees =
      obs.canonicalUnit === "PAISE_PER_SQ_FT"
        ? Math.round(obs.numericValue / 100)
        : obs.numericValue;

    const ratePaise =
      obs.canonicalUnit === "PAISE_PER_SQ_FT"
        ? obs.numericValue
        : Math.round(obs.numericValue * 100);

    if (!periodMap.has(obs.observationPeriod)) {
      periodMap.set(obs.observationPeriod, {
        rateRupees,
        ratePaise,
        isPublic: obs.isPublic,
        date: obs.createdAt ? new Date(obs.createdAt) : undefined,
      });
    }
  }

  const periods = Array.from(periodMap.entries()).map(([period, data]) => ({
    period,
    rateRupees: data.rateRupees,
    ratePaise: data.ratePaise,
    isPublic: data.isPublic,
  }));

  if (periods.length < 2) {
    return {
      hasSufficientData: false,
      periods,
      appreciationPercent: null,
    };
  }

  // Calculate appreciation between first and last periods
  const firstRate = periods[0].rateRupees;
  const lastRate = periods[periods.length - 1].rateRupees;
  const appreciation = firstRate > 0 ? ((lastRate - firstRate) / firstRate) * 100 : 0;

  return {
    hasSufficientData: true,
    periods,
    appreciationPercent: Math.round(appreciation * 10) / 10,
  };
}
