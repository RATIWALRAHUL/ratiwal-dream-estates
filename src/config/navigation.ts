export interface NavLink {
  label: string;
  href: string;
}

export const navigationConfig = {
  mainNav: [
    { label: "Home", href: "/" },
    { label: "Properties", href: "/properties" },
    { label: "Investment", href: "/investment" },
    { label: "About Us", href: "/about" },
    { label: "Why Choose Us", href: "/why-choose-us" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "Insights", href: "/insights" },
    { label: "Contact", href: "/contact" },
  ] as NavLink[],
  
  footerNav: {
    company: [
      { label: "About Us", href: "/about" },
      { label: "Why Choose Us", href: "/why-choose-us" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Insights", href: "/insights" },
    ] as NavLink[],
    properties: [
      { label: "All Properties", href: "/properties" },
      { label: "Jaipur Plots", href: "/locations/jaipur" },
      { label: "Navi Mumbai Plots", href: "/locations/navi-mumbai" },
      { label: "Panvel Plots", href: "/locations/panvel" },
    ] as NavLink[],
    support: [
      { label: "Contact Us", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy-policy" }, // future placeholder
      { label: "Terms of Service", href: "/terms-of-service" }, // future placeholder
    ] as NavLink[],
  },
};
