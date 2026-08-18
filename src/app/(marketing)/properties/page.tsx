import { getMetadata } from "@/lib/seo";
import { 
  PropertiesHero, 
  PropertiesFilterSection, 
  PropertiesDiligenceStrip, 
  PropertiesCustomMandateCTA 
} from "@/components/sections/properties";
import { properties } from "@/data/properties";

export const metadata = getMetadata({
  title: "Verified Residential & Commercial Plots — Properties Portfolio",
  description:
    "Explore our vetted collection of premium residential and commercial plots in Jaipur, Ajmer, Navi Mumbai, Panvel, and Bhiwadi. 100% verified titles with full legal dossiers.",
  slug: "/properties",
});

export default function PropertiesPage() {
  return (
    <div className="flex flex-col w-full">
      <PropertiesHero />
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <PropertiesFilterSection properties={properties} />
      </div>
      <PropertiesDiligenceStrip />
      <PropertiesCustomMandateCTA />
    </div>
  );
}
