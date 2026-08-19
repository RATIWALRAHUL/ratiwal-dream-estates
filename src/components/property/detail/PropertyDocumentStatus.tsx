import Link from "next/link";
import { FileCheck, ShieldCheck, Scale, ExternalLink, Clock, AlertCircle } from "lucide-react";
import { PropertyDocumentItem } from "@/types/property";

interface PropertyDocumentStatusProps {
  documents?: PropertyDocumentItem[];
  propertyName: string;
}

export function PropertyDocumentStatus({
  documents,
  propertyName,
}: PropertyDocumentStatusProps) {
  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="doc-status-heading" className="mb-12">
      <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)]">
        <div className="max-w-[720px] mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(36,209,127,0.1)] border border-[rgba(36,209,127,0.25)] text-[#10854d] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Title &amp; Sanction Audit</span>
          </div>
          <h2
            id="doc-status-heading"
            className="font-heading text-2xl sm:text-3xl text-[#031C2B] font-normal leading-tight tracking-tight mb-2"
          >
            Available property information.
          </h2>
          <p className="text-xs sm:text-sm text-[#4a6171]">
            Document availability status across statutory conversion orders, masterplans, and revenue registers for {propertyName}.
          </p>
        </div>

        {/* Document Status List */}
        <div className="space-y-3 mb-6">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <FileCheck className="w-4 h-4 text-[#0784C8] flex-shrink-0" />
                  <strong className="text-sm text-[#031C2B]">{doc.name}</strong>
                </div>
                <p className="text-xs text-[#667d8f] sm:pl-6">{doc.description}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-center flex-shrink-0 ${
                  doc.status === "Available"
                    ? "bg-[rgba(36,209,127,0.14)] text-[#10854d] border border-[rgba(36,209,127,0.3)]"
                    : doc.status === "Reviewed"
                    ? "bg-[rgba(7,132,200,0.12)] text-[#0784C8] border border-[rgba(7,132,200,0.25)]"
                    : "bg-[#fff8f0] text-[#b85e13] border border-[#fcd9b6]"
                }`}
              >
                {doc.status}
              </span>
            </div>
          ))}
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-xl bg-[#edf5f9] border border-[#c4e3f3] flex items-start gap-3 text-xs text-[#07537d]">
          <Scale className="w-4 h-4 text-[#0784C8] flex-shrink-0 mt-0.5" />
          <div>
            <p className="leading-relaxed">
              <strong>Statutory Legal Notice:</strong> Document availability and advisory review do not replace independent legal, financial, tax, or technical survey advice. Buyers are advised to conduct independent title verification prior to executing binding agreements.
            </p>
            <div className="flex gap-4 mt-2 font-bold text-[#0784C8]">
              <Link href="/why-choose-us" className="hover:underline flex items-center gap-1">
                <span>Our Verification Standards</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <span>•</span>
              <Link href="/disclaimer" className="hover:underline flex items-center gap-1">
                <span>Legal Disclaimers</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
