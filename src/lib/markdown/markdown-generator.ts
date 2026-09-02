/**
 * @file markdown-generator.ts
 * @description Generates authentic, data-driven Markdown representations of public pages
 * for AI crawlers, LLMs, and agent clients requesting `Accept: text/markdown`.
 */

import { siteConfig } from "@/config/site";
import { properties as fallbackProperties } from "@/data/properties";
import { locations as fallbackLocations } from "@/data/locations";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { Location } from "@/models/Location";
import { formatPaiseToRupeeString } from "@/lib/utils/currency";

const baseUrl = siteConfig.url.replace(/\/$/, "");

export class MarkdownGenerator {
  /**
   * Homepage Markdown
   */
  public static async getHomepageMarkdown(): Promise<string> {
    return `# ${siteConfig.name}
> ${siteConfig.tagline}

## Executive Summary
${siteConfig.name} is a premier real-estate consultancy and land advisory firm based in Jaipur, India. We specialize in verified, clear-title plotted developments, government-approved (JDA / RERA) land assets, and strategic investment corridors with high capital appreciation potential.

## Strategic Investment Corridors
- **Ajmer Road Expressway Corridor:** High-growth plotted developments near Mahindra World City SEZ and education hubs.
- **Jagatpura & Mahal Road Belt:** Prime residential growth corridor with high rental yield and fast connectivity to Jaipur International Airport.
- **Sirsi Road & Vaishali Extension:** Established residential plotted parcels with complete underground infrastructure.
- **Tonk Road & Ring Road Junction:** High-appreciation long-term land parcels with direct expressway connectivity.

## Core Buyer Protection Framework (7 Pillars)
1. **Comprehensive Title Diligence:** 30-year revenue search & non-encumbrance verification.
2. **JDA & RERA Approval Certification:** Strict compliance check of approved layout plans.
3. **Physical Boundary Demarcation:** GPS-tagged boundary pillars and clear access road measurements.
4. **Transparent Registry Process:** Direct government registry assistance with complete stamp duty clarity.
5. **Zero Hidden Charges:** Transparent pricing with clear demarcation of PLC and development fees.
6. **Infrastructure Diligence:** Underground electrification, sewage trunk lines, and borewell water checks.
7. **Post-Acquisition Advisory:** Boundary fencing coordination, mutation filing, and periodic inspection support.

## Key Actions & Inquiries
- **Browse Properties:** [View Catalog](${baseUrl}/properties)
- **Explore Locations:** [View Location Guides](${baseUrl}/locations)
- **Schedule Advisory Call:** [Book Consultation](${baseUrl}/contact)
- **Helpline:** ${siteConfig.contact.phone} | **Email:** ${siteConfig.contact.email}
`;
  }

  /**
   * Properties Catalog Markdown
   */
  public static async getPropertiesCatalogMarkdown(): Promise<string> {
    let propList = fallbackProperties;
    try {
      await connectToDatabase();
      const live = await Property.find({ publicationStatus: "PUBLISHED", archivedAt: null }).lean();
      if (live && live.length > 0) propList = live as any;
    } catch {}

    let md = `# ${siteConfig.name} — Verified Properties Catalog
> Clear-title plotted developments and land parcels across Jaipur's fastest growing micro-markets.

## Active Plotted Developments (${propList.length} Listings)

`;

    (propList as any[]).forEach((p, idx) => {
      const title = p.title || p.name || "Plotted Land Development";
      const price = p.priceStartingPaise ? formatPaiseToRupeeString(p.priceStartingPaise) : p.priceLabel || p.priceFormatted || "Contact for Pricing";
      const area = p.areaMinSqYd ? `${p.areaMinSqYd} – ${p.areaMaxSqYd || p.areaMinSqYd} Sq. Yds` : p.plotSizes ? p.plotSizes.join(", ") : p.plotSizeRange || "Multiple Sizes Available";

      md += `### ${idx + 1}. ${title}
- **Canonical URL:** ${baseUrl}/properties/${p.slug}
- **Location:** ${p.locationName || p.location || "Jaipur, Rajasthan"}
- **Price Range:** Starting from ${price}
- **Plot Dimensions:** ${area}
- **Approval:** ${p.jdaApproved || p.highlights?.some((h: string) => h.includes("JDA")) ? "JDA Approved" : "Clear Title Verified"} ${p.reraNumber ? `| RERA: ${p.reraNumber}` : ""}
- **Description:** ${p.headline || p.shortDescription || p.description || "Verified land development project."}

`;
    });

    md += `## Inquire or Schedule a Site Tour
- **Direct Hotline:** ${siteConfig.contact.phone}
- **Email:** ${siteConfig.contact.email}
- **Online Form:** [Submit Enquiry](${baseUrl}/contact)
`;
    return md;
  }

