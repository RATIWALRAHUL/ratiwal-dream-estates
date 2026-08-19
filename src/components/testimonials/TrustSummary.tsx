import { ShieldCheck, FileCheck2, Lock } from "lucide-react";

export function TrustSummary() {
  return (
    <section className="py-8 sm:py-10 bg-[#F5F1E9] border-b border-[rgba(7,26,40,0.08)]" aria-label="Advisory Trust Principles">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[rgba(7,26,40,0.1)]">
          {/* Principle 1 */}
          <div className="py-4 md:py-0 md:px-6 first:pl-0 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] flex items-center justify-center flex-shrink-0 text-[#0784C8] shadow-sm">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-[#031C2B] mb-1">
                Published with Client Consent
              </h3>
              <p className="text-xs text-[#536574] leading-relaxed">
                Stories and quotes are published exclusively with documented client authorization. Personal identity and budgets are protected.
              </p>
            </div>
          </div>

          {/* Principle 2 */}
          <div className="py-4 md:py-0 md:px-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] flex items-center justify-center flex-shrink-0 text-[#0784C8] shadow-sm">
              <FileCheck2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-[#031C2B] mb-1">
                Genuine Advisory Records
              </h3>
              <p className="text-xs text-[#536574] leading-relaxed">
                Verified reviews represent authentic consultations, JDA/CIDCO due diligence engagements, or registered land acquisitions.
              </p>
            </div>
          </div>

          {/* Principle 3 */}
          <div className="py-4 md:py-0 md:px-6 last:pr-0 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] flex items-center justify-center flex-shrink-0 text-[#0784C8] shadow-sm">
              <Lock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-[#031C2B] mb-1">
                Privacy &amp; Data Protection
              </h3>
              <p className="text-xs text-[#536574] leading-relaxed">
                We never disclose confidential client finances, phone numbers, exact residential addresses, or sensitive registry papers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
