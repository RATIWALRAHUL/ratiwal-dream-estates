import "server-only";

import React, { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CmsFaqItem } from "@/models/CmsFaqItem";
import { CmsFaqManagerView } from "@/components/dashboard/cms/CmsFaqManagerView";
import { CmsOverviewSkeleton } from "@/components/dashboard/cms/CmsSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FAQs Knowledge Base | Ratiwal Dashboard",
  robots: { index: false, follow: false },
};

async function FaqsContent() {
  await requireSession();
  await connectToDatabase();
  const faqs = await CmsFaqItem.find().sort({ displayOrder: 1, createdAt: -1 }).lean();

  return (
    <CmsFaqManagerView
      initialFaqs={faqs.map((f: any) => ({
        ...f,
        _id: f._id.toString(),
      }))}
    />
  );
}

export default function CmsFaqsPage() {
  return (
    <Suspense fallback={<CmsOverviewSkeleton />}>
      <FaqsContent />
    </Suspense>
  );
}