  /**
   * Property Detail Markdown
   */
  public static async getPropertyDetailMarkdown(slug: string): Promise<string | null> {
    let prop: any = null;
    try {
      await connectToDatabase();
      prop = await Property.findOne({ slug, publicationStatus: "PUBLISHED", archivedAt: null }).lean();
    } catch {}

    if (!prop) {
      prop = fallbackProperties.find((p) => p.slug === slug);
    }

    if (!prop) return null;

    const title = prop.title || prop.name || "Plotted Land Development";
    const headline = prop.headline || prop.shortDescription || prop.description || "Premium plotted development by Ratiwal Dream Estates.";
    const price = prop.priceStartingPaise ? formatPaiseToRupeeString(prop.priceStartingPaise) : prop.priceLabel || prop.priceFormatted || "Contact for Pricing";
    const area = prop.areaMinSqYd ? `${prop.areaMinSqYd} – ${prop.areaMaxSqYd || prop.areaMinSqYd} Sq. Yds` : prop.plotSizes ? prop.plotSizes.join(", ") : prop.plotSizeRange || "Available in Multiple Sizes";
    const locationStr = prop.locationName || prop.location || "Jaipur, Rajasthan";
    const amenitiesList = prop.amenities || prop.highlights || ["Wide 40-60 ft Tar Roads", "Underground Electricity & Water Lines", "Gated Security with Demarcated Boundaries", "Landscaped Public Parks & Tree-lined Avenues"];

    return `# ${title}
> ${headline}

## Property Specifications
- **Property Name:** ${title}
- **Canonical URL:** ${baseUrl}/properties/${prop.slug}
- **Location / Corridor:** ${locationStr}
- **Investment Bracket:** Starting from ${price}
- **Plot Dimensions:** ${area}
- **Approval & Certification:** ${prop.jdaApproved || prop.highlights?.some((h: string) => h.includes("JDA")) ? "JDA Approved & Clear Title" : "Clear Title Verified"} ${prop.reraNumber ? `(RERA Registration No: ${prop.reraNumber})` : ""}
- **Development Status:** Ready for Registry & Possession

## Overview & Infrastructure
${prop.description || "Comprehensive residential plotted land project with wide blacktop roads, underground electrification, dedicated green parks, and secure perimeter boundary."}

## Key Amenities & Features
${amenitiesList.map((a: string) => `- ${a}`).join("\n")}

## Advisory & Site Visit Booking
- **Schedule a Guided Site Tour:** [Request Visit](${baseUrl}/contact?property=${encodeURIComponent(title)})
- **Direct Helpline:** ${siteConfig.contact.phone}
- **Office Email:** ${siteConfig.contact.email}
`;
  }

  /**
   * Locations Catalog Markdown
   */
  public static async getLocationsCatalogMarkdown(): Promise<string> {
    let locList = fallbackLocations;
    try {
      await connectToDatabase();
      const live = await Location.find({ publicationStatus: "PUBLISHED", archivedAt: null }).lean();
      if (live && live.length > 0) locList = live as any;
    } catch {}

    let md = `# ${siteConfig.name} — Prime Location Guides
> Comprehensive investment intelligence for Jaipur's highest capital-growth corridors.

## Featured Growth Corridors

`;

    locList.forEach((l, idx) => {
      md += `### ${idx + 1}. ${l.name}
- **Canonical URL:** ${baseUrl}/locations/${l.slug}
- **Overview:** ${(l as any).headline || (l as any).description || "Fast developing corridor with high residential demand and rapid infrastructure expansion."}

`;
    });

    md += `## Location Advisory
Connect with our micro-market analysts for localized rate appreciation charts:
- **Phone:** ${siteConfig.contact.phone}
- **Email:** ${siteConfig.contact.email}
- **Consultation Form:** [Contact Us](${baseUrl}/contact)
`;
    return md;
  }

  /**
   * Location Detail Markdown
   */
  public static async getLocationDetailMarkdown(slug: string): Promise<string | null> {
    let loc: any = null;
    try {
      await connectToDatabase();
      loc = await Location.findOne({ slug, publicationStatus: "PUBLISHED", archivedAt: null }).lean();
    } catch {}

    if (!loc) {
      loc = fallbackLocations.find((l) => l.slug === slug);
    }

    if (!loc) return null;

    return `# ${loc.name} — Micro-Market Intelligence
> ${loc.headline || loc.description || "Detailed real estate investment report for " + loc.name}

## Corridor Overview
${loc.description || loc.overview || loc.name + " represents one of Jaipur's prime plotted investment hubs with strong government infrastructure backing."}

## Connectivity & Infrastructure Highlights
${(loc.heroHighlights || ["Close proximity to major arterial highways", "Rapid commercial & residential expansion", "High historical year-over-year capital appreciation"]).map((h: string) => `- ${h}`).join("\n")}

## Explore Opportunities in ${loc.name}
- **Browse Nearby Properties:** [View Listings](${baseUrl}/properties)
- **Schedule Advisor Briefing:** [Contact Team](${baseUrl}/contact)
`;
  }

  /**
   * About Us Markdown
   */
  public static async getAboutMarkdown(): Promise<string> {
    return `# About ${siteConfig.name}
> ${siteConfig.tagline}

## Our Mission
To transform real estate land acquisition into a safe, transparent, and wealth-building experience through uncompromising legal diligence, transparent documentation, and personalized lifelong advisory.

## Founder Heritage & Philosophy
Founded on the principle of absolute buyer protection, ${siteConfig.name} has guided hundreds of families, NRIs, and institutional investors in acquiring clear-title plotted assets across Jaipur, the NCR, and Maharashtra growth corridors.

## Core Capabilities
- 30-Year Revenue & Title Search
- JDA / RERA Compliance Verification
- Demarcated Boundary Ground Diligence
- Transparent Government Registry Assistance

## Connect with Us
- **Address:** ${siteConfig.contact.address}
- **Phone:** ${siteConfig.contact.phone}
- **Email:** ${siteConfig.contact.email}
`;
  }

  /**
   * Contact Information Markdown
   */
  public static async getContactMarkdown(): Promise<string> {
    return `# Contact & Consultation — ${siteConfig.name}
> Connect with our senior land advisors for bespoke portfolio consultations.

## Official Contact Channels
- **Direct Phone Hotline:** ${siteConfig.contact.phone}
- **Official WhatsApp Support:** ${siteConfig.contact.whatsapp}
- **Business Email:** ${siteConfig.contact.email}
- **Corporate Address:** ${siteConfig.contact.address}
- **Business Hours:** ${siteConfig.contact.officeHours}

## Online Inquiry
You can submit a direct inquiry online at: [${baseUrl}/contact](${baseUrl}/contact)
`;
  }
}
