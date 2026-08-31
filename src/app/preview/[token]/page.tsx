import "server-only";

import { CmsPreviewService } from "@/lib/services/cms-preview.service";
import { Eye, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Draft Preview | Ratiwal Dream Estates",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DraftPreviewPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const entry = await CmsPreviewService.resolvePreviewEntry(params.token);

  if (!entry) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
          Preview Link Expired or Invalid
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 max-w-md">
          This preview token has expired (2-hour limit) or has been revoked. Please generate a fresh preview link from the CMS editor.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Draft Preview Watermark Bar */}
      <div className="sticky top-0 z-50 bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 animate-pulse" />
          <span>DRAFT PREVIEW MODE — Version {entry.currentVersionNumber} (Not Publicly Indexed)</span>
        </div>
        <span className="font-mono text-[11px] opacity-90">{entry.entryReference}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-3">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            {entry.contentType.replace(/_/g, " ")}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-stone-900 dark:text-stone-100">
            {entry.title}
          </h1>
          {entry.excerpt && (
            <p className="text-lg text-stone-600 dark:text-stone-300 font-light leading-relaxed">
              {entry.excerpt}
            </p>
          )}
        </div>

        {/* Blocks Rendering */}
        <div className="space-y-6">
          {entry.blocks.map((block: any) => (
            <div
              key={block.id}
              className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xs"
            >
              <div className="text-[10px] font-mono font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Block: {block.type}
              </div>
              {block.data?.html ? (
                <div
                  className="prose dark:prose-invert max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: block.data.html }}
                />
              ) : (
                <pre className="text-xs text-stone-700 dark:text-stone-300 overflow-x-auto p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  {JSON.stringify(block.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
