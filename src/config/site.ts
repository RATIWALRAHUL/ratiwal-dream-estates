export const siteConfig = {
  name: "Ratiwal Dream Estates",
  tagline: "Lifelong Property Consultancy, Built on Trust & Transparency.",
  url:
    (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process.env.SITE_URL && !process.env.SITE_URL.includes("localhost")
      ? process.env.SITE_URL
      : "https://ratiwaldreamestates.com"
    ).replace(/\/$/, ""),
  contact: {
    phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+91-9929533436",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+91-9929533436",
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "info@ratiwaldreamestates.com",
    address: "Jaipur, Rajasthan, India",
    officeHours: "10:00 AM - 7:00 PM (IST)",
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
