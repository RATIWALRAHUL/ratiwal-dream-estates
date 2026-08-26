import "server-only";

import React, { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { CmsQueryService } from "@/lib/services/cms-query.service";
import { CmsEntryListView } from "@/components/dashboard/cms/CmsEntryListView";
import { CmsOverviewSkeleton } from "@/components/dashboard/cms/CmsSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pages & Landing Hubs | Ratiwal Dashboard",
  robots: { index: false, follow: false },
};

async function PagesContent() {
  await requireSession();
  const entries = await CmsQueryService.getCmsEntries({ contentType: "STANDARD_PAGE" });

  return (
    <CmsEntryListView
      initialEntries={entries}
      defaultType="STANDARD_PAGE"
      title="Standard Pages & Landing Hubs"
      description="Manage top-level landing pages, investment guides, and regional corridors."
    />
  );
}

export default function CmsPagesPage() {
  return (
    <Suspense fallback={<CmsOverviewSkeleton />}>
      <PagesContent />
    </Suspense>
  );
}
