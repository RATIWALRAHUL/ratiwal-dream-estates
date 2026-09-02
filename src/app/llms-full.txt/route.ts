import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { properties as fallbackProperties } from "@/data/properties";
import { locations as fallbackLocations } from "@/data/locations";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { Location } from "@/models/Location";
import { formatPaiseToRupeeString } from "@/lib/utils/currency";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  let propertyList = fallbackProperties;
  let locationList = fallbackLocations;

  try {
    await connectToDatabase();
    const liveProps = await Property.find(
      { publicationStatus: "PUBLISHED", archivedAt: null },
      { title: 1, slug: 1, headline: 1, locationName: 1, priceStartingPaise: 1, areaMinSqYd: 1, areaMaxSqYd: 1, reraNumber: 1, jdaApproved: 1, description: 1 }
    ).lean();

    if (liveProps && liveProps.length > 0) {
      propertyList = liveProps as any;
    }

    const liveLocs = await Location.find(
      { publicationStatus: "PUBLISHED", archivedAt: null },
      { name: 1, slug: 1, headline: 1, description: 1, heroHighlights: 1 }
    ).lean();

    if (liveLocs && liveLocs.length > 0) {
      locationList = liveLocs as any;
    }
  } catch {
    // Graceful fallback to static data
  }

  let content = `# ${siteConfig.name} — Full Machine-Readable Knowledge Catalog

> ${siteConfig.tagline}
> Complete public catalog of verified plotted developments, investment locations, and buyer protection guidelines across Jaipur and growth corridors.

---

## 1. Verified Properties & Plotted Developments

`;

  (propertyList as any[]).forEach((p, idx) => {
    const title = p.title || p.name || "Plotted Land Development";
    const price = p.priceStartingPaise ? formatPaiseToRupeeString(p.priceStartingPaise) : p.priceLabel || p.priceFormatted || "Contact for Pricing";
    const area = p.areaMinSqYd ? `${p.areaMinSqYd} – ${p.areaMaxSqYd || p.areaMinSqYd} Sq. Yds` : p.plotSizes ? p.plotSizes.join(", ") : p.plotSizeRange || "Available in Multiple Sizes";
    
    content += `### ${idx + 1}. ${title}
- **URL:** ${baseUrl}/properties/${p.slug}
- **Location / Corridor:** ${p.locationName || p.location || "Jaipur Corridor"}
- **Pricing:** Starting at ${price}
- **Plot Dimensions:** ${area}
- **Compliance Status:** ${p.jdaApproved || p.highlights?.some((h: string) => h.includes("JDA")) ? "JDA Approved & Clear Title" : "RERA Verified Diligence"} ${p.reraNumber ? `(RERA: ${p.reraNumber})` : ""}
- **Summary:** ${p.headline || p.shortDescription || p.description || "Verified plotted land development with high capital appreciation potential."}

`;
  });

  content += `---

## 2. Micro-Market Locations & Corridor Intelligence

`;

  locationList.forEach((l, idx) => {
    content += `### ${idx + 1}. ${l.name}
- **URL:** ${baseUrl}/locations/${l.slug}
- **Overview:** ${(l as any).headline || (l as any).description || "Prime investment corridor in Jaipur with major infrastructure connectivity."}

`;
  });

  content += `---

## 3. Core Buyer Protection Framework (7 Pillars)
1. **Title Diligence:** 30-year revenue search & non-encumbrance certificate verification.
2. **JDA & RERA Approval Certification:** Strict verification of approved layout plans and government sanctions.
3. **Physical Boundary Demarcation:** GPS-tagged boundary pillars and clear access road measurements.
4. **Transparent Registry Process:** Transparent government registry assistance with complete stamp duty clarity.
5. **Zero Hidden Charges:** Transparent pricing with clear demarcation of PLC, development fees, and registry costs.
6. **Infrastructure Audit:** Underground electrification, sewage trunk lines, and borewell water availability checks.
7. **Post-Acquisition Advisory:** Boundary fencing coordination, registry mutation, and periodic site inspection support.

---

## 4. Contact & Consultation
- **Customer Care & Inquiries:** ${siteConfig.contact.phone} / ${siteConfig.contact.email}
- **Consultation Form:** ${baseUrl}/contact
- **Sitemap:** ${baseUrl}/sitemap.xml
- **API Catalog:** ${baseUrl}/.well-known/api-catalog
- **AI Policy:** Search Indexing = YES | User Answers = YES | Training Without Agreement = NO
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
      "Vary": "Accept",
    },
  });
}
