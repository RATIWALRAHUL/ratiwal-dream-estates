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
  agent: {
    name: "Suresh Kumawat",
    role: "Senior Property Advisor",
    email: "Sureshkumawat6917@gmail.com",
    phone: "+91-9929533436",
    displayPhone: "+91 99295 33436",
    rawPhone: "9929533436",
    reraNo: "RAJ/A/2019/983",
    experience: "8+ Years",
    clients: "250+",
    salesExperience: "50,000+ Sq. Yards",
    salesDetails: "50,000+ Sq. Yards Sell Experience",
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
