import "server-only";

import React, { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { RedirectRule } from "@/models/RedirectRule";
import { CmsRedirectsView } from "@/components/dashboard/cms/CmsRedirectsView";
import { CmsOverviewSkeleton } from "@/components/dashboard/cms/CmsSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "URL Redirect Rules | Ratiwal Dashboard",
  robots: { index: false, follow: false },
};

async function RedirectsContent() {
  await requireSession();
  await connectToDatabase();
  const redirects = await RedirectRule.find().sort({ createdAt: -1 }).lean();

  return (
    <CmsRedirectsView
      initialRedirects={redirects.map((r: any) => ({
        ...r,
        _id: r._id.toString(),
        createdAt: r.createdAt?.toISOString(),
      }))}
    />
  );
}

export default function CmsRedirectsPage() {
  return (
    <Suspense fallback={<CmsOverviewSkeleton />}>
      <RedirectsContent />
    </Suspense>
  );
}
