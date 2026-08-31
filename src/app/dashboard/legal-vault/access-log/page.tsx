import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongoose";
import { LegalDocumentAccessLog } from "@/models/LegalDocumentAccessLog";
import { LegalDocument } from "@/models/LegalDocument";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Document Access Audit Log | Ratiwal Dream Estates Dashboard",
  description: "Complete immutable audit log of document previews, downloads, and external share access.",
};

export default async function LegalAccessLogPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  await connectToDatabase();
  const logs = await LegalDocumentAccessLog.find()
    .sort({ timestamp: -1 })
    .limit(100)
    .lean();

  const docIds = logs.map((l) => l.legalDocumentId);
  const docs = await LegalDocument.find({ _id: { $in: docIds } })
    .select("title documentReference")
    .lean();
  const docMap = new Map(docs.map((d) => [d._id.toString(), d]));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/legal-vault"
          className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Legal Vault</span>
        </Link>
        <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
          Document Access & Audit Trail
        </h1>
        <p className="text-sm text-[#647581] mt-1">
          Immutable ledger of previews, downloads, external share interactions, and compliance status updates.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] uppercase text-[#647581]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">Actor Type</th>
                <th className="py-3 px-4">Actor / Email</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Access Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.04)]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#647581] italic">
                    No access events recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const doc = docMap.get(log.legalDocumentId.toString());
                  return (
                    <tr key={log._id.toString()} className="hover:bg-[#f8f7f4]/60 transition-colors">
                      <td className="py-3 px-4 text-[#647581]">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-4 font-sans font-bold text-[#071a28]">
                        <Link
                          href={`/dashboard/legal-vault/documents/${log.legalDocumentId}`}
                          className="hover:text-[#087fc3]"
                        >
                          {doc?.documentReference || "—"} ({doc?.title || "Document"})
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-[#071a28] font-bold">{log.actorType}</td>
                      <td className="py-3 px-4 text-[#647581]">{log.actorEmail || log.actorId || "External Link"}</td>
                      <td className="py-3 px-4 font-bold text-[#087fc3]">{log.action}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            log.accessResult === "GRANTED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {log.accessResult}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
