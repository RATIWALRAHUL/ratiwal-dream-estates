import { siteConfig } from "@/config/site";
import { fitCities, titleCities, type ListingSummary } from "@/lib/utils/listing-summary";

/**
 * Metadata copy for the index pages (/, /properties, /locations), built from the
 * saved Location records. Visible page content is never touched by these.
 *
 * Titles target <= 60 characters including " | Ratiwal Dream Estates";
 * descriptions target <= 160 characters.
 */
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;
const BRAND_SUFFIX_LENGTH = ` | ${siteConfig.name}`.length;

/** Largest location list (max 3, then "& More") that keeps the full title within 60 chars. */
function titleLocationLabel(prefix: string, cities: string[]): string {
  for (let n = Math.min(3, cities.length); n >= 1; n--) {
    const label = titleCities(cities, n);
    if (prefix.length + label.length + BRAND_SUFFIX_LENGTH <= TITLE_MAX) return label;
  }
  return cities[0] ?? "";
}

/** Fill the template with as many locations as fit in the description budget. */
function describe(template: (cities: string) => string, cities: string[]): string {
  const budget = DESCRIPTION_MAX - template("").length;
  return template(fitCities(cities, budget));
}

export interface PageCopy {
  title: string;
  description: string;
}

export function homeCopy(summary: ListingSummary): PageCopy {
  if (summary.cities.length === 0) {
    return {
      title: "Real Estate Consultant & Verified Plots",
      description:
        "Ratiwal Dream Estates is your real estate consultant for verified land, clear documentation and accompanied site visits.",
    };
  }
  const prefix = "Real Estate Consultant in ";
  return {
    title: `${prefix}${titleLocationLabel(prefix, summary.cities)}`,
    description: describe(
      (c) =>
        `Real estate consultant for plots in ${c}. Verified land, clear documentation and accompanied site visits with Ratiwal Dream Estates.`,
      summary.cities
    ),
  };
}

export function catalogCopy(summary: ListingSummary): PageCopy {
  if (summary.cities.length === 0) {
    return {
      title: "Plots & Properties for Sale",
      description:
        "Browse residential and commercial plots with Ratiwal Dream Estates. Compare plot sizes in Sq. Yds and Sq. Ft, price status and documents for each project.",
    };
  }
  const prefix = "Plots for Sale in ";
  return {
    title: `${prefix}${titleLocationLabel(prefix, summary.cities)}`,
    description: describe(
      (c) =>
        `Residential and commercial plots for sale in ${c}. Compare plot sizes in Sq. Yds and Sq. Ft, price status and documents.`,
      summary.cities
    ),
  };
}

export function locationsCopy(summary: ListingSummary): PageCopy {
  if (summary.cities.length === 0) {
    return {
      title: "Property Locations & Market Guides",
      description:
        "Explore Ratiwal Dream Estates property locations: micro-markets, infrastructure, connectivity and buyer guidance for every market we serve.",
    };
  }
  const prefix = "Property Locations in ";
  return {
    title: `${prefix}${titleLocationLabel(prefix, summary.cities)}`,
    description: describe(
      (c) =>
        `Explore property locations in ${c}: micro-markets, infrastructure, connectivity and buyer guidance from our advisors.`,
      summary.cities
    ),
  };
}
