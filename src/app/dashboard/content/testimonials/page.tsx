import "server-only";

import React, { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CmsTestimonial } from "@/models/CmsTestimonial";
import { CmsTestimonialsView } from "@/components/dashboard/cms/CmsTestimonialsView";
import { CmsOverviewSkeleton } from "@/components/dashboard/cms/CmsSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Client Testimonials | Ratiwal Dashboard",
  robots: { index: false, follow: false },
};

async function TestimonialsContent() {
  await requireSession();
  await connectToDatabase();
  const testimonials = await CmsTestimonial.find().sort({ displayOrder: 1, createdAt: -1 }).lean();

  return (
    <CmsTestimonialsView
      initialTestimonials={testimonials.map((t: any) => ({
        ...t,
        _id: t._id.toString(),
      }))}
    />
  );
}

export default function CmsTestimonialsPage() {
  return (
    <Suspense fallback={<CmsOverviewSkeleton />}>
      <TestimonialsContent />
    </Suspense>
  );
}
