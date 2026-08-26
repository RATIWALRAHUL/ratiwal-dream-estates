import "server-only";

import React, { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { CmsQueryService } from "@/lib/services/cms-query.service";
import { CmsOverviewView } from "@/components/dashboard/cms/CmsOverviewView";
import { CmsOverviewSkeleton } from "@/components/dashboard/cms/CmsSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Content & SEO Overview | Ratiwal Dashboard",
  robots: { index: false, follow: false },
};

async function CmsOverviewContent() {
  await requireSession();
  const [metrics, recentEntries] = await Promise.all([
    CmsQueryService.getCmsOverviewMetrics(),
    CmsQueryService.getCmsEntries({}),
  ]);

  return <CmsOverviewView metrics={metrics} recentEntries={recentEntries.slice(0, 8)} />;
}

export default function CmsOverviewPage() {
  return (
    <Suspense fallback={<CmsOverviewSkeleton />}>
      <CmsOverviewContent />
    </Suspense>
  );
}
