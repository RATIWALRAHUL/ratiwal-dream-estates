/**
 * Single source of truth for track-record figures.
 * The advisor and the firm are the same practice, so every surface
 * (advisor card, About, footer, contact, JSON-LD) must read from here.
 */
export const firmStats = {
  yearsExperience: "8+",
  familiesGuided: "250+",
  sqYardsTransacted: "50,000+",
} as const;

function resolveCanonicalSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envUrl && !envUrl.includes("localhost")) {
    let clean = envUrl.replace(/\/$/, "");
    if (!clean.startsWith("http")) clean = `https://${clean}`;
    if (clean.includes("ratiwaldreamestates.com") && !clean.includes("www.ratiwaldreamestates.com")) {
      clean = clean.replace("ratiwaldreamestates.com", "www.ratiwaldreamestates.com");
    }
    return clean;
  }
  return "https://www.ratiwaldreamestates.com";
}

export const siteConfig = {
  name: "Ratiwal Dream Estates",
  tagline: "Lifelong Property Consultancy, Built on Trust & Transparency.",
  url: resolveCanonicalSiteUrl(),
  contact: {
    phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+91-9929533436",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+91-9929533436",
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "sureshkumawat6917@gmail.com",
    address: "Jaipur, Rajasthan, India",
    officeHours: "10:00 AM - 7:00 PM (IST)",
  },
  agent: {
    name: "Suresh Ratiwal",
    legalName: "Suresh Kumawat",
    role: "Senior Property Advisor",
    email: "Sureshkumawat6917@gmail.com",
    phone: "+91-9929533436",
    displayPhone: "+91 99295 33436",
    rawPhone: "9929533436",
    reraNo: "RAJ/A/2019/983",
    experience: `${firmStats.yearsExperience} Years`,
    clients: firmStats.familiesGuided,
    salesExperience: `${firmStats.sqYardsTransacted} Sq. Yards`,
    salesDetails: `${firmStats.sqYardsTransacted} Sq. Yards Sell Experience`,
    image: "/images/brand/suresh-kumawat.jpg",
  },
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
    twitter: "#",
  },
  ctas: {
    primary: {
      label: "Talk to an Expert",
      href: "/contact",
    },
    secondary: {
      label: "WhatsApp Us",
      href: "#", // Handled by WhatsApp URL helper dynamically
    },
  },
};

export type SiteConfig = typeof siteConfig;
