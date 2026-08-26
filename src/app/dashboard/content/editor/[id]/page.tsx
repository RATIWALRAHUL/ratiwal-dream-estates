import "server-only";

import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { CmsQueryService } from "@/lib/services/cms-query.service";
import { CmsBlockEditorView } from "@/components/dashboard/cms/CmsBlockEditorView";
import { CmsEditorSkeleton } from "@/components/dashboard/cms/CmsSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Content | Ratiwal Dashboard",
  robots: { index: false, follow: false },
};

async function EditorContent(props: { id: string }) {
  await requireSession();
  const data = await CmsQueryService.getCmsEntryDetail(props.id);
  if (!data) notFound();

  return <CmsBlockEditorView initialData={data} />;
}

export default async function CmsEditorPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return (
    <Suspense fallback={<CmsEditorSkeleton />}>
      <EditorContent id={params.id} />
    </Suspense>
  );
}
