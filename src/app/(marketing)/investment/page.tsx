import { getMetadata } from "@/lib/seo";
import { 
  InvestmentHero, 
  InvestmentThesis, 
  InvestmentCalculator, 
  InvestmentCorridors, 
  InvestmentRiskMitigation, 
  InvestmentProfiles, 
  InvestmentLifecycle, 
  InvestmentCTA 
} from "@/components/sections/investment";

export const metadata = getMetadata({
  title: "Investment Strategy — Capital Allocation & Growth Corridors",
  description:
    "Discover Ratiwal Dream Estates' institutional land investment thesis. Model land ROI, explore high-velocity growth corridors in Jaipur & Navi Mumbai, and access 100% verified titles.",
  slug: "/investment",
});

export default function InvestmentPage() {
  return (
    <div className="flex flex-col w-full">
      <InvestmentHero />
      <InvestmentThesis />
      <InvestmentCalculator />
      <InvestmentCorridors />
      <InvestmentRiskMitigation />
      <InvestmentProfiles />
      <InvestmentLifecycle />
      <InvestmentCTA />
    </div>
  );
}
