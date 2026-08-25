import { getMetadata } from "@/lib/seo";
import { 
  ContactHero, 
  ContactFormHub, 
  ContactOffices, 
  ContactFAQ, 
  ContactDirectBar 
} from "@/components/sections/contact";
import { buildBreadcrumbSchema, buildWebPageSchema, sanitizeJsonLd } from "@/lib/schema";
import { siteConfig } from "@/config/site";

export const metadata = getMetadata({
  title: "Contact Us — Private Land Advisory & Site Visits",
  description:
    "Schedule a 1-on-1 land consultation with Ratiwal Dream Estates advisors in Jaipur, arrange an accompanied on-ground site inspection, or chat directly on WhatsApp.",
  slug: "/contact",
});

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        title: "Contact Us — Private Land Advisory & Site Visits | Ratiwal Dream Estates",
        description:
          "Schedule a 1-on-1 land consultation with Ratiwal Dream Estates advisors, arrange an accompanied on-ground site inspection, or chat directly on WhatsApp.",
        url: `${siteConfig.url}/contact`,
        type: "ContactPage",
      }),
      buildBreadcrumbSchema([
        { name: "Home", url: siteConfig.url },
        { name: "Contact Us", url: `${siteConfig.url}/contact` },
      ]),
    ],
  };

  return (
    <div className="flex flex-col w-full">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }}
      />
      <ContactHero />
      <ContactFormHub />
      <ContactOffices />
      <ContactFAQ />
      <ContactDirectBar />
    </div>
  );
}
