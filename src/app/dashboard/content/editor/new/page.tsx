import "server-only";

import React, { Suspense } from "react";
import { requireSession } from "@/lib/auth/session";
import { CmsBlockEditorView } from "@/components/dashboard/cms/CmsBlockEditorView";
import { CmsEditorSkeleton } from "@/components/dashboard/cms/CmsSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Content Entry | Ratiwal Dashboard",
  robots: { index: false, follow: false },
};

async function NewEditorContent(props: { type?: string }) {
  await requireSession();
  return <CmsBlockEditorView isNew defaultType={props.type} />;
}

export default async function CmsNewEditorPage(props: {
  searchParams: Promise<{ type?: string }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <Suspense fallback={<CmsEditorSkeleton />}>
      <NewEditorContent type={searchParams.type} />
    </Suspense>
  );
}
