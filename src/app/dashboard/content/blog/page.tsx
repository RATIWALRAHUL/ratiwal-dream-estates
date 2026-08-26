import "server-only";

import React, { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { CmsQueryService } from "@/lib/services/cms-query.service";
import { CmsEntryListView } from "@/components/dashboard/cms/CmsEntryListView";
import { CmsOverviewSkeleton } from "@/components/dashboard/cms/CmsSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Insights & Guides | Ratiwal Dashboard",
  robots: { index: false, follow: false },
};

async function BlogContent() {
  await requireSession();
  const entries = await CmsQueryService.getCmsEntries({ contentType: "BLOG_POST" });

  return (
    <CmsEntryListView
      initialEntries={entries}
      defaultType="BLOG_POST"
      title="Insights & RERA Blueprints"
      description="Author and publish market research, registry guides, and land valuation articles."
    />
  );
}

export default function CmsBlogPage() {
  return (
    <Suspense fallback={<CmsOverviewSkeleton />}>
      <BlogContent />
    </Suspense>
  );
}
