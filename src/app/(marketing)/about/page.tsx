import { getMetadata } from "@/lib/seo";
import { 
  AboutHero, 
  AboutStory, 
  AboutVerificationProtocol, 
  AboutLeadership, 
  AboutMilestones, 
  AboutCoreValues, 
  AboutCorridors, 
  AboutCTA 
} from "@/components/sections/about";

export const metadata = getMetadata({
  title: "About Us — Lifelong Property Consultancy Built on Trust",
  description:
    "Learn about Ratiwal Dream Estates, our founding principles, our 6-stage land verification protocol, and our fiduciary commitment to transparent property advisory in Rajasthan and Maharashtra.",
  slug: "/about",
});

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full">
      <AboutHero />
      <AboutStory />
      <AboutVerificationProtocol />
      <AboutLeadership />
      <AboutMilestones />
      <AboutCoreValues />
      <AboutCorridors />
      <AboutCTA />
    </div>
  );
}
