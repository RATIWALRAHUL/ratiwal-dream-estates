import "server-only";

import React, { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { SeoAuditView } from "@/components/dashboard/cms/SeoAuditView";
import { CmsOverviewSkeleton } from "@/components/dashboard/cms/CmsSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SEO Health Desk | Ratiwal Dashboard",
  robots: { index: false, follow: false },
};

async function SeoPageContent() {
  await requireSession();
  return <SeoAuditView />;
}

export default function SeoPage() {
  return (
    <Suspense fallback={<CmsOverviewSkeleton />}>
      <SeoPageContent />
    </Suspense>
  );
}
