import { getMetadata } from "@/lib/seo";
import { 
  ContactHero, 
  ContactFormHub, 
  ContactOffices, 
  ContactFAQ, 
  ContactDirectBar 
} from "@/components/sections/contact";

export const metadata = getMetadata({
  title: "Contact Us — Private Land Advisory & Site Visits",
  description:
    "Schedule a 1-on-1 land consultation with Ratiwal Dream Estates advisors in Jaipur, arrange an accompanied on-ground site inspection, or chat directly on WhatsApp.",
  slug: "/contact",
});

export default function ContactPage() {
  return (
    <div className="flex flex-col w-full">
      <ContactHero />
      <ContactFormHub />
      <ContactOffices />
      <ContactFAQ />
      <ContactDirectBar />
    </div>
  );
}
