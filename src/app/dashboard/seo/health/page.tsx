import "server-only";

import React, { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { SeoAuditView } from "@/components/dashboard/cms/SeoAuditView";
import { CmsOverviewSkeleton } from "@/components/dashboard/cms/CmsSkeletons";
import { SeoSubNav } from "@/components/dashboard/seo/SeoChrome";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Site Health | SEO | Ratiwal Dashboard",
  robots: { index: false, follow: false },
};

async function SeoPageContent() {
  await requireSession();
  return (
    <div className="space-y-6">
      <SeoSubNav active="health" />
      <SeoAuditView />
    </div>
  );
}

export default function SeoHealthPage() {
  return (
    <Suspense fallback={<CmsOverviewSkeleton />}>
      <SeoPageContent />
    </Suspense>
  );
}
