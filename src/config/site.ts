export const siteConfig = {
  name: "Ratiwal Dream Estates",
  tagline: "Lifelong Property Consultancy, Built on Trust & Transparency.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
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
