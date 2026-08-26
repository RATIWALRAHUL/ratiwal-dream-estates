import "server-only";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Calendar, Database, Sparkles, RefreshCw } from "lucide-react";
import { getAdminSession } from "@/lib/auth/session";
import { getDashboardOverview } from "@/lib/services/dashboard.service";
import { MarketPulseStrip } from "@/components/dashboard/overview/MarketPulseStrip";
import { SummaryCards } from "@/components/dashboard/overview/SummaryCards";
import { InventoryStatusBar } from "@/components/dashboard/overview/InventoryStatusBar";
import { VerificationAlertsPanel } from "@/components/dashboard/overview/VerificationAlertsPanel";
import { RecentPropertiesTable } from "@/components/dashboard/overview/RecentPropertiesTable";
import { LocationCoverageGrid } from "@/components/dashboard/overview/LocationCoverageGrid";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/dashboard/login");
  }

  const overview = await getDashboardOverview();
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* 1. Real-Time Market Pulse & Intelligence Strip */}
      <MarketPulseStrip metrics={overview.metrics} />

      {/* 2. Elevated Summary KPI Metric Cards (6 Intelligence Tiers with Sparklines) */}
      <SummaryCards metrics={overview.metrics} />

      {/* 3. Segmented Gradient Plot Inventory Distribution */}
      <InventoryStatusBar
        inventory={overview.inventoryBreakdown}
        totalPlots={overview.metrics.totalPlotOptions}
      />

      {/* 4. Statutory Compliance & Due Diligence Attention Panel */}
      <VerificationAlertsPanel alerts={overview.verificationAlerts} />

      {/* 5. Recently Updated Properties Table with Real Thumbnails & Row Lift */}
      <RecentPropertiesTable properties={overview.recentProperties} />

      {/* 6. Regional Growth Corridor Density Grid with Mini Donut Charts */}
      <LocationCoverageGrid locations={overview.locationCoverage} />
    </div>
  );
}
